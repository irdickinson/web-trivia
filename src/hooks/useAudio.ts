import { useRef, useState, useEffect } from 'react'
import { TRACKS, SFX_TONES, playToneSequence, playMusicStep, SfxName } from '../lib/audio'

export interface AudioControls {
  musicPaused: boolean
  trackIndex: number
  musicVol: number
  sfxEnabled: boolean
  sfxVol: number
  trackName: string
  ducked: boolean
  toggleMusic: () => void
  prevTrack: () => void
  nextTrack: () => void
  setMusicVol: (v: number) => void
  toggleSfx: () => void
  setSfxVol: (v: number) => void
  playSfx: (name: SfxName) => void
  // Temporarily silence procedural music without touching the user's paused
  // preference — used while shared YouTube audio is playing.
  setDucked: (v: boolean) => void
}

export function useAudio(): AudioControls {
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)

  // Refs hold the live values for the recursive timer callback (avoids stale closures)
  const musicPausedRef = useRef(false)
  const trackIdxRef = useRef(0)
  const musicVolRef = useRef(0.5)
  const sfxEnabledRef = useRef(true)
  const sfxVolRef = useRef(0.7)
  const duckedRef = useRef(false)

  // State drives re-renders for UI
  const [musicPaused, setMusicPaused] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [musicVol, setMusicVolState] = useState(0.5)
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [sfxVol, setSfxVolState] = useState(0.7)
  const [ducked, setDuckedState] = useState(false)

  // scheduleRef always points to the latest version so recursive timer is safe
  const scheduleRef = useRef<() => void>(() => {})
  scheduleRef.current = () => {
    if (musicPausedRef.current || duckedRef.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const track = TRACKS[trackIdxRef.current]
    playMusicStep(ctx, track, stepRef.current, musicVolRef.current * 0.6)
    stepRef.current = (stepRef.current + 1) % track.steps
    const stepMs = (60 / track.bpm / (track.steps / 2)) * 1000
    timerRef.current = window.setTimeout(() => scheduleRef.current(), stepMs)
  }

  // Restart/stop music loop when paused or track changes
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    stepRef.current = 0
    if (!musicPaused && !ducked) {
      timerRef.current = window.setTimeout(() => scheduleRef.current(), 50)
    }
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [musicPaused, trackIndex, ducked])

  function getCtx(): AudioContext | null {
    if (!ctxRef.current) {
      try { ctxRef.current = new AudioContext() } catch { return null }
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }

  return {
    musicPaused,
    trackIndex,
    musicVol,
    sfxEnabled,
    sfxVol,
    trackName: TRACKS[trackIndex].name,
    ducked,

    toggleMusic() {
      const next = !musicPausedRef.current
      musicPausedRef.current = next
      setMusicPaused(next)
    },
    prevTrack() {
      const next = (trackIdxRef.current - 1 + TRACKS.length) % TRACKS.length
      trackIdxRef.current = next
      stepRef.current = 0
      setTrackIndex(next)
    },
    nextTrack() {
      const next = (trackIdxRef.current + 1) % TRACKS.length
      trackIdxRef.current = next
      stepRef.current = 0
      setTrackIndex(next)
    },
    setMusicVol(v) {
      musicVolRef.current = v
      setMusicVolState(v)
    },
    toggleSfx() {
      const next = !sfxEnabledRef.current
      sfxEnabledRef.current = next
      setSfxEnabled(next)
    },
    setSfxVol(v) {
      sfxVolRef.current = v
      setSfxVolState(v)
    },
    playSfx(name: SfxName) {
      if (!sfxEnabledRef.current) return
      const ctx = getCtx()
      if (!ctx) return
      playToneSequence(ctx, SFX_TONES[name], sfxVolRef.current)
    },
    setDucked(v: boolean) {
      duckedRef.current = v
      setDuckedState(v)
    },
  }
}
