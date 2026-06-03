import { RoomMedia } from '../types/game'

let apiPromise: Promise<void> | null = null

// Loads the YouTube IFrame Player API once and resolves when YT.Player exists.
export function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return apiPromise
}

// Pulls a video id out of common YouTube URL shapes or accepts a raw 11-char id.
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1)
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (url.hostname.endsWith('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[\w-]{11}$/.test(v)) return v
      const embed = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/)
      if (embed) return embed[1]
    }
  } catch {
    return null
  }
  return null
}

// Where playback should be right now, in milliseconds, given the synced anchor.
export function currentMediaPositionMs(media: RoomMedia): number {
  if (media.status !== 'playing') return media.positionMs
  return media.positionMs + (Date.now() - media.anchorTime)
}
