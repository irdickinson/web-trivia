import type { TriviaQuestion, BoardQuestion } from './question'

export type GameMode = 'jeopardy' | 'classic' | 'multiple-choice' | 'speed' | 'rounds'

// Phases mirror jeopardy-online's LobbyPhase
export type LobbyPhase =
  | 'lobby'
  | 'board'
  | 'clue'
  | 'final-wager'
  | 'final-answer'
  | 'final-results'
  | 'round-question'   // rounds mode: umbrella phase — sub-screen driven by RoundState.status
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
  questionSetIds: string[]        // ids of the selected packs (merged for the board)
  seed: string                    // seeds board + final-round selection (reproducible)
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
  // Rounds mode
  roundsCount: number             // number of rounds (capped at pack difficulty tiers)
  questionsPerRound: number       // 1–5 questions asked each round
  mcRatio: number                 // 0..1 share of questions shown as multiple choice
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

// ── Rounds mode ───────────────────────────────────────────────────────────────
// A faster, social mode: each round asks everyone the same questions
// simultaneously under a per-question timer, then reveals results one question at
// a time. Round N pulls difficulty-N questions, so later rounds are harder and
// (points = difficulty value) worth more.

export interface RoundQuestion {
  questionId: string
  category: string
  clue: string
  correctAnswers: string[]            // normalised accepted answers
  difficulty: number
  points: number                      // awarded per correct answer this round
  isMultipleChoice: boolean
  options?: [string, string, string, string] | null
}

// Drives which round-mode sub-screen is shown (all under the 'round-question' phase):
//   intro            — ready-up before round 1
//   answering        — a question is live, everyone answering
//   question-result  — inline per-question result beat, then auto-advance
//   summary          — full stop after the last question; totals + this round's
//                      deltas; doubles as the ready-up for the next round
//   final            — cinematic final standings reveal
export type RoundStatus =
  | 'intro'
  | 'answering'
  | 'question-result'
  | 'summary'
  | 'final'

export interface RoundState {
  roundIndex: number                  // 0-based current round
  roundsCount: number
  questionsPerRound: number
  status: RoundStatus
  questionIndex: number               // which question is live during 'answering'
  questionDeadline: number | null     // ms timestamp the current question closes
  resultDeadline: number | null       // ms timestamp the inline result beat auto-advances
  scoredCount: number                 // questions scored so far this round (idempotency)
  isFinalRound: boolean               // true on the last round (all top-tier questions)
  questions: RoundQuestion[]          // the current round's questions
  // questionId → uid → submitted answer text
  answers: Record<string, Record<string, string>>
  ready: Record<string, boolean>      // uid → ready (cosmetic signal; host starts)
  roundStartScores: Record<string, number> // score per uid at this round's start (for deltas)
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
export interface MediaQueueItem {
  id: string                     // stable client-generated id for reorder/remove
  videoId: string                // YouTube video id
  title: string                  // display label (raw URL until metadata resolves)
  addedBy: string                // uid that queued it
  addedByName: string            // display name at the time it was queued
}

export interface RoomMedia {
  videoId: string | null         // now-playing YouTube video, null when nothing is set
  title: string                  // display label for the current track
  controllerId: string           // uid that broadcasts the track / sync target
  status: 'playing' | 'paused'   // the controller's playback state
  positionMs: number             // controller's position sampled at anchorTime
  anchorTime: number             // ms timestamp the position was sampled
  queue: MediaQueueItem[]        // upcoming videos; anyone in the room can append
  history: MediaQueueItem[]      // recently played, newest first (replay in one tap)
  // Monotonic counter. Bumping it tells every client to seek to the broadcast
  // position and play — drives autoplay-on-change, "Play for everyone", "Sync all".
  syncNonce: number
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
  roundState: RoundState | null
  media: RoomMedia | null
  messages: SystemMessage[]
  chat: ChatMessage[]
  createdAt: number
  expiresAt: number
}
