import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Room, RoomMedia } from '../types/game'

// Media state defaults to host-controlled with nothing loaded.
function baseMedia(room: Room): RoomMedia {
  return (
    room.media ?? {
      videoId: null,
      title: '',
      controllerId: room.hostId,
      status: 'paused',
      positionMs: 0,
      anchorTime: Date.now(),
    }
  )
}

function writeMedia(code: string, media: RoomMedia): Promise<void> {
  return updateDoc(doc(db, 'rooms', code), { media })
}

// Controller broadcasts a new track to the room. Each client loads it into its
// own player; the controller then plays it and others can sync on demand.
export async function loadMediaVideo(room: Room, videoId: string, title: string): Promise<void> {
  await writeMedia(room.code, {
    ...baseMedia(room),
    videoId,
    title,
    status: 'paused',
    positionMs: 0,
    anchorTime: Date.now(),
  })
}

// Controller publishes their own live playback position so other clients can
// "Sync to host". Called on play/pause and on a light heartbeat while playing.
export async function publishMediaPosition(
  room: Room,
  positionMs: number,
  status: 'playing' | 'paused',
): Promise<void> {
  const m = room.media
  if (!m?.videoId) return
  await writeMedia(room.code, {
    ...m,
    positionMs: Math.max(0, positionMs),
    anchorTime: Date.now(),
    status,
  })
}

export async function stopMedia(room: Room): Promise<void> {
  await writeMedia(room.code, {
    ...baseMedia(room),
    videoId: null,
    title: '',
    status: 'paused',
    positionMs: 0,
    anchorTime: Date.now(),
  })
}

// Host grants playback control to a player (or back to themselves).
export async function grantMediaControl(room: Room, controllerId: string): Promise<void> {
  await writeMedia(room.code, { ...baseMedia(room), controllerId })
}

// Replaces the placeholder label with the real video title once it's known.
export async function setMediaTitle(room: Room, title: string): Promise<void> {
  const m = room.media
  if (!m) return
  await writeMedia(room.code, { ...m, title })
}
