import { distance } from 'fastest-levenshtein'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

export function isAnswerCorrect(
  submitted: string,
  correct: string,
  acceptableAnswers: string[] = [],
): boolean {
  if (!submitted.trim()) return false

  const norm = normalize(submitted)
  const targets = [correct, ...acceptableAnswers].map(normalize).filter(Boolean)

  for (const target of targets) {
    // Exact normalized match
    if (norm === target) return true

    // Submitted is a meaningful sub-phrase of the target
    // ("Napoleon" inside "Napoleon Bonaparte")
    if (target.includes(norm) && norm.length >= 3) return true

    // Levenshtein threshold scales with target length to allow proportional typos
    const threshold = Math.max(1, Math.floor(target.length * 0.2))
    if (distance(norm, target) <= threshold) return true
  }

  return false
}

export function calculatePoints(
  submittedAt: number,
  startedAt: number,
  timeLimitMs: number,
  speedBonusEnabled: boolean,
): number {
  if (!speedBonusEnabled) return 1000
  const elapsed = Math.max(0, submittedAt - startedAt)
  const ratio = Math.min(elapsed / timeLimitMs, 1)
  // 250–1000 range so late-but-correct answers still reward something
  return Math.round(1000 * (1 - ratio * 0.75))
}
