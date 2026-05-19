import type { GameSettings } from './types.js';

export const DEFAULT_SETTINGS: GameSettings = {
  categoryCount: 6,
  questionCountPerCategory: 6,
  pointValues: [100, 200, 300, 400, 500, 600],
  revealSpeedMs: 120,
  answerTimeSeconds: 10,
  postRevealBuzzSeconds: 5,
  allowNegativeScores: true,
  deductOnWrongAnswer: false,
  typoTolerance: true,
  variantMatching: true,
  caseInsensitive: true,
  progressiveReveal: true,
  allowBuzzRebound: true,
  enableFinalRound: true,
  finalQuestionCount: 3,
  maxPlayers: 6,
};
