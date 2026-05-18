export type GameMode = 'classic' | 'speed' | 'multiple-choice' | 'fastest-finger'

export type GameStatus = 'lobby' | 'playing' | 'review' | 'reveal' | 'finished'

export type QuestionStatus = 'revealing' | 'answering' | 'review' | 'revealed'

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

export interface CurrentQuestion {
  index: number
  startedAt: number
  revealStartedAt: number
  revealDurationMs: number
  postRevealWindowMs: number
  status: QuestionStatus
  currentBuzzerId: string | null
  answerDeadline: number | null
  eliminatedPlayers: string[]
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
