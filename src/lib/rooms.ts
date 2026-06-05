import { doc, getDoc, setDoc, updateDoc, deleteField, runTransaction } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { db } from './firebase'
import { Room, GameSettings } from '../types/game'
import { generateRoomCode } from '../utils/roomCode'
import { sanitizeDisplayName } from '../utils/sanitize'
import { DEFAULT_PACK_IDS } from '../data/packs'
import { randomSeed } from './rng'

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  questionSetIds: DEFAULT_PACK_IDS,
  seed: randomSeed(),
  categoryCount: 6,
  questionCountPerCategory: 5,
  pointValues: [100, 200, 300, 400, 500],
  revealSpeedMs: 40,
  answerTimeSeconds: 15,
  postRevealBuzzSeconds: 8,
  allowNegativeScores: true,
  deductOnWrongAnswer: true,
  typoTolerance: true,
  variantMatching: true,
  progressiveReveal: true,
  allowBuzzRebound: true,
  enableFinalRound: true,
  finalQuestionCount: 3,
  maxPlayers: 10,
  roundsCount: 4,
  questionsPerRound: 3,
  mcRatio: 0.5,
}

export async function createRoom(
  host: User,
  displayName: string,
  settings: GameSettings = DEFAULT_SETTINGS,
): Promise<string> {
  let code = generateRoomCode()
  let codeFound = false
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(doc(db, 'rooms', code))
    if (!snap.exists()) { codeFound = true; break }
    code = generateRoomCode()
  }
  if (!codeFound) throw new Error('Could not generate a unique room code. Please try again.')

  const now = Date.now()
  const room: Room = {
    code,
    hostId: host.uid,
    phase: 'lobby',
    settings,
    players: {
      [host.uid]: {
        uid: host.uid,
        name: sanitizeDisplayName(displayName),
        score: 0,
        isHost: true,
        isAnonymous: host.isAnonymous,
      },
    },
    board: {},
    currentChooserId: null,
    chooserRotationIndex: 0,
    clueState: null,
    finalRound: null,
    roundState: null,
    media: null,
    messages: [],
    chat: [],
    createdAt: now,
    expiresAt: now + 2 * 60 * 60 * 1000,
  }

  await setDoc(doc(db, 'rooms', code), room)
  return code
}

export async function joinRoom(code: string, user: User, displayName: string): Promise<void> {
  const roomRef = doc(db, 'rooms', code)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef)
    if (!snap.exists()) throw new Error('Room not found. Check the code and try again.')

    const room = snap.data() as Room
    if (room.phase !== 'lobby') throw new Error('This game has already started.')
    if (Object.keys(room.players).length >= room.settings.maxPlayers) {
      throw new Error('This room is full.')
    }
    if (room.players[user.uid]) return

    tx.update(roomRef, {
      [`players.${user.uid}`]: {
        uid: user.uid,
        name: sanitizeDisplayName(displayName),
        score: 0,
        isHost: false,
        isAnonymous: user.isAnonymous,
      },
    })
  })
}

export async function leaveRoom(code: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), {
    [`players.${userId}`]: deleteField(),
  })
}

// Host retunes the game from the waiting room without disbanding the lobby.
export async function updateRoomSettings(code: string, settings: GameSettings): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), { settings })
}

// Host removes a player from the room. The kicked client detects it's gone from
// room.players and navigates out. The host can't kick themselves.
export async function kickPlayer(code: string, hostId: string, targetUid: string): Promise<void> {
  if (targetUid === hostId) return
  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, 'rooms', code)
    const snap = await tx.get(roomRef)
    if (!snap.exists()) return
    const room = snap.data() as Room
    if (room.hostId !== hostId) return // only the host may kick
    tx.update(roomRef, { [`players.${targetUid}`]: deleteField() })
  })
}
