import { useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { matchAnswer } from '../../lib/fuzzy'
import { useAudio } from '../../hooks/useAudio'

interface Props {
  room: Room
  user: User
  isHost: boolean
  audio: ReturnType<typeof useAudio>
  onAdvance: () => void   // host / timer: next question or round summary
}

function useCountdown(deadline: number | null | undefined): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])
  if (!deadline) return 0
  return Math.max(0, deadline - now)
}

// The inline ~5s result beat after a question closes: shows who got it right and
// the running totals, then auto-advances. The round does not fully stop here.
export function RoundQuestionResult({ room, user, isHost, audio, onAdvance }: Props) {
  const rs = room.roundState!
  const q = rs.questions[rs.questionIndex]

  const opts = {
    typoTolerance: room.settings.typoTolerance,
    variantMatching: room.settings.variantMatching,
    caseInsensitive: true,
  }

  const isLastQuestion = rs.questionIndex >= rs.questions.length - 1
  const msLeft = useCountdown(rs.resultDeadline)

  // SFX for my own result, once per revealed question.
  useEffect(() => {
    if (!q) return
    const mine = rs.answers[q.questionId]?.[user.uid]
    if (mine === undefined) { audio.playSfx('timeout'); return }
    const correct = matchAnswer(mine, q.correctAnswers, opts).matched
    audio.playSfx(correct ? 'correct' : 'incorrect')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rs.questionIndex])

  // Host auto-advances once the beat's deadline passes.
  const onAdvanceRef = useRef(onAdvance)
  onAdvanceRef.current = onAdvance
  const advancedRef = useRef(false)
  useEffect(() => { advancedRef.current = false }, [rs.questionIndex])
  useEffect(() => {
    if (!isHost) return
    const id = setInterval(() => {
      if (advancedRef.current) return
      if (rs.resultDeadline != null && Date.now() > rs.resultDeadline) {
        advancedRef.current = true
        onAdvanceRef.current()
      }
    }, 200)
    return () => clearInterval(id)
  }, [isHost, rs.resultDeadline])

  if (!q) return null

  const players = Object.values(room.players).sort((a, b) => b.score - a.score)
  const ansMap = rs.answers[q.questionId] ?? {}

  return (
    <div className="round-stage panel elevated-panel stack">
      <div className="round-topline">
        <span className="eyebrow" style={{ marginBottom: 0 }}>
          Round {rs.roundIndex + 1} · result
        </span>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {q.category} · ${q.points}
        </span>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {rs.questionIndex + 1} of {rs.questions.length}
        </span>
      </div>

      <div className="clue-box round-clue">{q.clue}</div>

      <div className="round-answer-line">
        <span className="eyebrow" style={{ marginBottom: 0 }}>Answer</span>
        <strong style={{ color: 'var(--gold)' }}>{q.correctAnswers[0] ?? ''}</strong>
      </div>

      <ul className="reveal-list">
        {players.map((p) => {
          const submitted = ansMap[p.uid]
          const correct = submitted !== undefined && matchAnswer(submitted, q.correctAnswers, opts).matched
          return (
            <li key={p.uid} className={`reveal-row${correct ? ' correct' : ' incorrect'}${p.uid === user.uid ? ' me' : ''}`}>
              <span className="reveal-name">{p.name}</span>
              <span className="reveal-answer muted">
                {submitted === undefined ? '— no answer' : submitted}
              </span>
              <span className="reveal-points">{correct ? `+$${q.points}` : ''}</span>
              <span className="reveal-total">${p.score.toLocaleString()}</span>
            </li>
          )
        })}
      </ul>

      <div className="round-footline">
        <span className="muted" style={{ fontSize: '0.82rem' }}>
          {isLastQuestion ? 'Round summary' : 'Next question'} in {Math.ceil(msLeft / 1000)}s…
        </span>
        {isHost && (
          <button className="secondary mini-btn" onClick={onAdvance}>
            {isLastQuestion ? 'Round summary →' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  )
}
