import { useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { useAudio } from '../../hooks/useAudio'
import { loadYouTubeApi, extractVideoId, currentMediaPositionMs } from '../../lib/youtube'
import {
  loadMediaVideo,
  playMedia,
  pauseMedia,
  stopMedia,
  grantMediaControl,
  setMediaTitle,
} from '../../lib/media'

interface Props {
  room: Room
  user: User
  audio: ReturnType<typeof useAudio>
}

// How far local playback may drift from the synced anchor before we re-seek.
const DRIFT_TOLERANCE_SEC = 1.6

export function MediaPlayer({ room, user, audio }: Props) {
  const isHost = user.uid === room.hostId
  const media = room.media
  const controllerId = media?.controllerId ?? room.hostId
  const canControl = isHost || user.uid === controllerId
  const controllerName = room.players[controllerId]?.name ?? 'Host'

  const hostElRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)
  const [localMuted, setLocalMuted] = useState(false)
  const [localVol, setLocalVol] = useState(70)
  const [urlInput, setUrlInput] = useState('')
  const [inputError, setInputError] = useState('')

  const isActive = !!media?.videoId

  // ── Duck the procedural music while shared audio is playing ──────────────────
  useEffect(() => {
    audio.setDucked(isActive && media?.status === 'playing')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, media?.status])

  // ── Create the hidden player once ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    void loadYouTubeApi().then(() => {
      if (cancelled || !hostElRef.current || !window.YT) return
      playerRef.current = new window.YT.Player(hostElRef.current, {
        height: '0',
        width: '0',
        playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            // If we asked to play but the browser blocked autoplay, the player
            // won't reach PLAYING — surface a tap-to-enable prompt.
            if (room.media?.status === 'playing' && e.data === window.YT?.PlayerState.PAUSED) {
              setNeedsGesture(true)
            }
            if (e.data === window.YT?.PlayerState.PLAYING) setNeedsGesture(false)
          },
        },
      })
    })
    return () => {
      cancelled = true
      try { playerRef.current?.destroy() } catch { /* ignore */ }
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Apply local volume / mute ────────────────────────────────────────────────
  useEffect(() => {
    const p = playerRef.current
    if (!ready || !p) return
    try {
      p.setVolume(localVol)
      if (localMuted) p.mute()
      else p.unMute()
    } catch { /* ignore */ }
  }, [ready, localVol, localMuted])

  // ── Reconcile the local player with the synced room.media ────────────────────
  useEffect(() => {
    const p = playerRef.current
    if (!ready || !p) return

    if (!media?.videoId) {
      try { p.stopVideo() } catch { /* ignore */ }
      return
    }

    const targetSec = currentMediaPositionMs(media) / 1000
    let loaded = ''
    try { loaded = p.getVideoData().video_id } catch { /* ignore */ }

    if (loaded !== media.videoId) {
      // New track: cue paused or load playing depending on synced status.
      if (media.status === 'playing') {
        p.loadVideoById({ videoId: media.videoId, startSeconds: targetSec })
      } else {
        p.cueVideoById({ videoId: media.videoId, startSeconds: targetSec })
      }
      return
    }

    // Same track: reconcile transport + correct drift.
    if (media.status === 'playing') {
      let cur = 0
      try { cur = p.getCurrentTime() } catch { /* ignore */ }
      if (Math.abs(cur - targetSec) > DRIFT_TOLERANCE_SEC) p.seekTo(targetSec, true)
      try {
        if (p.getPlayerState() !== window.YT?.PlayerState.PLAYING) p.playVideo()
      } catch { /* ignore */ }
    } else {
      try { p.pauseVideo() } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, media?.videoId, media?.status, media?.anchorTime, media?.positionMs])

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

  // ── Controller actions ───────────────────────────────────────────────────────
  function handleLoad() {
    setInputError('')
    const id = extractVideoId(urlInput)
    if (!id) {
      setInputError('Enter a valid YouTube link or video ID.')
      return
    }
    setUrlInput('')
    // Use the id as a placeholder label; it's upgraded to the real title below.
    void loadMediaVideo(room, id, id).then(() => {
      // A controller-initiated play counts as a user gesture, so kick it off.
      void playMedia(room)
    })
  }

  function enableLocalAudio() {
    const p = playerRef.current
    setNeedsGesture(false)
    try {
      p?.unMute()
      p?.playVideo()
    } catch { /* ignore */ }
  }

  return (
    <div className="panel elevated-panel stack media-player">
      <div className="row between" style={{ alignItems: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 0 }}>Media</div>
        {isActive && (
          <span className="media-now muted">
            {media?.status === 'playing' ? '♪ Playing' : '❚❚ Paused'}
          </span>
        )}
      </div>

      {/* Hidden audio sink */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <div ref={hostElRef} />
      </div>

      {isActive ? (
        <div className="media-track" title={media?.title}>
          {media?.title || 'Custom track'}
        </div>
      ) : (
        <p className="muted" style={{ fontSize: '0.84rem' }}>
          {canControl
            ? 'Paste a YouTube link to play its audio for everyone in the room.'
            : `${controllerName} can start shared audio.`}
        </p>
      )}

      {needsGesture && isActive && (
        <button className="secondary mini-btn" onClick={enableLocalAudio}>
          ▶ Tap to enable audio
        </button>
      )}

      {/* Controller transport */}
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
            <div className="media-row">
              {media?.status === 'playing' ? (
                <button className="secondary mini-btn" onClick={() => void pauseMedia(room)}>❚❚ Pause</button>
              ) : (
                <button className="secondary mini-btn" onClick={() => void playMedia(room)}>▶ Play</button>
              )}
              <button className="secondary mini-btn" onClick={() => void stopMedia(room)}>■ Stop</button>
            </div>
          )}
        </>
      )}

      {/* Local volume — every client controls their own loudness */}
      {isActive && (
        <div className="row gap" style={{ alignItems: 'center' }}>
          <button
            className="secondary mini-btn"
            onClick={() => setLocalMuted((m) => !m)}
            title={localMuted ? 'Unmute' : 'Mute'}
            style={{ opacity: localMuted ? 0.5 : 1 }}
          >
            {localMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={localVol}
            onChange={(e) => { setLocalVol(parseInt(e.target.value)); setLocalMuted(false) }}
            style={{ flex: 1 }}
            title="Your media volume"
          />
        </div>
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
