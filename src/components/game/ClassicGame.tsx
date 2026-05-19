import { useRef } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { Question } from '../../types/question'
import {
  submitAnswer,
  scoreAndReview,
  applyHostOverride,
  revealAnswer,
  nextQuestion,
} from '../../lib/game'
import { Timer } from './Timer'
import { QuestionCard } from './QuestionCard'
import { ScoreBoard } from './ScoreBoard'
import { ReviewPanel } from './ReviewPanel'
import { Button } from '../ui/Button'

interface Props {
  room: Room
  user: User
  questions: Question[]
}

export function ClassicGame({ room, user, questions }: Props) {
  const isHost = user.uid === room.hostId
  const q = room.currentQuestion
  const scoredRef = useRef(false)

  // Reset the scored guard whenever the question index changes so a new
  // question can be scored after the host advances.
  const lastScoredIndex = useRef<number | null>(null)
  if (q && lastScoredIndex.current !== q.index) {
    scoredRef.current = false
    lastScoredIndex.current = q.index
  }

  if (!q) return null

  const myAnswer = q.answers[user.uid]
  const hasSubmitted = !!myAnswer
  const totalAllowed = Math.min(questions.length, room.settings.totalQuestions)
  const isLastQuestion = q.index + 1 >= totalAllowed

  async function handleTimerExpire() {
    if (!isHost || scoredRef.current) return
    scoredRef.current = true
    await scoreAndReview(room, questions)
  }

  async function handleSubmit(answer: string) {
    await submitAnswer(room.code, user.uid, answer)
  }

  async function handleOverride(uid: string, markCorrect: boolean) {
    await applyHostOverride(room, uid, markCorrect)
  }

  async function handleReveal() {
    await revealAnswer(room, questions)
  }

  async function handleNext() {
    await nextQuestion(room, questions)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {q.status === 'active' && (
          <Timer
            startedAt={q.startedAt}
            timeLimitMs={q.timeLimitMs}
            onExpire={isHost ? handleTimerExpire : undefined}
          />
        )}

        <QuestionCard
          text={q.text}
          questionNumber={q.index + 1}
          totalQuestions={totalAllowed}
          status={q.status}
          hasSubmitted={hasSubmitted}
          myAnswer={myAnswer?.answer}
          correctAnswer={q.correctAnswer}
          onSubmit={q.status === 'active' ? handleSubmit : undefined}
        />

        {q.status === 'review' && (
          isHost ? (
            <ReviewPanel
              answers={q.answers}
              players={room.players}
              onOverride={handleOverride}
              onReveal={handleReveal}
            />
          ) : (
            <p className="text-center text-sm text-gray-500 py-2">
              Host is reviewing answers…
            </p>
          )
        )}

        {q.status === 'revealed' && isHost && (
          <Button size="lg" onClick={handleNext} className="w-full">
            {isLastQuestion ? 'Show Final Scores' : `Next Question (${q.index + 2} / ${totalAllowed})`}
          </Button>
        )}

        {q.status === 'revealed' && !isHost && (
          <p className="text-center text-sm text-gray-500 py-2">
            Waiting for host to advance…
          </p>
        )}

        <ScoreBoard players={room.players} highlightUid={user.uid} />

      </div>
    </div>
  )
}
