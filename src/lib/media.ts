import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Room, RoomMedia, MediaQueueItem } from '../types/game'

// Media state defaults to host-controlled with nothing loaded.
function baseMedia(room: Room): RoomMedia {
  const m = room.media
  if (m) return { ...m, queue: m.queue ?? [] }
  return {
    videoId: null,
    title: '',
    controllerId: room.hostId,
    status: 'paused',
    positionMs: 0,
    anchorTime: Date.now(),
    queue: [],
  }
}

function writeMedia(code: string, media: RoomMedia): Promise<void> {
  return updateDoc(doc(db, 'rooms', code), { media })
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
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
    queue: m.queue ?? [],
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
  await writeMedia(room.code, { ...m, queue: m.queue ?? [], title })
}

// ── Queue ─────────────────────────────────────────────────────────────────────
// Anyone in the room may append; the controller/host manages ordering + playback.

export async function enqueueMedia(
  room: Room,
  videoId: string,
  title: string,
  uid: string,
  name: string,
): Promise<void> {
  const base = baseMedia(room)
  const item: MediaQueueItem = { id: newId(), videoId, title, addedBy: uid, addedByName: name }
  // If nothing is playing, start it immediately; otherwise queue it up.
  if (!base.videoId) {
    await writeMedia(room.code, {
      ...base,
      videoId,
      title,
      status: 'paused',
      positionMs: 0,
      anchorTime: Date.now(),
    })
    return
  }
  await writeMedia(room.code, { ...base, queue: [...base.queue, item] })
}

export async function removeFromQueue(room: Room, itemId: string): Promise<void> {
  const base = baseMedia(room)
  await writeMedia(room.code, { ...base, queue: base.queue.filter((q) => q.id !== itemId) })
}

export async function moveQueueItem(room: Room, itemId: string, dir: -1 | 1): Promise<void> {
  const base = baseMedia(room)
  const queue = [...base.queue]
  const i = queue.findIndex((q) => q.id === itemId)
  if (i < 0) return
  const j = i + dir
  if (j < 0 || j >= queue.length) return
  ;[queue[i], queue[j]] = [queue[j], queue[i]]
  await writeMedia(room.code, { ...base, queue })
}

// Promote a specific queued item to now-playing and drop it from the queue.
export async function playQueueItem(room: Room, itemId: string): Promise<void> {
  const base = baseMedia(room)
  const item = base.queue.find((q) => q.id === itemId)
  if (!item) return
  await writeMedia(room.code, {
    ...base,
    videoId: item.videoId,
    title: item.title,
    status: 'paused',
    positionMs: 0,
    anchorTime: Date.now(),
    queue: base.queue.filter((q) => q.id !== itemId),
  })
}

// Advance to the head of the queue (used for autoplay-next when a video ends).
// Clears playback when the queue is empty.
export async function playNext(room: Room): Promise<void> {
  const base = baseMedia(room)
  const [next, ...rest] = base.queue
  if (!next) {
    await stopMedia(room)
    return
  }
  await writeMedia(room.code, {
    ...base,
    videoId: next.videoId,
    title: next.title,
    status: 'playing',
    positionMs: 0,
    anchorTime: Date.now(),
    queue: rest,
  })
}
