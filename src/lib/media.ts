import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Room, RoomMedia, MediaQueueItem } from '../types/game'

const HISTORY_CAP = 15

// Media state defaults to host-controlled with nothing loaded.
function baseMedia(room: Room): RoomMedia {
  const m = room.media
  if (m) return { ...m, queue: m.queue ?? [], history: m.history ?? [], syncNonce: m.syncNonce ?? 0 }
  return {
    videoId: null,
    title: '',
    controllerId: room.hostId,
    status: 'paused',
    positionMs: 0,
    anchorTime: Date.now(),
    queue: [],
    history: [],
    syncNonce: 0,
  }
}

function writeMedia(code: string, media: RoomMedia): Promise<void> {
  return updateDoc(doc(db, 'rooms', code), { media })
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Records the currently-playing track into history (newest first, deduped by
// videoId, capped) before it's replaced by a new one.
function pushHistory(media: RoomMedia): MediaQueueItem[] {
  if (!media.videoId) return media.history
  const entry: MediaQueueItem = {
    id: newId(),
    videoId: media.videoId,
    title: media.title || media.videoId,
    addedBy: media.controllerId,
    addedByName: '',
  }
  const deduped = media.history.filter((h) => h.videoId !== media.videoId)
  return [entry, ...deduped].slice(0, HISTORY_CAP)
}

// Controller broadcasts a new track to the room. The outgoing track is filed into
// history and syncNonce is bumped so every client auto-plays the new one in sync.
export async function loadMediaVideo(room: Room, videoId: string, title: string): Promise<void> {
  const base = baseMedia(room)
  await writeMedia(room.code, {
    ...base,
    history: pushHistory(base),
    videoId,
    title,
    status: 'playing',
    positionMs: 0,
    anchorTime: Date.now(),
    syncNonce: base.syncNonce + 1,
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
    ...baseMedia(room),
    positionMs: Math.max(0, positionMs),
    anchorTime: Date.now(),
    status,
  })
}

// Re-broadcast the controller's current position with a bumped syncNonce so every
// client seeks to it and plays. "Sync all" / "Play for everyone".
export async function syncAll(room: Room, positionMs: number): Promise<void> {
  const base = baseMedia(room)
  if (!base.videoId) return
  await writeMedia(room.code, {
    ...base,
    positionMs: Math.max(0, positionMs),
    anchorTime: Date.now(),
    status: 'playing',
    syncNonce: base.syncNonce + 1,
  })
}

export async function stopMedia(room: Room): Promise<void> {
  const base = baseMedia(room)
  await writeMedia(room.code, {
    ...base,
    history: pushHistory(base),
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
  await writeMedia(room.code, { ...baseMedia(room), title })
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
      status: 'playing',
      positionMs: 0,
      anchorTime: Date.now(),
      syncNonce: base.syncNonce + 1,
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
    history: pushHistory(base),
    videoId: item.videoId,
    title: item.title,
    status: 'playing',
    positionMs: 0,
    anchorTime: Date.now(),
    syncNonce: base.syncNonce + 1,
    queue: base.queue.filter((q) => q.id !== itemId),
  })
}

// Replay a previously-played track from history (does not remove it from history).
export async function replayFromHistory(room: Room, item: MediaQueueItem): Promise<void> {
  await loadMediaVideo(room, item.videoId, item.title)
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
    history: pushHistory(base),
    videoId: next.videoId,
    title: next.title,
    status: 'playing',
    positionMs: 0,
    anchorTime: Date.now(),
    syncNonce: base.syncNonce + 1,
    queue: rest,
  })
}
