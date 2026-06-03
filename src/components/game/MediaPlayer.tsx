import { useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { useAudio } from '../../hooks/useAudio'
import { loadYouTubeApi, extractVideoId, currentMediaPositionMs } from '../../lib/youtube'
import {
  loadMediaVideo,
  publishMediaPosition,
  stopMedia,
  grantMediaControl,
  setMediaTitle,
} from '../../lib/media'

interface Props {
  room: Room
  user: User
  audio: ReturnType<typeof useAudio>
}

export function MediaPlayer({ room, user, audio }: Props) {
  const isHost = user.uid === room.hostId
  const media = room.media
  const controllerId = media?.controllerId ?? room.hostId
  const canControl = isHost || user.uid === controllerId
  const controllerName = room.players[controllerId]?.name ?? 'Host'
  const isActive = !!media?.videoId

  const hostElRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  // Latest values for the player's once-bound callbacks.
  const roomRef = useRef(room)
  roomRef.current = room
  const mediaRef = useRef(media)
  mediaRef.current = media
  const canControlRef = useRef(canControl)
  canControlRef.current = canControl
  // Which video the local player has loaded (so we don't re-cue and reset it).
  const loadedIdRef = useRef<string | null>(null)

  const [ready, setReady] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [localPlaying, setLocalPlaying] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [inputError, setInputError] = useState('')

  // ── Duck the procedural music while THIS client is playing the video ─────────
  useEffect(() => {
    audio.setDucked(localPlaying)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPlaying])

  // ── Create the visible player once (native controls = reliable + per-viewer ads)
  useEffect(() => {
    let cancelled = false
    void loadYouTubeApi().then(() => {
      if (cancelled || !hostElRef.current || !window.YT) return
      playerRef.current = new window.YT.Player(hostElRef.current, {
        height: '100%',
        width: '100%',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            const playing = e.data === window.YT?.PlayerState.PLAYING
            setLocalPlaying(playing)
            // The controller publishes their position so others can sync to it.
            if (canControlRef.current) {
              const p = playerRef.current
              if (e.data === window.YT?.PlayerState.PLAYING) {
                void publishMediaPosition(roomRef.current, (p?.getCurrentTime() ?? 0) * 1000, 'playing')
              } else if (e.data === window.YT?.PlayerState.PAUSED) {
                void publishMediaPosition(roomRef.current, (p?.getCurrentTime() ?? 0) * 1000, 'paused')
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
    }
  }, [])

  // ── Load the broadcast track locally when it changes (cued, not autoplayed) ──
  useEffect(() => {
    const p = playerRef.current
    if (!ready || !p) return

    if (!media?.videoId) {
      if (loadedIdRef.current) {
        try { p.stopVideo() } catch { /* ignore */ }
        loadedIdRef.current = null
        setLocalPlaying(false)
      }
      return
    }

    if (loadedIdRef.current !== media.videoId) {
      loadedIdRef.current = media.videoId
      const startSec = currentMediaPositionMs(media) / 1000
      // Cue (paused) — each viewer presses play themselves so their own ads run.
      try { p.cueVideoById({ videoId: media.videoId, startSeconds: startSec }) } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, media?.videoId, media?.positionMs, media?.anchorTime])

  // ── Controller heartbeat: keep the published position fresh while playing ────
  useEffect(() => {
    if (!ready || !canControl || !localPlaying) return
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (!p) return
      try { void publishMediaPosition(roomRef.current, (p.getCurrentTime() || 0) * 1000, 'playing') } catch { /* ignore */ }
    }, 5000)
    return () => window.clearInterval(id)
  }, [ready, canControl, localPlaying])

  // ── Upgrade the placeholder label to the real video title (controller only) ──
  useEffect(() => {
    if (!ready || !canControl || !media?.videoId) return
    const p = playerRef.current
    if (!p) return
    const t = window.setTimeout(() => {
      try {
        const data = p.getVideoData()
        if (data.video_id === media.videoId && data.title && data.title !== media.title) {
          void setMediaTitle(room, data.title)
        }
      } catch { /* metadata not ready yet */ }
    }, 1200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, canControl, media?.videoId, media?.title])

  // ── Actions ──────────────────────────────────────────────────────────────────
  function handleLoad() {
    setInputError('')
    const id = extractVideoId(urlInput)
    if (!id) {
      setInputError('Enter a valid YouTube link or video ID.')
      return
    }
    setUrlInput('')
    setCollapsed(false)
    void loadMediaVideo(room, id, id)
  }

  function handleSyncToHost() {
    const p = playerRef.current
    const m = mediaRef.current
    if (!p || !m?.videoId) return
    setCollapsed(false)
    const targetSec = currentMediaPositionMs(m) / 1000
    try {
      p.seekTo(targetSec, true)
      p.playVideo()
    } catch { /* ignore */ }
  }

  return (
    <div className="panel elevated-panel stack media-player">
      <div className="row between" style={{ alignItems: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 0 }}>Media</div>
        <div className="row gap" style={{ gap: '0.5rem', alignItems: 'center' }}>
          {isActive && (
            <span className="media-now muted">
              {canControl ? 'You control playback' : `${controllerName} hosting`}
            </span>
          )}
          {isActive && (
            <button
              className="secondary mini-btn"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? 'Show video' : 'Hide video'}
            >
              {collapsed ? '▸' : '▾'}
            </button>
          )}
        </div>
      </div>

      {/* Visible embed (required by the YouTube API terms). Native controls let
          each viewer play/seek and handle their own ads / Premium. */}
      <div className={`media-video${collapsed || !isActive ? ' collapsed' : ''}`}>
        <div ref={hostElRef} />
      </div>

      {isActive ? (
        <div className="media-track" title={media?.title}>
          {media?.title || 'Custom track'}
        </div>
      ) : (
        <p className="muted" style={{ fontSize: '0.84rem' }}>
          {canControl
            ? 'Paste a YouTube link (or share one in chat) to play it in the room.'
            : `${controllerName} can start shared media.`}
        </p>
      )}

      {/* Everyone presses play in their own player; non-controllers can realign. */}
      {isActive && !canControl && (
        <button className="secondary mini-btn" onClick={handleSyncToHost}>
          ⟲ Sync to host
        </button>
      )}

      {/* Controller: broadcast a track + stop */}
      {canControl && (
        <>
          <div className="row gap" style={{ gap: '0.4rem' }}>
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoad() }}
              placeholder="YouTube link or ID"
              style={{ flex: 1, fontSize: '0.84rem', padding: '0.5rem 0.6rem' }}
            />
            <button className="mini-btn" onClick={handleLoad}>Load</button>
          </div>
          {inputError && <p className="error" style={{ fontSize: '0.8rem' }}>{inputError}</p>}
          {isActive && (
            <button className="secondary mini-btn" onClick={() => void stopMedia(room)}>■ Stop for everyone</button>
          )}
        </>
      )}

      {/* Host grants control */}
      {isHost && (
        <label className="media-grant">
          <span className="chip-label">Control</span>
          <select
            value={controllerId}
            onChange={(e) => void grantMediaControl(room, e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.5rem' }}
          >
            {Object.values(room.players).map((p) => (
              <option key={p.uid} value={p.uid}>
                {p.name}{p.uid === room.hostId ? ' (host)' : ''}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
