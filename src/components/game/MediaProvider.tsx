import {
  createContext,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { loadYouTubeApi, currentMediaPositionMs } from '../../lib/youtube'
import { publishMediaPosition, playNext, setMediaTitle, syncAll } from '../../lib/media'

// Shared media context. The actual YouTube player is owned by <SharedVideo>, which
// renders the iframe INLINE (it is never reparented — moving an iframe in the DOM
// forces it to reload, which interrupts playback). The header status bar and the
// rail panel read state + drive controls through this context.
//
// Playback is host/gesture-initiated, not forced autoplay: when the controller
// broadcasts a track they play it (their click is a real user gesture, so it's
// reliable); everyone else cues it paused and starts via their own play button or
// when the host hits "Play for everyone".
interface MediaPlayerApi {
  ready: boolean
  hasMedia: boolean
  title: string
  controllerName: string
  canControl: boolean
  localPlaying: boolean
  volume: number // 0..100
  setVolume: (v: number) => void
  togglePlay: () => void
  syncToHost: () => void // local: seek my player to the host position and play
  broadcastSync: () => void // controller: play here + tell everyone to play in sync
  collapsed: boolean // hide the video frame, keep audio + title
  toggleCollapsed: () => void
  // ── Internal wiring used by <SharedVideo> ──
  room: Room
  user: User
  playerRef: MutableRefObject<YTPlayer | null>
  volumeRef: MutableRefObject<number>
  setReady: (v: boolean) => void
  setLocalPlaying: (v: boolean) => void
}

const MediaPlayerContext = createContext<MediaPlayerApi | null>(null)

export function useMediaPlayer(): MediaPlayerApi {
  const ctx = useContext(MediaPlayerContext)
  if (!ctx) throw new Error('useMediaPlayer must be used within a MediaProvider')
  return ctx
}

interface Props {
  room: Room
  user: User
  children: ReactNode
}

export function MediaProvider({ room, user, children }: Props) {
  const media = room.media
  const controllerId = media?.controllerId ?? room.hostId
  const canControl = user.uid === room.hostId || user.uid === controllerId
  const controllerName = room.players[controllerId]?.name ?? 'Host'
  const hasMedia = !!media?.videoId

  const playerRef = useRef<YTPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [localPlaying, setLocalPlaying] = useState(false)
  const [volume, setVolumeState] = useState(80)
  const [collapsed, setCollapsed] = useState(false)

  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const roomRef = useRef(room)
  roomRef.current = room

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    try { playerRef.current?.setVolume(v) } catch { /* ignore */ }
  }, [])

  // Read state straight off the player so the toggle never goes stale.
  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    try {
      if (p.getPlayerState() === window.YT?.PlayerState.PLAYING) p.pauseVideo()
      else p.playVideo()
    } catch { /* ignore */ }
  }, [])

  const syncToHost = useCallback(() => {
    const p = playerRef.current
    const m = roomRef.current.media
    if (!p || !m?.videoId) return
    try { p.seekTo(currentMediaPositionMs(m) / 1000, true); p.playVideo() } catch { /* ignore */ }
  }, [])

  // Controller: play locally (this click is a user gesture) then ask everyone to
  // seek to our position and play.
  const broadcastSync = useCallback(() => {
    const p = playerRef.current
    try { p?.playVideo() } catch { /* ignore */ }
    const t = (p?.getCurrentTime?.() ?? 0) * 1000
    void syncAll(roomRef.current, t)
  }, [])

  const api: MediaPlayerApi = {
    ready,
    hasMedia,
    title: media?.title || '',
    controllerName,
    canControl,
    localPlaying,
    volume,
    setVolume,
    togglePlay,
    syncToHost,
    broadcastSync,
    collapsed,
    toggleCollapsed: () => setCollapsed((c) => !c),
    room,
    user,
    playerRef,
    volumeRef,
    setReady,
    setLocalPlaying,
  }

  return <MediaPlayerContext.Provider value={api}>{children}</MediaPlayerContext.Provider>
}

// The inline video frame. Owns the YouTube player for the current screen. Rendered
// once per screen (rail / waiting room); the iframe stays put while that screen is
// mounted, so playback is never interrupted by tab switches or re-renders.
export function SharedVideo() {
  const {
    room, canControl, collapsed, hasMedia, ready,
    playerRef, volumeRef, setReady, setLocalPlaying,
  } = useMediaPlayer()
  const media = room.media

  const hostElRef = useRef<HTMLDivElement>(null)
  const roomRef = useRef(room)
  roomRef.current = room
  const canControlRef = useRef(canControl)
  canControlRef.current = canControl
  const loadedIdRef = useRef<string | null>(null)
  const lastNonceRef = useRef<number>(media?.syncNonce ?? 0)

  // ── Create the player once for this screen ────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    void loadYouTubeApi().then(() => {
      if (cancelled || !hostElRef.current || !window.YT) return
      playerRef.current = new window.YT.Player(hostElRef.current, {
        height: '100%',
        width: '100%',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            try { playerRef.current?.setVolume(volumeRef.current) } catch { /* ignore */ }
            setReady(true)
          },
          onStateChange: (e) => {
            const state = window.YT?.PlayerState
            setLocalPlaying(e.data === state?.PLAYING)
            if (canControlRef.current) {
              const p = playerRef.current
              if (e.data === state?.PLAYING) {
                void publishMediaPosition(roomRef.current, (p?.getCurrentTime() ?? 0) * 1000, 'playing')
              } else if (e.data === state?.PAUSED) {
                void publishMediaPosition(roomRef.current, (p?.getCurrentTime() ?? 0) * 1000, 'paused')
              } else if (e.data === state?.ENDED) {
                void playNext(roomRef.current) // advance the queue (or stop if empty)
              }
            }
          },
        },
      })
    })
    return () => {
      cancelled = true
      try { playerRef.current?.destroy() } catch { /* ignore */ }
      playerRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── React to the broadcast track. Controller plays (their gesture); others cue
  //    paused. A bumped syncNonce ("Play for everyone" / "Sync all") seeks + plays.
  useEffect(() => {
    const p = playerRef.current
    if (!ready || !p) return
    const m = roomRef.current.media

    if (!m?.videoId) {
      if (loadedIdRef.current) {
        try { p.stopVideo() } catch { /* ignore */ }
        loadedIdRef.current = null
        setLocalPlaying(false)
      }
      lastNonceRef.current = m?.syncNonce ?? 0
      return
    }

    const startSec = currentMediaPositionMs(m) / 1000
    const newVideo = loadedIdRef.current !== m.videoId
    const newNonce = (m.syncNonce ?? 0) !== lastNonceRef.current

    if (newVideo) {
      loadedIdRef.current = m.videoId
      lastNonceRef.current = m.syncNonce ?? 0
      try {
        if (canControl && m.status === 'playing') {
          p.loadVideoById({ videoId: m.videoId, startSeconds: startSec })
        } else {
          p.cueVideoById({ videoId: m.videoId, startSeconds: startSec })
        }
      } catch { /* ignore */ }
    } else if (newNonce) {
      lastNonceRef.current = m.syncNonce ?? 0
      try { p.seekTo(startSec, true); p.playVideo() } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, media?.videoId, media?.syncNonce])

  // ── Controller heartbeat: keep the published position fresh while playing ─────
  useEffect(() => {
    if (!ready || !canControl) return
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (!p) return
      try {
        if (p.getPlayerState() === window.YT?.PlayerState.PLAYING) {
          void publishMediaPosition(roomRef.current, (p.getCurrentTime() || 0) * 1000, 'playing')
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, canControl])

  // ── Upgrade the placeholder label to the real video title (controller only) ───
  useEffect(() => {
    if (!ready || !canControl || !media?.videoId) return
    const t = window.setTimeout(() => {
      const p = playerRef.current
      if (!p) return
      try {
        const data = p.getVideoData()
        if (data.video_id === media.videoId && data.title && data.title !== media.title) {
          void setMediaTitle(roomRef.current, data.title)
        }
      } catch { /* metadata not ready yet */ }
    }, 1200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, canControl, media?.videoId, media?.title])

  return (
    <div className={`media-video-slot${collapsed || !hasMedia ? ' collapsed' : ''}`}>
      <div ref={hostElRef} className="yt-player-container" />
    </div>
  )
}
