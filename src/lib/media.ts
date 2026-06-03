import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Room, RoomMedia } from '../types/game'
import { currentMediaPositionMs } from './youtube'

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

// Controller loads a new track. Starts paused at position 0 so everyone can
// hit play together (and so autoplay-blocked clients aren't left out of sync).
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

export async function playMedia(room: Room): Promise<void> {
  const m = room.media
  if (!m?.videoId) return
  await writeMedia(room.code, { ...m, status: 'playing', anchorTime: Date.now() })
}

export async function pauseMedia(room: Room): Promise<void> {
  const m = room.media
  if (!m) return
  await writeMedia(room.code, {
    ...m,
    status: 'paused',
    positionMs: currentMediaPositionMs(m),
    anchorTime: Date.now(),
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
