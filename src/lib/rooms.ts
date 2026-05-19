import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { db } from './firebase'
import { Room, GameSettings } from '../types/game'
import { generateRoomCode } from '../utils/roomCode'
import { sanitizeDisplayName } from '../utils/sanitize'

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  questionSetId: 'built-in',
  totalQuestions: 10,
  secondsPerQuestion: 30,
  revealDurationMs: 5000,
  postRevealWindowMs: 15000,
  speedBonusEnabled: true,
}

export async function createRoom(
  host: User,
  displayName: string,
  settings: GameSettings = DEFAULT_SETTINGS,
): Promise<string> {
  // Find an unused code — collision probability is negligible but handle it
  let code = generateRoomCode()
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(doc(db, 'rooms', code))
    if (!snap.exists()) break
    code = generateRoomCode()
  }

  const now = Date.now()
  const room: Room = {
    code,
    hostId: host.uid,
    status: 'lobby',
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
    currentQuestion: null,
    createdAt: now,
    expiresAt: now + 2 * 60 * 60 * 1000,
  }

  await setDoc(doc(db, 'rooms', code), room)
  return code
}

export async function joinRoom(code: string, user: User, displayName: string): Promise<void> {
  const roomRef = doc(db, 'rooms', code)
  const snap = await getDoc(roomRef)

  if (!snap.exists()) throw new Error('Room not found. Check the code and try again.')

  const room = snap.data() as Room
  if (room.status !== 'lobby') throw new Error('This game has already started.')
  if (Object.keys(room.players).length >= 20) throw new Error('This room is full.')
  if (room.players[user.uid]) return // already joined, navigate without re-writing

  await updateDoc(roomRef, {
    [`players.${user.uid}`]: {
      uid: user.uid,
      name: sanitizeDisplayName(displayName),
      score: 0,
      isHost: false,
      isAnonymous: user.isAnonymous,
    },
  })
}

export async function leaveRoom(code: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), {
    [`players.${userId}`]: deleteField(),
  })
}
