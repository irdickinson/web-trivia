export type GameMode = 'classic' | 'speed' | 'multiple-choice' | 'fastest-finger'

export type GameStatus = 'lobby' | 'playing' | 'finished'

// 'active'    — question is live, players can answer
// 'review'    — timer expired, host reviews/overrides answers
// 'revealed'  — correct answer shown, scores updated
// 'revealing' — Fastest Finger: question text scrolling
// 'answering' — Fastest Finger: a player is typing their answer
export type QuestionStatus = 'active' | 'review' | 'revealed' | 'revealing' | 'answering'

export interface Player {
  uid: string
  name: string
  score: number
  isHost: boolean
  isAnonymous: boolean
}

export interface GameSettings {
  mode: GameMode
  questionSetId: string
  totalQuestions: number
  secondsPerQuestion: number
  revealDurationMs: number
  postRevealWindowMs: number
  speedBonusEnabled: boolean
}

export interface AnswerEntry {
  uid: string
  answer: string
  submittedAt: number
  isCorrect: boolean | null
  hostOverride: boolean | null
  points: number
}

export interface CurrentQuestion {
  index: number
  text: string
  options?: [string, string, string, string]
  status: QuestionStatus
  startedAt: number
  timeLimitMs: number
  answers: Record<string, AnswerEntry>
  correctAnswer?: string
  // Fastest Finger fields — only populated in that mode
  revealStartedAt?: number
  revealDurationMs?: number
  postRevealWindowMs?: number
  currentBuzzerId?: string | null
  answerDeadline?: number | null
  eliminatedPlayers?: string[]
}

export interface Room {
  code: string
  hostId: string
  status: GameStatus
  settings: GameSettings
  players: Record<string, Player>
  currentQuestion: CurrentQuestion | null
  createdAt: number
  expiresAt: number
}
