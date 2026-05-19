export interface MatchOptions {
  typoTolerance: boolean;
  variantMatching: boolean;
  caseInsensitive: boolean;
}

export interface MatchResult {
  matched: boolean;
  matchedAgainst?: string;
  normalizedAttempt: string;
}

export function normalizeAnswer(input: string, caseInsensitive = true): string {
  let value = input.trim();
  if (caseInsensitive) {
    value = value.toLowerCase();
  }
  return value
    .replace(/[.,!?;:'"()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function isLightTypoMatch(attempt: string, accepted: string): boolean {
  if (attempt.length < 5 || accepted.length < 5) {
    return false;
  }
  const distance = levenshtein(attempt, accepted);
  const maxAllowed = accepted.length >= 8 ? 2 : 1;
  return distance <= maxAllowed;
}

export function matchAnswer(
  attempt: string,
  acceptedAnswers: string[],
  options: MatchOptions,
): MatchResult {
  const normalizedAttempt = normalizeAnswer(attempt, options.caseInsensitive);
  const normalizedAccepted = acceptedAnswers.map((value) => normalizeAnswer(value, options.caseInsensitive));

  if (normalizedAccepted.includes(normalizedAttempt)) {
    return { matched: true, matchedAgainst: normalizedAttempt, normalizedAttempt };
  }

  if (options.variantMatching) {
    for (const accepted of normalizedAccepted) {
      if (accepted === normalizedAttempt) {
        return { matched: true, matchedAgainst: accepted, normalizedAttempt };
      }
    }
  }

  if (options.typoTolerance) {
    for (const accepted of normalizedAccepted) {
      if (isLightTypoMatch(normalizedAttempt, accepted)) {
        return { matched: true, matchedAgainst: accepted, normalizedAttempt };
      }
    }
  }

  return { matched: false, normalizedAttempt };
}
