export type SfxName = 'buzz' | 'correct' | 'incorrect' | 'timeout' | 'adjust' | 'tick'

interface TrackDef {
  name: string
  bpm: number
  steps: number
  kick: number[]
  hat: number[]
  bass: [number, number][]
}

export const TRACKS: TrackDef[] = [
  { name: 'Midnight Board', bpm: 94, steps: 8, kick: [0, 4], hat: [0, 2, 4, 6], bass: [[0, 174], [2, 220], [4, 196], [6, 146]] },
  { name: 'Velvet Clue', bpm: 102, steps: 8, kick: [0, 3, 4, 7], hat: [0, 2, 4, 6], bass: [[0, 164], [2, 164], [4, 196], [6, 246]] },
  { name: 'Final Round', bpm: 88, steps: 8, kick: [0, 4], hat: [1, 3, 5, 7], bass: [[0, 146], [2, 174], [4, 130], [6, 196]] },
]

export const SFX_TONES: Record<SfxName, [number, number, number][]> = {
  buzz:      [[420, 0.09, 0.08], [540, 0.12, 0.06]],
  correct:   [[540, 0.12, 0.08], [680, 0.16, 0.08], [820, 0.22, 0.07]],
  incorrect: [[320, 0.14, 0.11], [240, 0.18, 0.09]],
  timeout:   [[300, 0.14, 0.09], [220, 0.18, 0.08], [170, 0.22, 0.07]],
  adjust:    [[500, 0.1, 0.05],  [500, 0.1, 0.05]],
  tick:      [[960, 0.05, 0.06]],
}

// Each tone: [freq (Hz), peak gain, duration (s)]
export function playToneSequence(
  ctx: AudioContext,
  tones: [number, number, number][],
  volume: number,
): void {
  let t = ctx.currentTime
  for (const [freq, gain, dur] of tones) {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.connect(env)
    env.connect(ctx.destination)
    osc.frequency.value = freq
    env.gain.setValueAtTime(gain * volume, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t)
    osc.stop(t + dur + 0.01)
    t += dur * 0.8
  }
}

export function playMusicStep(
  ctx: AudioContext,
  track: TrackDef,
  step: number,
  volume: number,
): void {
  const t = ctx.currentTime
  const stepDur = (60 / track.bpm / (track.steps / 2))

  if (track.kick.includes(step)) {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.connect(env)
    env.connect(ctx.destination)
    osc.frequency.setValueAtTime(160, t)
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08)
    env.gain.setValueAtTime(0.5 * volume, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    osc.start(t)
    osc.stop(t + 0.2)
  }

  if (track.hat.includes(step)) {
    const bufSize = ctx.sampleRate * 0.05
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const hipass = ctx.createBiquadFilter()
    hipass.type = 'highpass'
    hipass.frequency.value = 7000
    const env = ctx.createGain()
    src.connect(hipass)
    hipass.connect(env)
    env.connect(ctx.destination)
    env.gain.setValueAtTime(0.15 * volume, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    src.start(t)
    src.stop(t + 0.1)
  }

  const bassNote = track.bass.find(([s]) => s === step)
  if (bassNote) {
    const [, freq] = bassNote
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'sawtooth'
    osc.connect(env)
    env.connect(ctx.destination)
    osc.frequency.value = freq
    env.gain.setValueAtTime(0.12 * volume, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + stepDur * 0.9)
    osc.start(t)
    osc.stop(t + stepDur)
  }
}
