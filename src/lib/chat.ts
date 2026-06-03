import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from './firebase'
import { Room, ChatMessage } from '../types/game'

const MAX_LEN = 300

function newId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

// Appends a chat message. Text is stored raw and rendered as text (React escapes
// it); only http(s) links are turned into anchors at display time.
export async function sendChat(room: Room, uid: string, name: string, text: string): Promise<void> {
  const trimmed = text.trim().slice(0, MAX_LEN)
  if (!trimmed) return
  const msg: ChatMessage = {
    id: newId(),
    uid,
    name,
    text: trimmed,
    createdAt: Date.now(),
  }
  await updateDoc(doc(db, 'rooms', room.code), { chat: arrayUnion(msg) })
}
