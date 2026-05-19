import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Room, CurrentQuestion, AnswerEntry } from '../types/game'
import { Question, TypedQuestion, isMultipleChoice } from '../types/question'
import { isAnswerCorrect, calculatePoints } from './fuzzy'

function buildQuestionState(
  question: Question,
  index: number,
  timeLimitMs: number,
): CurrentQuestion {
  return {
    index,
    text: question.text,
    status: 'active',
    startedAt: Date.now(),
    timeLimitMs,
    answers: {},
    ...(isMultipleChoice(question) ? { options: question.options } : {}),
  }
}

export async function startGame(room: Room, questions: Question[]): Promise<void> {
  if (questions.length === 0) return
  await updateDoc(doc(db, 'rooms', room.code), {
    status: 'playing',
    currentQuestion: buildQuestionState(
      questions[0],
      0,
      room.settings.secondsPerQuestion * 1000,
    ),
  })
}

export async function submitAnswer(
  roomCode: string,
  uid: string,
  answer: string,
): Promise<void> {
  const entry: AnswerEntry = {
    uid,
    answer,
    submittedAt: Date.now(),
    isCorrect: null,
    hostOverride: null,
    points: 0,
  }
  await updateDoc(doc(db, 'rooms', roomCode), {
    [`currentQuestion.answers.${uid}`]: entry,
  })
}

export async function scoreAndReview(room: Room, questions: Question[]): Promise<void> {
  const q = room.currentQuestion
  if (!q) return

  const question = questions[q.index]
  const correct = question.answer
  const acceptable = isMultipleChoice(question)
    ? []
    : (question as TypedQuestion).acceptableAnswers

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { 'currentQuestion.status': 'review' }

  for (const [uid, entry] of Object.entries(q.answers)) {
    const isCorrect = isAnswerCorrect(entry.answer, correct, acceptable)
    const points = isCorrect
      ? calculatePoints(
          entry.submittedAt,
          q.startedAt,
          q.timeLimitMs,
          room.settings.speedBonusEnabled,
        )
      : 0

    updates[`currentQuestion.answers.${uid}.isCorrect`] = isCorrect
    updates[`currentQuestion.answers.${uid}.points`] = points
    if (isCorrect) {
      updates[`players.${uid}.score`] = (room.players[uid]?.score ?? 0) + points
    }
  }

  await updateDoc(doc(db, 'rooms', room.code), updates)
}

// Toggles host override for a single player's answer and adjusts their score accordingly.
export async function applyHostOverride(
  room: Room,
  uid: string,
  markCorrect: boolean,
): Promise<void> {
  const q = room.currentQuestion
  if (!q) return

  const entry = q.answers[uid]
  if (!entry) return

  const currentlyCorrect =
    entry.hostOverride !== null ? entry.hostOverride : (entry.isCorrect ?? false)
  if (currentlyCorrect === markCorrect) return

  const currentPoints = entry.points ?? 0
  const newPoints = markCorrect
    ? calculatePoints(
        entry.submittedAt,
        q.startedAt,
        q.timeLimitMs,
        room.settings.speedBonusEnabled,
      )
    : 0

  await updateDoc(doc(db, 'rooms', room.code), {
    [`currentQuestion.answers.${uid}.hostOverride`]: markCorrect,
    [`currentQuestion.answers.${uid}.points`]: newPoints,
    [`players.${uid}.score`]: Math.max(
      0,
      (room.players[uid]?.score ?? 0) + (newPoints - currentPoints),
    ),
  })
}

export async function revealAnswer(room: Room, questions: Question[]): Promise<void> {
  const q = room.currentQuestion
  if (!q) return
  await updateDoc(doc(db, 'rooms', room.code), {
    'currentQuestion.status': 'revealed',
    'currentQuestion.correctAnswer': questions[q.index].answer,
  })
}

export async function nextQuestion(room: Room, questions: Question[]): Promise<void> {
  const q = room.currentQuestion
  if (!q) return

  const nextIndex = q.index + 1
  const totalAllowed = Math.min(questions.length, room.settings.totalQuestions)

  if (nextIndex >= totalAllowed) {
    await updateDoc(doc(db, 'rooms', room.code), {
      status: 'finished',
      currentQuestion: null,
    })
    return
  }

  await updateDoc(doc(db, 'rooms', room.code), {
    currentQuestion: buildQuestionState(
      questions[nextIndex],
      nextIndex,
      room.settings.secondsPerQuestion * 1000,
    ),
  })
}
