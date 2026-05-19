import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { User } from 'firebase/auth'
import { Room, ClueState, GameMode } from '../../types/game'

interface Props {
  room: Room
  user: User
  onBuzz: () => void
  onSubmitAnswer: (answer: string) => void
  onSubmitChoice: (idx: number) => void
  onHostTimeout: () => void
}

// ── Hooks ────────────────────────────────────────────────────────────────────

function useRevealedText(cs: ClueState): string {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (cs.status !== 'revealing' && cs.status !== 'answering') return
    const id = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(id)
  }, [cs.status, cs.revealStartedAt])
  const elapsed = Date.now() - cs.revealStartedAt
  const chars = Math.min(cs.fullText.length, Math.floor(elapsed / cs.revealSpeedMs))
  return cs.fullText.slice(0, chars)
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

// ── Timer bar ────────────────────────────────────────────────────────────────

function TimerBar({
  label,
  secsLeft,
  percent,
  variant,
}: {
  label: string
  secsLeft: number
  percent: number
  variant: 'answer' | 'buzz'
}) {
  return (
    <div className={`timer-shell ${variant}`} style={{ minWidth: '120px' }}>
      <div className="timer-meta">
        <span className="eyebrow" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem' }}>
          {secsLeft.toFixed(1)}s
        </span>
      </div>
      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function ClueView({ room, user, onBuzz, onSubmitAnswer, onSubmitChoice, onHostTimeout }: Props) {
  const cs = room.clueState!
  const isHost = user.uid === room.hostId
  const mode: GameMode = room.settings.mode
  const isJeopardy = mode === 'jeopardy'

  const revealedText = useRevealedText(cs)
  const buzzMsLeft = useDeadlineMs(cs.buzzDeadline)
  const answerMsLeft = useDeadlineMs(cs.answerDeadline)
  const isFullyRevealed = revealedText.length >= cs.fullText.length

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEligibleToBuzz =
    cs.status === 'revealing' &&
    isJeopardy &&
    cs.remainingEligiblePlayers.includes(user.uid) &&
    !cs.activeAnswerPlayerId

  const isActiveAnswerer = cs.activeAnswerPlayerId === user.uid
  const myAnswer = cs.submittedAnswers[user.uid]

  const onHostTimeoutRef = useRef(onHostTimeout)
  useEffect(() => { onHostTimeoutRef.current = onHostTimeout })

  useEffect(() => {
    if (!isHost) return
    const id = setInterval(() => {
      if (cs.status === 'revealing' && cs.buzzDeadline && Date.now() > cs.buzzDeadline) {
        onHostTimeoutRef.current()
      }
      if ((cs.status === 'buzzed' || cs.status === 'answering') && cs.answerDeadline && Date.now() > cs.answerDeadline) {
        onHostTimeoutRef.current()
      }
    }, 200)
    return () => clearInterval(id)
  }, [isHost, cs.status, cs.buzzDeadline, cs.answerDeadline])

  const hostTransitionedRef = useRef(false)
  useEffect(() => {
    if (!isHost || isJeopardy || hostTransitionedRef.current) return
    if (isFullyRevealed && cs.status === 'revealing') {
      hostTransitionedRef.current = true
      onHostTimeoutRef.current()
    }
  }, [isFullyRevealed, cs.status, isHost, isJeopardy])
  useEffect(() => { hostTransitionedRef.current = false }, [cs.questionId])

  useEffect(() => {
    if ((isActiveAnswerer || (cs.status === 'answering' && !myAnswer)) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [cs.status, isActiveAnswerer, myAnswer])

  async function handleSubmit() {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    await onSubmitAnswer(answer.trim())
    setAnswer('')
    setSubmitting(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSubmit()
  }

  const totalBuzzMs = cs.fullText.length * cs.revealSpeedMs + room.settings.postRevealBuzzSeconds * 1000
  const buzzPercent = cs.buzzDeadline ? (buzzMsLeft / totalBuzzMs) * 100 : 0
  const answerPercent = cs.answerDeadline ? (answerMsLeft / (room.settings.answerTimeSeconds * 1000)) * 100 : 0

  return (
    <div className="clue-overlay">
      <div className="clue-popup panel elevated-panel stack">

        {/* Header: category + value + timers */}
        <div className="clue-header">
          <div className="row gap">
            <span className="eyebrow" style={{ marginBottom: 0 }}>{cs.category}</span>
            <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.2rem' }}>${cs.value}</span>
          </div>
          <div className="row gap">
            {cs.status === 'revealing' && isJeopardy && cs.buzzDeadline && buzzMsLeft > 0 && (
              <TimerBar label="Buzz" secsLeft={buzzMsLeft / 1000} percent={buzzPercent} variant="buzz" />
            )}
            {(cs.status === 'buzzed' || cs.status === 'answering') && cs.answerDeadline && answerMsLeft > 0 && (
              <TimerBar label="Answer" secsLeft={answerMsLeft / 1000} percent={answerPercent} variant="answer" />
            )}
          </div>
        </div>

        {/* Clue text */}
        <div className="clue-box clue-popup-box">
          {revealedText}
          {!isFullyRevealed && <span style={{ opacity: 0.55 }}>▌</span>}
        </div>

        {/* Action / status band */}
        <div className="show-status-band">

          {/* Buzz button */}
          {isEligibleToBuzz && isFullyRevealed && (
            <button className="btn-lg" onClick={onBuzz} style={{ fontSize: '1.1rem', letterSpacing: '0.06em' }}>
              BUZZ IN
            </button>
          )}

          {/* Buzzed-in indicator */}
          {cs.status === 'buzzed' && cs.activeAnswerPlayerId && (
            <span className={`tag${isActiveAnswerer ? ' answer-tag' : ''}`} style={{ fontWeight: 700 }}>
              {isActiveAnswerer
                ? 'You buzzed in!'
                : `${room.players[cs.activeAnswerPlayerId]?.name ?? 'Someone'} buzzed in`}
            </span>
          )}

          {/* Classic / speed — everyone answers */}
          {cs.status === 'answering' && !isJeopardy && !myAnswer && (
            <span className="muted" style={{ fontSize: '0.88rem' }}>Everyone answer now!</span>
          )}

          {/* Text answer input */}
          {(cs.status === 'answering' || (cs.status === 'buzzed' && isActiveAnswerer)) &&
            mode !== 'multiple-choice' && (
            <div className="row gap clue-answer-row" style={{ flex: 1, flexWrap: 'wrap' }}>
              <input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={myAnswer ? `Submitted: ${myAnswer}` : 'Type your answer…'}
                disabled={!!myAnswer || submitting}
                style={{ flex: '1 1 200px' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!!myAnswer || !answer.trim() || submitting}
                style={{ flex: '0 0 auto' }}
              >
                {submitting ? '…' : 'Submit'}
              </button>
            </div>
          )}

          {/* Multiple choice */}
          {mode === 'multiple-choice' && cs.status === 'answering' && cs.options && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', flex: 1 }}>
              {cs.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => !myAnswer && onSubmitChoice(idx)}
                  disabled={!!myAnswer}
                  className={myAnswer === opt ? '' : 'secondary'}
                  style={{ textAlign: 'left', fontWeight: myAnswer === opt ? 800 : 600 }}
                >
                  <span style={{ color: 'var(--gold)', marginRight: '0.4rem' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Submitted confirmation */}
          {myAnswer && cs.status !== 'resolved' && (
            <span className="muted" style={{ fontSize: '0.8rem' }}>
              Submitted: <strong style={{ color: 'var(--text)' }}>{myAnswer}</strong>
            </span>
          )}

          {/* Not eligible to buzz */}
          {isJeopardy && cs.status === 'revealing' && !isEligibleToBuzz &&
            !cs.remainingEligiblePlayers.includes(user.uid) && (
            <span className="muted" style={{ fontSize: '0.8rem' }}>Not eligible to buzz this clue</span>
          )}

          {/* Waiting for active answerer */}
          {cs.status === 'buzzed' && !isActiveAnswerer && (
            <span className="muted" style={{ fontSize: '0.88rem' }}>
              Waiting for{' '}
              <strong style={{ color: 'var(--text)' }}>
                {room.players[cs.activeAnswerPlayerId ?? '']?.name ?? 'player'}
              </strong>
              {' '}to answer…
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
