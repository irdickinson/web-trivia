import { useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { matchAnswer } from '../../lib/fuzzy'
import { useAudio } from '../../hooks/useAudio'

interface Props {
  room: Room
  user: User
  isHost: boolean
  audio: ReturnType<typeof useAudio>
  onAdvanceReveal: () => void
  onNextRound: () => void
}

// Per-question results reveal between rounds: the host steps through the round's
// questions one at a time so everyone watches the scores build up. Scores are
// applied server-side as each question is revealed (see advanceReveal).
export function RoundReveal({ room, user, isHost, audio, onAdvanceReveal, onNextRound }: Props) {
  const rs = room.roundState!
  const q = rs.questions[rs.revealIndex]

  const opts = {
    typoTolerance: room.settings.typoTolerance,
    variantMatching: room.settings.variantMatching,
    caseInsensitive: true,
  }

  const moreToReveal = rs.appliedReveal < rs.questions.length
  const isLastRound = rs.roundIndex >= rs.roundsCount - 1

  // SFX for my own result as each question is revealed.
  useEffect(() => {
    if (!q) return
    const mine = rs.answers[q.questionId]?.[user.uid]
    if (mine === undefined) { audio.playSfx('timeout'); return }
    const correct = matchAnswer(mine, q.correctAnswers, opts).matched
    audio.playSfx(correct ? 'correct' : 'incorrect')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rs.revealIndex])

  // Players are ordered by score so the standings read like a leaderboard.
  const players = Object.values(room.players).sort((a, b) => b.score - a.score)
  const ansMap = q ? rs.answers[q.questionId] ?? {} : {}

  const advanceRef = useRef(onAdvanceReveal)
  advanceRef.current = onAdvanceReveal

  if (!q) return null

  return (
    <div className="round-stage panel elevated-panel stack">
      <div className="round-topline">
        <span className="eyebrow" style={{ marginBottom: 0 }}>
          Round {rs.roundIndex + 1} results
        </span>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {q.category} · ${q.points}
        </span>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {rs.revealIndex + 1} of {rs.questions.length}
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
        {isHost ? (
          moreToReveal ? (
            <button className="btn-lg" onClick={onAdvanceReveal}>Reveal next →</button>
          ) : (
            <button className="btn-lg" onClick={onNextRound}>
              {isLastRound ? 'See final scores' : `Start round ${rs.roundIndex + 2} →`}
            </button>
          )
        ) : (
          <span className="muted" style={{ fontSize: '0.88rem' }}>
            {moreToReveal ? 'Revealing results…' : 'Waiting for the host…'}
          </span>
        )}
      </div>
    </div>
  )
}
