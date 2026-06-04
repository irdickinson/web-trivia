import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'

interface Props {
  room: Room
  user: User
  onSubmit: (answer: string) => void
  onResolve: () => void   // host: close the question and score it (timer / all answered / skip)
}

function useDeadlineMs(deadline: number | null | undefined): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])
  if (!deadline) return 0
  return Math.max(0, deadline - now)
}

// Simultaneous answering screen for rounds mode: everyone answers the same
// question under a shared per-question timer. The host drives the advance when
// the timer runs out or everyone has answered.
export function RoundQuestionView({ room, user, onSubmit, onResolve }: Props) {
  const rs = room.roundState!
  const isHost = user.uid === room.hostId
  const q = rs.questions[rs.questionIndex]

  const msLeft = useDeadlineMs(rs.questionDeadline)
  const totalMs = room.settings.answerTimeSeconds * 1000
  const percent = rs.questionDeadline ? (msLeft / totalMs) * 100 : 0

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const myAnswer = q ? rs.answers[q.questionId]?.[user.uid] : undefined
  const answeredCount = q ? Object.keys(rs.answers[q.questionId] ?? {}).length : 0
  const playerCount = Object.keys(room.players).length

  // Reset the input each new question and focus it.
  useEffect(() => {
    setAnswer('')
    setSubmitting(false)
    if (inputRef.current) inputRef.current.focus()
  }, [rs.questionIndex, rs.roundIndex])

  // Host closes the question on the deadline, or once everyone has answered.
  const onResolveRef = useRef(onResolve)
  useEffect(() => { onResolveRef.current = onResolve })
  const resolvedRef = useRef(false)
  useEffect(() => { resolvedRef.current = false }, [rs.questionIndex, rs.roundIndex])
  useEffect(() => {
    if (!isHost) return
    const id = setInterval(() => {
      if (resolvedRef.current) return
      const overdue = rs.questionDeadline != null && Date.now() > rs.questionDeadline
      const allAnswered = playerCount > 0 && answeredCount >= playerCount
      if (overdue || allAnswered) {
        resolvedRef.current = true
        onResolveRef.current()
      }
    }, 250)
    return () => clearInterval(id)
  }, [isHost, rs.questionDeadline, answeredCount, playerCount])

  if (!q) return null

  async function handleSubmit() {
    if (!answer.trim() || submitting || myAnswer) return
    setSubmitting(true)
    await onSubmit(answer.trim())
    setSubmitting(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSubmit()
  }

  async function handleChoice(opt: string) {
    if (myAnswer || submitting) return
    setSubmitting(true)
    await onSubmit(opt)
    setSubmitting(false)
  }

  return (
    <div className="round-stage panel elevated-panel stack">
      <div className="round-topline">
        <span className="eyebrow" style={{ marginBottom: 0 }}>
          Round {rs.roundIndex + 1} of {rs.roundsCount}
        </span>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          Question {rs.questionIndex + 1} of {rs.questions.length}
        </span>
        <span style={{ color: 'var(--gold)', fontWeight: 900 }}>${q.points}</span>
      </div>

      {/* Per-question timer */}
      <div className="timer-shell answer">
        <div className="timer-meta">
          <span className="eyebrow" style={{ marginBottom: 0 }}>{q.category}</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem' }}>
            {(msLeft / 1000).toFixed(1)}s
          </span>
        </div>
        <div className="timer-track">
          <div className="timer-fill" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
        </div>
      </div>

      <div className="clue-box round-clue">{q.clue}</div>

      <div className="show-status-band">
        {myAnswer ? (
          <span className="tag answer-tag" style={{ fontWeight: 700 }}>
            Locked in: {myAnswer}
          </span>
        ) : q.isMultipleChoice && q.options ? (
          <div className="round-mc-grid">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className="secondary"
                onClick={() => void handleChoice(opt)}
                disabled={submitting}
                style={{ textAlign: 'left', fontWeight: 600 }}
              >
                <span style={{ color: 'var(--gold)', marginRight: '0.4rem' }}>
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="row gap clue-answer-row" style={{ flex: 1, flexWrap: 'wrap' }}>
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              disabled={submitting}
              style={{ flex: '1 1 200px' }}
            />
            <button onClick={handleSubmit} disabled={!answer.trim() || submitting} style={{ flex: '0 0 auto' }}>
              {submitting ? '…' : 'Submit'}
            </button>
          </div>
        )}
      </div>

      <div className="round-footline">
        <span className="muted" style={{ fontSize: '0.82rem' }}>
          {answeredCount} of {playerCount} answered
        </span>
        {isHost && (
          <button className="secondary mini-btn" onClick={onResolve}>
            Reveal answer →
          </button>
        )}
      </div>
    </div>
  )
}
