import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  runTransaction,
} from 'firebase/firestore'
import { db } from './firebase'
import { Room } from '../types/game'
import { PlayerStats } from '../types/stats'

const LEADERBOARD_LIMIT = 50

// Stable id for a single played game so a finish is never counted twice, even
// if the room is later replayed (createdAt changes only on a fresh room).
function gameKey(room: Room): string {
  return `${room.code}-${room.createdAt}`
}

// Records the signed-in player's result for a finished game. Idempotent per
// game via lastGameKey. Anonymous (guest) players are not tracked.
export async function recordGameResult(room: Room, uid: string): Promise<void> {
  const me = room.players[uid]
  if (!me || me.isAnonymous) return
  if (room.phase !== 'finished') return

  const topScore = Math.max(...Object.values(room.players).map((p) => p.score))
  const won = me.score === topScore
  const key = gameKey(room)
  const ref = doc(db, 'stats', uid)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const prev = snap.exists() ? (snap.data() as PlayerStats) : null
    if (prev?.lastGameKey === key) return

    const next: PlayerStats = {
      uid,
      displayName: me.name,
      gamesPlayed: (prev?.gamesPlayed ?? 0) + 1,
      wins: (prev?.wins ?? 0) + (won ? 1 : 0),
      totalScore: (prev?.totalScore ?? 0) + me.score,
      bestScore: Math.max(prev?.bestScore ?? 0, me.score),
      updatedAt: Date.now(),
      lastGameKey: key,
    }
    tx.set(ref, next)
  })
}

// Top players by cumulative score. Single-field order keeps this index-free.
export async function fetchLeaderboard(): Promise<PlayerStats[]> {
  const q = query(
    collection(db, 'stats'),
    orderBy('totalScore', 'desc'),
    limit(LEADERBOARD_LIMIT),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as PlayerStats)
}
