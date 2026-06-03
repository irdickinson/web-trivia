import type { TriviaQuestion, BoardQuestion } from './question'

export type GameMode = 'jeopardy' | 'classic' | 'multiple-choice' | 'speed'

// Phases mirror jeopardy-online's LobbyPhase
export type LobbyPhase =
  | 'lobby'
  | 'board'
  | 'clue'
  | 'final-wager'
  | 'final-answer'
  | 'final-results'
  | 'finished'

// revealing  — question is animating / buzz window open (jeopardy mode)
// answering  — answer input shown, no buzz required (classic / MC / speed)
// buzzed     — a player locked in, their answer window is live (jeopardy)
// resolved   — outcome determined, overlay shown
export type ClueStatus = 'revealing' | 'answering' | 'buzzed' | 'resolved'

export interface Player {
  uid: string
  name: string
  score: number
  isHost: boolean
  isAnonymous: boolean
}

export interface GameSettings {
  mode: GameMode
  questionSetId: string           // 'built-in' or custom pack id
  categoryCount: number           // columns on the board (1–8)
  questionCountPerCategory: number // rows on the board (1–6)
  pointValues: number[]           // value per row, length === questionCountPerCategory
  revealSpeedMs: number           // ms per character during progressive reveal
  answerTimeSeconds: number       // seconds to answer after buzzing
  postRevealBuzzSeconds: number   // extra buzz window after full reveal (jeopardy mode)
  allowNegativeScores: boolean
  deductOnWrongAnswer: boolean
  typoTolerance: boolean
  variantMatching: boolean
  progressiveReveal: boolean
  allowBuzzRebound: boolean       // wrong answer → remaining players can buzz
  enableFinalRound: boolean
  finalQuestionCount: number
  maxPlayers: number
}

export interface ClueOutcome {
  winnerId?: string | null
  wasCorrect: boolean
  pointsDelta: number             // positive = awarded, negative = deducted
  correctAnswer: string
}

// Board is stored as a flat map for Firestore partial-update support.
// Key format: "r{row}c{col}" e.g. "r0c2"
export type BoardMap = Record<string, BoardQuestion>

export interface ClueState {
  questionId: string
  category: string
  value: number
  fullText: string
  // Clients compute the animation locally from these two fields — no per-char writes needed.
  revealStartedAt: number
  revealSpeedMs: number
  status: ClueStatus
  chooserId: string
  row: number
  col: number
  // Jeopardy / buzz fields
  activeAnswerPlayerId?: string | null
  remainingEligiblePlayers: string[]  // uids still eligible to buzz
  buzzDeadline?: number | null        // ms timestamp — buzz window closes here
  answerDeadline?: number | null      // ms timestamp — active player must answer by here
  // Answer collection
  submittedAnswers: Record<string, string>
  correctAnswers: string[]            // normalised accepted answers
  // Multiple-choice options (null in other modes)
  options?: [string, string, string, string] | null
  // Set when status → 'resolved'
  outcome?: ClueOutcome | null
}

export interface FinalPlayerEntry {
  wager: number | null   // null = not yet submitted
  answers: Record<string, string>     // questionId → submitted text
  correctCount: number
  earnedWager: boolean   // true = wager added to score, false = wager deducted
}

export interface FinalRoundState {
  questions: TriviaQuestion[]
  playerEntries: Record<string, FinalPlayerEntry>
  revealIndex: number
  status: 'wager' | 'answer' | 'results'
}

export interface SystemMessage {
  id: string
  text: string
  createdAt: number
  type: 'info' | 'warning' | 'override'
}

// Shared YouTube player. Playback is decoupled: each client runs its own player
// (so ads / Premium are handled per viewer). The controller broadcasts the
// current track and publishes their own live position; other clients seek to it
// on demand via "Sync to host". The position fields describe the controller's
// playback: current = status === 'playing'
//   ? positionMs + (Date.now() - anchorTime)
//   : positionMs
export interface RoomMedia {
  videoId: string | null         // queued YouTube video, null when nothing is set
  title: string                  // display label for the current track
  controllerId: string           // uid that broadcasts the track / sync target
  status: 'playing' | 'paused'   // the controller's playback state
  positionMs: number             // controller's position sampled at anchorTime
  anchorTime: number             // ms timestamp the position was sampled
}

export interface ChatMessage {
  id: string
  uid: string
  name: string
  text: string
  createdAt: number
}

export interface Room {
  code: string
  hostId: string
  phase: LobbyPhase
  settings: GameSettings
  players: Record<string, Player>
  board: BoardMap                     // "r{row}c{col}" → BoardQuestion
  currentChooserId: string | null
  chooserRotationIndex: number
  clueState: ClueState | null
  finalRound: FinalRoundState | null
  media: RoomMedia | null
  messages: SystemMessage[]
  chat: ChatMessage[]
  createdAt: number
  expiresAt: number
}
