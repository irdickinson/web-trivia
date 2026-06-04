// Seeded pseudo-random number generator.
//
// Board building and final-round selection run through this so that a given
// seed always produces the same board — handy for sharing a setup or
// reproducing a game. xmur3 hashes the string seed into a 32-bit state, which
// mulberry32 turns into a deterministic stream of floats in [0, 1).

export interface Rng {
  next(): number // float in [0, 1)
  int(maxExclusive: number): number // integer in [0, maxExclusive)
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRng(seed: string): Rng {
  const seedFn = xmur3(seed || 'web-trivia')
  const rand = mulberry32(seedFn())
  return {
    next: rand,
    int: (maxExclusive) => Math.floor(rand() * maxExclusive),
  }
}

export function seededShuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Short, friendly seed for the lobby's seed field (e.g. "K3F9Q2").
export function randomSeed(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}
