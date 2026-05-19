import { distance } from 'fastest-levenshtein'

export interface MatchOptions {
  typoTolerance: boolean
  variantMatching: boolean
  caseInsensitive: boolean
}

export interface MatchResult {
  matched: boolean
  matchedAgainst?: string
  normalizedAttempt: string
}

export function normalizeAnswer(input: string, caseInsensitive = true): string {
  let v = input.trim()
  if (caseInsensitive) v = v.toLowerCase()
  return v
    .replace(/[.,!?;:'"()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// 1 edit allowed for 5–7 chars, 2 for 8+. Short strings require exact match.
function isLightTypoMatch(attempt: string, accepted: string): boolean {
  if (attempt.length < 5 || accepted.length < 5) return false
  const maxAllowed = accepted.length >= 8 ? 2 : 1
  return distance(attempt, accepted) <= maxAllowed
}

export function matchAnswer(
  attempt: string,
  acceptedAnswers: string[],
  options: MatchOptions,
): MatchResult {
  const normalizedAttempt = normalizeAnswer(attempt, options.caseInsensitive)
  const normalizedAccepted = acceptedAnswers.map((a) =>
    normalizeAnswer(a, options.caseInsensitive),
  )

  // 1. Exact match
  const exactIdx = normalizedAccepted.indexOf(normalizedAttempt)
  if (exactIdx !== -1) {
    return { matched: true, matchedAgainst: acceptedAnswers[exactIdx], normalizedAttempt }
  }

  // 2. Variant matching — iterate all accepted strings
  if (options.variantMatching) {
    for (let i = 0; i < normalizedAccepted.length; i++) {
      if (normalizedAccepted[i] === normalizedAttempt) {
        return { matched: true, matchedAgainst: acceptedAnswers[i], normalizedAttempt }
      }
    }
  }

  // 3. Levenshtein typo tolerance
  if (options.typoTolerance) {
    for (let i = 0; i < normalizedAccepted.length; i++) {
      if (isLightTypoMatch(normalizedAttempt, normalizedAccepted[i])) {
        return { matched: true, matchedAgainst: acceptedAnswers[i], normalizedAttempt }
      }
    }
  }

  return { matched: false, normalizedAttempt }
}

// Convenience wrapper — uses settings defaults
export function isAnswerCorrect(
  attempt: string,
  acceptedAnswers: string[],
  options: MatchOptions,
): boolean {
  if (!attempt.trim()) return false
  return matchAnswer(attempt, acceptedAnswers, options).matched
}
