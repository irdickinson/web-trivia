export type PlayerId = string;
export type LobbyCode = string;
export type PlayerRole = 'host' | 'player';
export type LobbyPhase = 'lobby' | 'board' | 'clue' | 'final-wager' | 'final-answer' | 'final-results' | 'finished';
export type ClueStatus = 'hidden' | 'revealing' | 'paused-for-answer' | 'resolved';

export interface TriviaQuestion {
  id: string;
  category: string;
  difficulty: number;
  value: number;
  clue: string;
  acceptedAnswers: string[];
  tags?: string[];
  isFinalEligible?: boolean;
}

export interface QuestionPack {
  id: string;
  name: string;
  description?: string;
  categories: string[];
  questions: TriviaQuestion[];
}

export interface BoardQuestion extends TriviaQuestion {
  row: number;
  col: number;
  revealed: boolean;
  answeredCorrectlyBy?: PlayerId;
}

export interface FinalQuestion extends TriviaQuestion {
  revealed?: boolean;
}

export interface Player {
  id: PlayerId;
  name: string;
  role: PlayerRole;
  score: number;
  joinedAt: number;
  connected: boolean;
}

export interface GameSettings {
  categoryCount: number;
  questionCountPerCategory: number;
  pointValues: number[];
  revealSpeedMs: number;
  answerTimeSeconds: number;
  postRevealBuzzSeconds: number;
  allowNegativeScores: boolean;
  deductOnWrongAnswer: boolean;
  typoTolerance: boolean;
  variantMatching: boolean;
  caseInsensitive: boolean;
  progressiveReveal: boolean;
  allowBuzzRebound: boolean;
  enableFinalRound: boolean;
  finalQuestionCount: number;
  maxPlayers: number;
}

export interface BuzzerState {
  buzzOrder: PlayerId[];
  lockedPlayerId?: PlayerId;
  openedAt?: number;
  closed: boolean;
}

export interface ClueState {
  questionId: string;
  category: string;
  value: number;
  fullText: string;
  revealedText: string;
  revealIndex: number;
  status: ClueStatus;
  chooserId: PlayerId;
  activeAnswerPlayerId?: PlayerId;
  submittedAnswers: Record<PlayerId, string>;
  remainingEligiblePlayers: PlayerId[];
  correctAnswers: string[];
  answerWindowEndsAt?: number;
  buzzWindowEndsAt?: number;
}


export interface FinalPlayerEntry {
  wager: number;
  answers: Record<string, string>;
  correctCount: number;
  doubled: boolean;
}

export interface FinalRoundState {
  questions: FinalQuestion[];
  playerEntries: Record<PlayerId, FinalPlayerEntry>;
  revealIndex: number;
}

export interface SystemMessage {
  id: string;
  text: string;
  createdAt: number;
  type: 'info' | 'warning' | 'override';
}

export interface LobbyState {
  code: LobbyCode;
  phase: LobbyPhase;
  hostId: PlayerId;
  players: Player[];
  settings: GameSettings;
  selectedPackIds: string[];
  board: BoardQuestion[][];
  currentChooserId?: PlayerId;
  defaultChooserRotationIndex: number;
  clueState?: ClueState;
  finalRound?: FinalRoundState;
  messages: SystemMessage[];
}

export interface PublicLobbyState extends LobbyState {
  you?: PlayerId;
}

export interface CreateLobbyPayload {
  name: string;
}

export interface JoinLobbyPayload {
  code: string;
  name: string;
}

export interface LobbySettingsPatch {
  settings?: Partial<GameSettings>;
  selectedPackIds?: string[];
}

export type ClientEvent =
  | { type: 'createLobby'; payload: CreateLobbyPayload }
  | { type: 'joinLobby'; payload: JoinLobbyPayload }
  | { type: 'updateSettings'; payload: LobbySettingsPatch }
  | { type: 'startGame'; payload: { code: string } }
  | { type: 'selectQuestion'; payload: { code: string; row: number; col: number } }
  | { type: 'buzz'; payload: { code: string } }
  | { type: 'submitAnswer'; payload: { code: string; answer: string } }
  | { type: 'adjustScore'; payload: { code: string; targetPlayerId: string; delta: number } }
  | { type: 'submitFinalWager'; payload: { code: string; wager: number } }
  | { type: 'submitFinalAnswers'; payload: { code: string; answers: Record<string, string> } }
  | { type: 'returnToLobby'; payload: { code: string } }
  | { type: 'ping' };

export type ServerEvent =
  | { type: 'connected'; payload: { playerId: string } }
  | { type: 'lobbyState'; payload: PublicLobbyState }
  | { type: 'availablePacks'; payload: QuestionPackMeta[] }
  | { type: 'error'; payload: { message: string } }
  | { type: 'toast'; payload: { message: string } };

export interface QuestionPackMeta {
  id: string;
  name: string;
  description?: string;
  categoryCount: number;
  questionCount: number;
}

export interface AnswerReviewPayload {
  code: string;
  playerId: string;
  playerName: string;
  submittedAnswer: string;
  matched: boolean;
  acceptedAnswers: string[];
}
