import { useState, KeyboardEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { QuestionStatus } from '../../types/game'

interface Props {
  text: string
  questionNumber: number
  totalQuestions: number
  status: QuestionStatus
  hasSubmitted: boolean
  myAnswer?: string
  correctAnswer?: string
  onSubmit?: (answer: string) => void
}

export function QuestionCard({
  text,
  questionNumber,
  totalQuestions,
  status,
  hasSubmitted,
  myAnswer,
  correctAnswer,
  onSubmit,
}: Props) {
  const [answer, setAnswer] = useState('')

  function handleSubmit() {
    if (!answer.trim() || hasSubmitted || !onSubmit) return
    onSubmit(answer.trim())
    setAnswer('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col gap-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">
        Question {questionNumber} of {totalQuestions}
      </p>

      <p className="text-xl font-medium text-white leading-relaxed">{text}</p>

      {status === 'active' && (
        <div className="flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasSubmitted ? 'Answer submitted ✓' : 'Type your answer…'}
            disabled={hasSubmitted}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={hasSubmitted || !answer.trim()}>
            {hasSubmitted ? '✓' : 'Submit'}
          </Button>
        </div>
      )}

      {(status === 'review' || status === 'revealed') && myAnswer && (
        <p className="text-sm text-gray-400">
          Your answer: <span className="text-white">{myAnswer}</span>
        </p>
      )}

      {status === 'revealed' && correctAnswer && (
        <p className="text-sm">
          Correct answer:{' '}
          <span className="font-medium text-green-400">{correctAnswer}</span>
        </p>
      )}
    </div>
  )
}
