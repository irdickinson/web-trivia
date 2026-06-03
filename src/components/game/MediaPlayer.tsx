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
  seekMedia,
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

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
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
  // Latest media for the player's onStateChange callback (avoids a stale closure).
  const mediaRef = useRef(media)
  mediaRef.current = media

  const [ready, setReady] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)
  const [localMuted, setLocalMuted] = useState(false)
  const [localVol, setLocalVol] = useState(70)
  const [urlInput, setUrlInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [pos, setPos] = useState(0)
  const [dur, setDur] = useState(0)
  // Non-null while the user is dragging the seek bar (don't fight their drag).
  const [scrub, setScrub] = useState<number | null>(null)

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
      // A real (non-zero) size is required — browsers won't play a 0×0 player.
      // The wrapper keeps it off-screen.
      playerRef.current = new window.YT.Player(hostElRef.current, {
        height: '180',
        width: '320',
        playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, fs: 0 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            const m = mediaRef.current
            if (e.data === window.YT?.PlayerState.PLAYING) {
              setNeedsGesture(false)
            } else if (
              m?.status === 'playing' &&
              (e.data === window.YT?.PlayerState.PAUSED ||
                e.data === window.YT?.PlayerState.UNSTARTED)
            ) {
              // We're supposed to be playing but the browser blocked autoplay.
              setNeedsGesture(true)
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

  // ── Poll local playback position for the progress bar ────────────────────────
  useEffect(() => {
    if (!ready || !isActive) return
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (!p) return
      try {
        setDur(p.getDuration() || 0)
        if (scrub === null) setPos(p.getCurrentTime() || 0)
      } catch { /* ignore */ }
    }, 500)
    return () => window.clearInterval(id)
  }, [ready, isActive, scrub])

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
    setPos(0)
    setDur(0)
    // Cue paused at the start; the controller presses Play to begin (a direct
    // user gesture is what unblocks audio playback).
    void loadMediaVideo(room, id, id)
  }

  function handlePlay() {
    // Start the local player inside the click handler so it counts as a gesture.
    const p = playerRef.current
    try {
      p?.unMute()
      setLocalMuted(false)
      p?.playVideo()
    } catch { /* ignore */ }
    setNeedsGesture(false)
    void playMedia(room)
  }

  function handlePause() {
    try { playerRef.current?.pauseVideo() } catch { /* ignore */ }
    void pauseMedia(room)
  }

  function commitSeek(sec: number) {
    try { playerRef.current?.seekTo(sec, true) } catch { /* ignore */ }
    setPos(sec)
    setScrub(null)
    void seekMedia(room, sec * 1000)
  }

  function enableLocalAudio() {
    const p = playerRef.current
    setNeedsGesture(false)
    try {
      p?.unMute()
      setLocalMuted(false)
      p?.playVideo()
    } catch { /* ignore */ }
  }

  const barValue = scrub ?? pos

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

      {/* Hidden, off-screen audio sink */}
      <div className="media-sink" aria-hidden="true">
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

      {/* Progress / seek bar */}
      {isActive && (
        <div className="media-progress">
          <input
            type="range"
            min={0}
            max={Math.max(dur, 1)}
            step={1}
            value={Math.min(barValue, Math.max(dur, 1))}
            disabled={!canControl}
            onChange={(e) => setScrub(parseFloat(e.target.value))}
            onMouseUp={(e) => commitSeek(parseFloat((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => commitSeek(parseFloat((e.target as HTMLInputElement).value))}
            title="Seek"
          />
          <div className="media-time">
            <span>{formatTime(barValue)}</span>
            <span>{formatTime(dur)}</span>
          </div>
        </div>
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
                <button className="secondary mini-btn" onClick={handlePause}>❚❚ Pause</button>
              ) : (
                <button className="secondary mini-btn" onClick={handlePlay}>▶ Play</button>
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
