import {
  doc,
  updateDoc,
  runTransaction,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  Room,
  GameSettings,
  ClueState,
  ClueOutcome,
  SystemMessage,
  BoardMap,
  FinalPlayerEntry,
} from '../types/game'
import { QuestionPack, BoardQuestion } from '../types/question'
import { matchAnswer, normalizeAnswer } from './fuzzy'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeMessage(
  text: string,
  type: SystemMessage['type'] = 'info',
): SystemMessage {
  return { id: uid(), text, createdAt: Date.now(), type }
}

function matchOptions(room: Room) {
  return {
    typoTolerance: room.settings.typoTolerance,
    variantMatching: room.settings.variantMatching,
    caseInsensitive: true,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Board building
// ─────────────────────────────────────────────────────────────────────────────

export function buildBoard(pack: QuestionPack, settings: GameSettings): BoardMap {
  const { categoryCount, questionCountPerCategory, pointValues } = settings

  // Shuffle the available categories and take the requested count.
  const shuffled = shuffle(pack.categories)
  const selectedCategories = shuffled.slice(0, categoryCount)

  const board: BoardMap = {}

  for (let col = 0; col < selectedCategories.length; col++) {
    const cat = selectedCategories[col]
    const qs = pack.questions
      .filter((q) => q.category === cat)
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, questionCountPerCategory)

    for (let row = 0; row < qs.length; row++) {
      const key = `r${row}c${col}`
      board[key] = {
        ...qs[row],
        row,
        col,
        revealed: false,
        answeredCorrectlyBy: null,
        // Override value with the configured point scale if provided.
        value: pointValues[row] ?? qs[row].value,
      }
    }
  }

  return board
}

// Build distractors for multiple-choice mode from sibling questions on the board.
function buildMCOptions(
  correct: BoardQuestion,
  board: BoardMap,
): [string, string, string, string] | null {
  const correctDisplay = correct.acceptedAnswers[0] ?? ''

  // Gather candidates from the same category (or whole board if insufficient)
  const siblings = Object.values(board).filter(
    (q) => q.id !== correct.id && q.acceptedAnswers.length > 0,
  )

  const pool = shuffle(siblings).map((q) => q.acceptedAnswers[0]).filter(Boolean)
  const distractors = [...new Set(pool)].slice(0, 3)

  if (distractors.length < 3) return null

  const opts = shuffle([correctDisplay, ...distractors]) as [string, string, string, string]
  return opts
}

// ─────────────────────────────────────────────────────────────────────────────
// Game start / chooser
// ─────────────────────────────────────────────────────────────────────────────

export async function startGame(room: Room, pack: QuestionPack): Promise<void> {
  const board = buildBoard(pack, room.settings)
  const playerUids = sortedPlayerUids(room)
  if (playerUids.length === 0) return

  const firstChooserId = playerUids[0]
  const firstChooser = room.players[firstChooserId]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    phase: 'board',
    board,
    currentChooserId: firstChooserId,
    chooserRotationIndex: 0,
    clueState: null,
    finalRound: null,
    messages: [
      makeMessage(`Game started! ${firstChooser?.name ?? 'Host'} goes first.`),
    ],
  }

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

function sortedPlayerUids(room: Room): string[] {
  return Object.keys(room.players).sort()
}

function nextChooser(room: Room): string {
  const uids = sortedPlayerUids(room)
  if (uids.length === 0) return room.hostId
  const next = (room.chooserRotationIndex + 1) % uids.length
  return uids[next]
}

// ─────────────────────────────────────────────────────────────────────────────
// Clue selection
// ─────────────────────────────────────────────────────────────────────────────

export async function selectClue(
  room: Room,
  row: number,
  col: number,
): Promise<void> {
  const key = `r${row}c${col}`
  const q = room.board[key]
  if (!q || q.revealed) return

  const settings = room.settings
  const allUids = Object.keys(room.players)
  const revealMs = q.clue.length * settings.revealSpeedMs
  const now = Date.now()

  // Build options for multiple-choice mode.
  let options: [string, string, string, string] | null = null
  if (settings.mode === 'multiple-choice') {
    options = buildMCOptions(q, room.board)
  }

  const clueState: ClueState = {
    questionId: q.id,
    category: q.category,
    value: q.value,
    fullText: q.clue,
    revealStartedAt: now,
    revealSpeedMs: settings.revealSpeedMs,
    status: 'revealing',
    chooserId: room.currentChooserId ?? room.hostId,
    row,
    col,
    activeAnswerPlayerId: null,
    remainingEligiblePlayers: allUids,
    buzzDeadline: settings.mode === 'jeopardy'
      ? now + revealMs + settings.postRevealBuzzSeconds * 1000
      : null,
    answerDeadline: null,
    submittedAnswers: {},
    correctAnswers: q.acceptedAnswers.map((a) => normalizeAnswer(a)),
    options,
    outcome: null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    phase: 'clue',
    clueState,
    messages: arrayUnion(
      makeMessage(
        `${room.players[room.currentChooserId ?? '']?.name ?? 'Host'} picked ${q.category} for $${q.value}.`,
      ),
    ),
  }

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

// ─────────────────────────────────────────────────────────────────────────────
// Host: transition revealing → answering (classic / MC / speed)
// ─────────────────────────────────────────────────────────────────────────────

export async function beginAnswerPhase(room: Room): Promise<void> {
  const cs = room.clueState
  if (!cs || cs.status !== 'revealing') return

  const answerDeadline = Date.now() + room.settings.answerTimeSeconds * 1000

  await updateDoc(doc(db, 'rooms', room.code), {
    'clueState.status': 'answering',
    'clueState.answerDeadline': answerDeadline,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Buzzer (atomic transaction)
// ─────────────────────────────────────────────────────────────────────────────

export async function buzz(roomCode: string, uid: string, answerTimeSeconds: number): Promise<void> {
  const roomRef = doc(db, 'rooms', roomCode)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef)
    if (!snap.exists()) return

    const room = snap.data() as Room
    const cs = room.clueState
    if (!cs || cs.status !== 'revealing') return
    if (cs.activeAnswerPlayerId) return
    if (!cs.remainingEligiblePlayers.includes(uid)) return
    if (cs.buzzDeadline && Date.now() > cs.buzzDeadline) return

    tx.update(roomRef, {
      'clueState.status': 'buzzed',
      'clueState.activeAnswerPlayerId': uid,
      'clueState.answerDeadline': Date.now() + answerTimeSeconds * 1000,
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Answer submission
// ─────────────────────────────────────────────────────────────────────────────

export async function submitAnswer(
  room: Room,
  uid: string,
  answerText: string,
): Promise<void> {
  const cs = room.clueState
  if (!cs) return

  const mode = room.settings.mode

  if (mode === 'jeopardy') {
    // Only the active answerer may submit.
    if (cs.activeAnswerPlayerId !== uid) return
    await evaluateJeopardyAnswer(room, uid, answerText)
    return
  }

  // classic / speed / multiple-choice — record the answer first, then evaluate
  await updateDoc(doc(db, 'rooms', room.code), {
    [`clueState.submittedAnswers.${uid}`]: answerText,
  })

  if (mode === 'speed') {
    // Check if this is the first correct answer.
    const opts = matchOptions(room)
    const result = matchAnswer(answerText, cs.correctAnswers, opts)
    if (result.matched) {
      await resolveSpeedClue(room, uid, answerText)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multiple-choice answer (by option index)
// ─────────────────────────────────────────────────────────────────────────────

export async function submitChoice(
  room: Room,
  uid: string,
  optionIndex: number,
): Promise<void> {
  const cs = room.clueState
  if (!cs || cs.status !== 'answering' || !cs.options) return
  const chosen = cs.options[optionIndex]
  await submitAnswer(room, uid, chosen)
}

// ─────────────────────────────────────────────────────────────────────────────
// Evaluate helpers
// ─────────────────────────────────────────────────────────────────────────────

async function evaluateJeopardyAnswer(
  room: Room,
  uid: string,
  answerText: string,
): Promise<void> {
  const cs = room.clueState!
  const opts = matchOptions(room)
  const result = matchAnswer(answerText, cs.correctAnswers, opts)
  const player = room.players[uid]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    [`clueState.submittedAnswers.${uid}`]: answerText,
  }

  if (result.matched) {
    const newScore = (player?.score ?? 0) + cs.value
    const outcome: ClueOutcome = {
      winnerId: uid,
      wasCorrect: true,
      pointsDelta: cs.value,
      correctAnswer: cs.correctAnswers[0] ?? '',
    }
    Object.assign(updates, {
      'clueState.status': 'resolved',
      'clueState.outcome': outcome,
      [`board.r${cs.row}c${cs.col}.revealed`]: true,
      [`board.r${cs.row}c${cs.col}.answeredCorrectlyBy`]: uid,
      [`players.${uid}.score`]: newScore,
      currentChooserId: uid,
      messages: arrayUnion(
        makeMessage(`${player?.name ?? uid} answered correctly! +$${cs.value}`),
      ),
    })
  } else {
    // Wrong answer — deduct if configured.
    let deducted = 0
    if (room.settings.deductOnWrongAnswer) {
      deducted = cs.value
      const cur = player?.score ?? 0
      const newScore = room.settings.allowNegativeScores
        ? cur - deducted
        : Math.max(0, cur - deducted)
      updates[`players.${uid}.score`] = newScore
    }

    const remaining = cs.remainingEligiblePlayers.filter((id) => id !== uid)

    if (room.settings.allowBuzzRebound && remaining.length > 0) {
      // Let others buzz again.
      const newBuzzDeadline = Date.now() + room.settings.postRevealBuzzSeconds * 1000
      Object.assign(updates, {
        'clueState.status': 'revealing',
        'clueState.activeAnswerPlayerId': null,
        'clueState.answerDeadline': null,
        'clueState.remainingEligiblePlayers': remaining,
        'clueState.buzzDeadline': newBuzzDeadline,
        messages: arrayUnion(
          makeMessage(
            `${player?.name ?? uid} was incorrect.${deducted ? ` –$${deducted}.` : ''} Others may buzz in.`,
            'warning',
          ),
        ),
      })
    } else {
      // No rebound — resolve with no winner.
      const outcome: ClueOutcome = {
        winnerId: uid,
        wasCorrect: false,
        pointsDelta: -deducted,
        correctAnswer: cs.correctAnswers[0] ?? '',
      }
      Object.assign(updates, {
        'clueState.status': 'resolved',
        'clueState.outcome': outcome,
        [`board.r${cs.row}c${cs.col}.revealed`]: true,
        [`board.r${cs.row}c${cs.col}.answeredCorrectlyBy`]: null,
        messages: arrayUnion(
          makeMessage(
            `${player?.name ?? uid} was incorrect.${deducted ? ` –$${deducted}.` : ''} No one else can buzz.`,
            'warning',
          ),
        ),
      })
    }
  }

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

// Resolve for classic / MC mode after answerDeadline.
export async function resolveClassicClue(room: Room): Promise<void> {
  const cs = room.clueState
  if (!cs || cs.status !== 'answering') return

  const opts = matchOptions(room)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {}

  let winnerId: string | null = null
  let pointsDelta = 0

  for (const [uid, ans] of Object.entries(cs.submittedAnswers)) {
    const result = matchAnswer(ans, cs.correctAnswers, opts)
    if (result.matched) {
      const newScore = (room.players[uid]?.score ?? 0) + cs.value
      updates[`players.${uid}.score`] = newScore
      if (!winnerId) {
        winnerId = uid
        pointsDelta = cs.value
      }
    }
  }

  const outcome: ClueOutcome = {
    winnerId,
    wasCorrect: !!winnerId,
    pointsDelta,
    correctAnswer: cs.correctAnswers[0] ?? '',
  }

  Object.assign(updates, {
    'clueState.status': 'resolved',
    'clueState.outcome': outcome,
    [`board.r${cs.row}c${cs.col}.revealed`]: true,
    [`board.r${cs.row}c${cs.col}.answeredCorrectlyBy`]: winnerId,
    ...(winnerId ? { currentChooserId: winnerId } : {}),
    messages: arrayUnion(
      winnerId
        ? makeMessage(
            `${room.players[winnerId]?.name ?? winnerId} answered correctly! +$${cs.value}`,
          )
        : makeMessage(`Time's up! No correct answers.`, 'warning'),
    ),
  })

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

async function resolveSpeedClue(
  room: Room,
  winnerId: string,
  _answerText: string,
): Promise<void> {
  const cs = room.clueState!
  const newScore = (room.players[winnerId]?.score ?? 0) + cs.value
  const outcome: ClueOutcome = {
    winnerId,
    wasCorrect: true,
    pointsDelta: cs.value,
    correctAnswer: cs.correctAnswers[0] ?? '',
  }

  await updateDoc(doc(db, 'rooms', room.code), {
    'clueState.status': 'resolved',
    'clueState.outcome': outcome,
    [`board.r${cs.row}c${cs.col}.revealed`]: true,
    [`board.r${cs.row}c${cs.col}.answeredCorrectlyBy`]: winnerId,
    [`players.${winnerId}.score`]: newScore,
    messages: arrayUnion(
      makeMessage(
        `${room.players[winnerId]?.name ?? winnerId} was first with the correct answer! +$${cs.value}`,
      ),
    ),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Host: handle expired deadlines
// ─────────────────────────────────────────────────────────────────────────────

export async function handleClueTimeout(room: Room): Promise<void> {
  const cs = room.clueState
  if (!cs) return

  if (cs.status === 'revealing') {
    // Buzz window expired — no one buzzed (jeopardy) or text not yet done (other modes).
    // For non-jeopardy modes this is called to transition revealing → answering.
    if (room.settings.mode !== 'jeopardy') {
      await beginAnswerPhase(room)
      return
    }
    // Jeopardy: no buzz in time — resolve as no winner.
    const outcome: ClueOutcome = {
      winnerId: null,
      wasCorrect: false,
      pointsDelta: 0,
      correctAnswer: cs.correctAnswers[0] ?? '',
    }
    await updateDoc(doc(db, 'rooms', room.code), {
      'clueState.status': 'resolved',
      'clueState.outcome': outcome,
      [`board.r${cs.row}c${cs.col}.revealed`]: true,
      [`board.r${cs.row}c${cs.col}.answeredCorrectlyBy`]: null,
      messages: arrayUnion(makeMessage('Time ran out — no one buzzed.', 'warning')),
    })
  } else if (cs.status === 'buzzed') {
    // Active player ran out of time.
    const uid = cs.activeAnswerPlayerId
    const player = uid ? room.players[uid] : null
    const remaining = cs.remainingEligiblePlayers.filter((id) => id !== uid)

    let deducted = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {}

    if (uid && room.settings.deductOnWrongAnswer) {
      deducted = cs.value
      const cur = room.players[uid]?.score ?? 0
      updates[`players.${uid}.score`] = room.settings.allowNegativeScores
        ? cur - deducted
        : Math.max(0, cur - deducted)
    }

    if (room.settings.allowBuzzRebound && remaining.length > 0) {
      Object.assign(updates, {
        'clueState.status': 'revealing',
        'clueState.activeAnswerPlayerId': null,
        'clueState.answerDeadline': null,
        'clueState.remainingEligiblePlayers': remaining,
        'clueState.buzzDeadline': Date.now() + room.settings.postRevealBuzzSeconds * 1000,
        messages: arrayUnion(
          makeMessage(
            `${player?.name ?? uid ?? 'Player'} ran out of time.${deducted ? ` –$${deducted}.` : ''} Others may buzz.`,
            'warning',
          ),
        ),
      })
    } else {
      const outcome: ClueOutcome = {
        winnerId: null,
        wasCorrect: false,
        pointsDelta: -deducted,
        correctAnswer: cs.correctAnswers[0] ?? '',
      }
      Object.assign(updates, {
        'clueState.status': 'resolved',
        'clueState.outcome': outcome,
        [`board.r${cs.row}c${cs.col}.revealed`]: true,
        [`board.r${cs.row}c${cs.col}.answeredCorrectlyBy`]: null,
        messages: arrayUnion(
          makeMessage(
            `${player?.name ?? uid ?? 'Player'} ran out of time.${deducted ? ` –$${deducted}.` : ''}`,
            'warning',
          ),
        ),
      })
    }

    await updateDoc(doc(db, 'rooms', room.code), updates)
  } else if (cs.status === 'answering') {
    // Classic / MC / speed — answer window closed.
    await resolveClassicClue(room)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Return to board
// ─────────────────────────────────────────────────────────────────────────────

export async function returnToBoard(room: Room): Promise<void> {
  const unrevealed = Object.values(room.board).some((q) => !q.revealed)

  if (!unrevealed) {
    // Board is complete.
    if (room.settings.enableFinalRound) {
      // Final round is handled separately.
      await updateDoc(doc(db, 'rooms', room.code), {
        phase: 'final-wager',
        clueState: null,
        messages: arrayUnion(makeMessage('Board complete! Moving to the Final Round.')),
      })
    } else {
      await updateDoc(doc(db, 'rooms', room.code), {
        phase: 'finished',
        clueState: null,
      })
    }
    return
  }

  // If someone answered correctly, they already became chooser at resolve time.
  // Only rotate when no one answered.
  const outcome = room.clueState?.outcome
  const correctWinnerId = outcome?.wasCorrect ? outcome.winnerId : null

  const nextChooserId = correctWinnerId ?? nextChooser(room)
  const nextRotation = correctWinnerId
    ? room.chooserRotationIndex
    : (room.chooserRotationIndex + 1) % Object.keys(room.players).length
  const nextChooserPlayer = room.players[nextChooserId]

  await updateDoc(doc(db, 'rooms', room.code), {
    phase: 'board',
    clueState: null,
    currentChooserId: nextChooserId,
    chooserRotationIndex: nextRotation,
    messages: arrayUnion(
      makeMessage(`${nextChooserPlayer?.name ?? 'Next player'} picks next.`),
    ),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Score adjustment (host)
// ─────────────────────────────────────────────────────────────────────────────

export async function adjustScore(
  room: Room,
  targetUid: string,
  delta: number,
): Promise<void> {
  const player = room.players[targetUid]
  if (!player) return

  const cur = player.score
  const newScore = room.settings.allowNegativeScores
    ? cur + delta
    : Math.max(0, cur + delta)

  const sign = delta > 0 ? '+' : ''

  await updateDoc(doc(db, 'rooms', room.code), {
    [`players.${targetUid}.score`]: newScore,
    messages: arrayUnion(
      makeMessage(
        `Host adjusted ${player.name}'s score by ${sign}$${delta.toLocaleString()}.`,
        'override',
      ),
    ),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Final round
// ─────────────────────────────────────────────────────────────────────────────

export async function initFinalRound(room: Room, pack: QuestionPack): Promise<void> {
  const count = room.settings.finalQuestionCount
  const eligible = pack.questions.filter((q) => q.isFinalEligible)
  const selected = shuffle(eligible).slice(0, count)

  const playerEntries: Record<string, FinalPlayerEntry> = {}
  for (const uid of Object.keys(room.players)) {
    playerEntries[uid] = { wager: null, answers: {}, correctCount: 0, earnedWager: false }
  }

  await updateDoc(doc(db, 'rooms', room.code), {
    phase: 'final-wager',
    finalRound: {
      questions: selected,
      playerEntries,
      revealIndex: 0,
      status: 'wager',
    },
    clueState: null,
    messages: arrayUnion(makeMessage('Final Round begins! Submit your wager.')),
  })
}

export async function submitFinalWager(
  room: Room,
  uid: string,
  wager: number,
): Promise<void> {
  const maxWager = Math.max(0, room.players[uid]?.score ?? 0)
  const clamped = Math.min(Math.max(0, wager), maxWager)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    [`finalRound.playerEntries.${uid}.wager`]: clamped,
  }

  // Check if all players have wagered → advance phase.
  const fr = room.finalRound
  if (fr) {
    const allWagered = Object.keys(room.players).every(
      (pid) => pid === uid || fr.playerEntries[pid]?.wager !== null,
    )
    if (allWagered) {
      updates.phase = 'final-answer'
      updates['finalRound.status'] = 'answer'
    }
  }

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

export async function submitFinalAnswers(
  room: Room,
  uid: string,
  answers: Record<string, string>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    [`finalRound.playerEntries.${uid}.answers`]: answers,
  }

  const fr = room.finalRound
  if (fr) {
    const allAnswered = Object.keys(room.players).every(
      (pid) => pid === uid || Object.keys(fr.playerEntries[pid]?.answers ?? {}).length > 0,
    )
    if (allAnswered) {
      updates.phase = 'final-results'
      updates['finalRound.status'] = 'results'
    }
  }

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

export async function revealFinalResults(room: Room): Promise<void> {
  const fr = room.finalRound
  if (!fr) return

  const opts = matchOptions(room)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {}

  // Pass threshold: majority of questions correct earns the wager,
  // otherwise the wager is deducted. 1-question final: must be correct.
  const threshold = Math.ceil(fr.questions.length / 2)

  for (const [uid, entry] of Object.entries(fr.playerEntries)) {
    let correct = 0
    for (const q of fr.questions) {
      const submitted = entry.answers[q.id] ?? ''
      if (matchAnswer(submitted, q.acceptedAnswers, opts).matched) correct++
    }

    const earnedWager = correct >= threshold
    const wager = entry.wager ?? 0
    const delta = earnedWager ? wager : -wager
    const cur = room.players[uid]?.score ?? 0
    const newScore = room.settings.allowNegativeScores
      ? cur + delta
      : Math.max(0, cur + delta)

    updates[`finalRound.playerEntries.${uid}.correctCount`] = correct
    updates[`finalRound.playerEntries.${uid}.earnedWager`] = earnedWager
    if (delta !== 0) updates[`players.${uid}.score`] = newScore
  }

  updates['finalRound.status'] = 'results'
  updates.phase = 'final-results'

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

export async function finishGame(roomCode: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomCode), { phase: 'finished' })
}

export async function returnToLobby(roomCode: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomCode), {
    phase: 'lobby',
    board: {},
    clueState: null,
    finalRound: null,
    media: null,
    messages: [],
    currentChooserId: null,
    chooserRotationIndex: 0,
  })
}
