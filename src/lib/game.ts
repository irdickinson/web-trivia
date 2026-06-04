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
  RoundState,
  RoundQuestion,
} from '../types/game'
import { QuestionPack, BoardQuestion } from '../types/question'
import { matchAnswer, normalizeAnswer } from './fuzzy'
import { makeRng, seededShuffle, randomSeed } from './rng'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
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

// Distinct categories that actually carry questions, in first-seen order. Built
// from the questions (not pack.categories) so merged packs only surface
// categories that have content.
function uniqueCategories(pack: QuestionPack): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of pack.questions) {
    if (!seen.has(q.category)) {
      seen.add(q.category)
      out.push(q.category)
    }
  }
  return out
}

export function buildBoard(
  pack: QuestionPack,
  settings: GameSettings,
  seed: string,
): BoardMap {
  const { categoryCount, questionCountPerCategory, pointValues } = settings
  const rng = makeRng(seed)

  // Pick the categories for this game, seeded for reproducibility.
  const selectedCategories = seededShuffle(uniqueCategories(pack), rng).slice(0, categoryCount)

  const board: BoardMap = {}

  for (let col = 0; col < selectedCategories.length; col++) {
    const cat = selectedCategories[col]
    const used = new Set<string>()

    for (let row = 0; row < questionCountPerCategory; row++) {
      const difficulty = row + 1
      // Prefer a question whose difficulty matches the row; fall back to any
      // unused question in the category (e.g. sparse merged categories).
      const tier = pack.questions.filter(
        (q) => q.category === cat && q.difficulty === difficulty && !used.has(q.id),
      )
      const pool = tier.length > 0
        ? tier
        : pack.questions.filter((q) => q.category === cat && !used.has(q.id))
      if (pool.length === 0) continue

      const pick = pool[rng.int(pool.length)]
      used.add(pick.id)

      const key = `r${row}c${col}`
      board[key] = {
        ...pick,
        row,
        col,
        revealed: false,
        answeredCorrectlyBy: null,
        // Override value with the configured point scale if provided.
        value: pointValues[row] ?? pick.value,
      }
    }
  }

  return board
}

// Pick 3 distractors from a candidate answer list and shuffle them with the
// correct answer into four options. Seeded so options are stable across clients.
// Returns null when there aren't enough distinct distractors.
function buildOptions(
  correctDisplay: string,
  candidates: string[],
  seed: string,
): [string, string, string, string] | null {
  const rng = makeRng(seed)
  const pool = seededShuffle(candidates, rng).filter((a) => a && a !== correctDisplay)
  const distractors = [...new Set(pool)].slice(0, 3)
  if (distractors.length < 3) return null
  return seededShuffle([correctDisplay, ...distractors], rng) as [string, string, string, string]
}

// Build distractors for multiple-choice mode from sibling questions on the
// board. Seeded per clue so the options are stable across clients.
function buildMCOptions(
  correct: BoardQuestion,
  board: BoardMap,
  seed: string,
): [string, string, string, string] | null {
  const candidates = Object.values(board)
    .filter((q) => q.id !== correct.id)
    .map((q) => q.acceptedAnswers[0])
    .filter(Boolean)
  return buildOptions(correct.acceptedAnswers[0] ?? '', candidates, `${seed}:mc:${correct.id}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Game start / chooser
// ─────────────────────────────────────────────────────────────────────────────

export async function startGame(room: Room, pack: QuestionPack): Promise<void> {
  const board = buildBoard(pack, room.settings, room.settings.seed)
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
    options = buildMCOptions(q, room.board, settings.seed)
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
  const selected = seededShuffle(eligible, makeRng(`${room.settings.seed}:final`)).slice(0, count)

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
    roundState: null,
    media: null,
    messages: [],
    currentChooserId: null,
    chooserRotationIndex: 0,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Rounds mode
// ─────────────────────────────────────────────────────────────────────────────

function maxDifficulty(pack: QuestionPack): number {
  return pack.questions.reduce((m, q) => Math.max(m, q.difficulty), 0)
}

// Categories chosen for the game — seeded so every round uses the same set.
function roundCategories(pack: QuestionPack, settings: GameSettings, seed: string): string[] {
  return seededShuffle(uniqueCategories(pack), makeRng(seed)).slice(0, settings.categoryCount)
}

// Build one round: difficulty = roundIndex + 1, so later rounds are harder and
// (points = difficulty value) worth more. The final round ignores roundIndex and
// pulls the top difficulty tier so every clue is a hard one. Each question is
// typed or MC based on a seeded coin flip against settings.mcRatio.
export function buildRound(
  pack: QuestionPack,
  settings: GameSettings,
  seed: string,
  roundIndex: number,
  isFinal = false,
): RoundQuestion[] {
  const difficulty = isFinal ? maxDifficulty(pack) : roundIndex + 1
  const categories = roundCategories(pack, settings, seed)

  let pool = pack.questions.filter(
    (q) => q.difficulty === difficulty && categories.includes(q.category),
  )
  if (pool.length === 0) {
    pool = pack.questions.filter((q) => categories.includes(q.category))
  }

  const picks = seededShuffle(pool, makeRng(`${seed}:round:${roundIndex}`)).slice(
    0,
    settings.questionsPerRound,
  )

  return picks.map((q, i) => {
    const wantMC = makeRng(`${seed}:mc-flip:${roundIndex}:${i}:${q.id}`).next() < settings.mcRatio
    const correctDisplay = q.acceptedAnswers[0] ?? ''
    const distractors = pack.questions
      .filter((d) => d.id !== q.id && categories.includes(d.category))
      .map((d) => d.acceptedAnswers[0])
      .filter(Boolean)
    const options = wantMC
      ? buildOptions(correctDisplay, distractors, `${seed}:round-mc:${q.id}`)
      : null
    return {
      questionId: q.id,
      category: q.category,
      clue: q.clue,
      correctAnswers: q.acceptedAnswers.map((a) => normalizeAnswer(a)),
      difficulty: q.difficulty,
      points: q.value,
      isMultipleChoice: !!options, // falls back to typed if distractors are short
      options,
    }
  })
}

// How long the inline per-question result stays up before auto-advancing.
const RESULT_BEAT_MS = 5000

function snapshotScores(room: Room): Record<string, number> {
  const out: Record<string, number> = {}
  for (const pid of Object.keys(room.players)) out[pid] = room.players[pid]?.score ?? 0
  return out
}

// Fresh game → the ready-up screen for round 1. Scores reset to zero; the host
// starts the questions from the intro (ready toggles are a cosmetic signal).
export async function startRoundGame(room: Room, pack: QuestionPack): Promise<void> {
  const settings = room.settings
  const roundsCount = Math.min(settings.roundsCount, Math.max(1, maxDifficulty(pack)))
  const isFinalRound = roundsCount === 1
  // A restart ("Start new game" off the final screen) rerolls the seed so the
  // questions differ; the very first start honours the host's chosen seed.
  const seed = room.roundState ? randomSeed() : settings.seed
  const questions = buildRound(pack, settings, seed, 0, isFinalRound)
  if (questions.length === 0) return

  const roundState: RoundState = {
    roundIndex: 0,
    roundsCount,
    questionsPerRound: settings.questionsPerRound,
    status: 'intro',
    questionIndex: 0,
    questionDeadline: null,
    resultDeadline: null,
    scoredCount: 0,
    isFinalRound,
    questions,
    answers: {},
    ready: {},
    roundStartScores: {},
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    phase: 'round-question',
    roundState,
    clueState: null,
    finalRound: null,
    'settings.seed': seed,
    messages: [makeMessage('Get ready — round 1 is about to begin.')],
  }
  // Fresh game — reset everyone to zero.
  for (const pid of Object.keys(room.players)) updates[`players.${pid}.score`] = 0

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

// Any player: flip their own ready flag on an intro / summary ready-up screen.
export async function toggleReady(room: Room, uid: string): Promise<void> {
  const rs = room.roundState
  if (!rs || (rs.status !== 'intro' && rs.status !== 'summary')) return
  await updateDoc(doc(db, 'rooms', room.code), {
    [`roundState.ready.${uid}`]: !rs.ready?.[uid],
  })
}

export async function submitRoundAnswer(room: Room, uid: string, answer: string): Promise<void> {
  const rs = room.roundState
  if (!rs || rs.status !== 'answering') return
  const q = rs.questions[rs.questionIndex]
  if (!q) return
  await updateDoc(doc(db, 'rooms', room.code), {
    [`roundState.answers.${q.questionId}.${uid}`]: answer,
  })
}

// Host: leave the ready-up and begin this round's questions. Snapshots the
// current scores so the end-of-round summary can show per-round deltas.
export async function startRoundQuestions(room: Room): Promise<void> {
  const rs = room.roundState
  if (!rs || rs.status !== 'intro') return
  await updateDoc(doc(db, 'rooms', room.code), {
    'roundState.status': 'answering',
    'roundState.questionIndex': 0,
    'roundState.questionDeadline': Date.now() + room.settings.answerTimeSeconds * 1000,
    'roundState.resultDeadline': null,
    'roundState.scoredCount': 0,
    'roundState.roundStartScores': snapshotScores(room),
    messages: arrayUnion(
      makeMessage(`Round ${rs.roundIndex + 1} begins! Questions are worth $${rs.questions[0]?.points ?? 0} each.`),
    ),
  })
}

// Host: the live question is over (timer expired or everyone answered). Score it
// and show the inline result beat before auto-advancing.
export async function resolveRoundQuestion(room: Room): Promise<void> {
  const rs = room.roundState
  if (!rs || rs.status !== 'answering') return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    'roundState.status': 'question-result',
    'roundState.questionDeadline': null,
    'roundState.resultDeadline': Date.now() + RESULT_BEAT_MS,
    'roundState.scoredCount': rs.questionIndex + 1,
  }
  scoreRoundQuestion(room, rs, rs.questionIndex, updates)
  await updateDoc(doc(db, 'rooms', room.code), updates)
}

// Adds this question's score increments + a summary message to `updates`.
function scoreRoundQuestion(
  room: Room,
  rs: RoundState,
  index: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Record<string, any>,
): void {
  const q = rs.questions[index]
  if (!q) return
  const opts = matchOptions(room)
  const ansMap = rs.answers[q.questionId] ?? {}
  const winners: string[] = []
  for (const [uid, ans] of Object.entries(ansMap)) {
    if (matchAnswer(ans, q.correctAnswers, opts).matched) {
      updates[`players.${uid}.score`] = (room.players[uid]?.score ?? 0) + q.points
      winners.push(room.players[uid]?.name ?? uid)
    }
  }
  updates.messages = arrayUnion(
    makeMessage(
      winners.length
        ? `${q.category}: ${winners.join(', ')} scored +$${q.points}.`
        : `${q.category}: nobody got it. Answer: ${q.correctAnswers[0] ?? ''}`,
      winners.length ? 'info' : 'warning',
    ),
  )
}

// Host (or the auto-advance timer): leave the inline result beat — go to the next
// question, or stop on the round summary after the last one.
export async function advanceAfterResult(room: Room): Promise<void> {
  const rs = room.roundState
  if (!rs || rs.status !== 'question-result') return

  if (rs.questionIndex < rs.questions.length - 1) {
    await updateDoc(doc(db, 'rooms', room.code), {
      'roundState.status': 'answering',
      'roundState.questionIndex': rs.questionIndex + 1,
      'roundState.questionDeadline': Date.now() + room.settings.answerTimeSeconds * 1000,
      'roundState.resultDeadline': null,
    })
    return
  }

  await updateDoc(doc(db, 'rooms', room.code), {
    'roundState.status': 'summary',
    'roundState.resultDeadline': null,
  })
}

// Host: from the round summary, build and start the next round's questions. The
// summary screen itself is the ready-up, so this goes straight into answering.
export async function nextRound(room: Room, pack: QuestionPack): Promise<void> {
  const rs = room.roundState
  if (!rs || rs.status !== 'summary' || rs.isFinalRound) return
  const nextIndex = rs.roundIndex + 1
  const isFinalRound = nextIndex >= rs.roundsCount - 1

  const questions = buildRound(pack, room.settings, room.settings.seed, nextIndex, isFinalRound)
  if (questions.length === 0) {
    await showFinalResults(room)
    return
  }

  await updateDoc(doc(db, 'rooms', room.code), {
    'roundState.roundIndex': nextIndex,
    'roundState.status': 'answering',
    'roundState.questionIndex': 0,
    'roundState.questionDeadline': Date.now() + room.settings.answerTimeSeconds * 1000,
    'roundState.resultDeadline': null,
    'roundState.scoredCount': 0,
    'roundState.isFinalRound': isFinalRound,
    'roundState.questions': questions,
    'roundState.answers': {},
    'roundState.ready': {},
    'roundState.roundStartScores': snapshotScores(room),
    messages: arrayUnion(
      makeMessage(
        isFinalRound
          ? `Final round! All hardest questions, worth $${questions[0]?.points ?? 0} each.`
          : `Round ${nextIndex + 1} begins! Questions are worth $${questions[0]?.points ?? 0} each.`,
      ),
    ),
  })
}

// Host: from the final round's summary, roll the cinematic final standings.
export async function showFinalResults(room: Room): Promise<void> {
  const rs = room.roundState
  if (!rs) return
  await updateDoc(doc(db, 'rooms', room.code), {
    'roundState.status': 'final',
    'roundState.resultDeadline': null,
  })
}
