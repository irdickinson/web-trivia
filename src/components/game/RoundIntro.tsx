import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { ReadyRoster } from './ReadyRoster'

interface Props {
  room: Room
  user: User
  isHost: boolean
  onToggleReady: () => void
  onStart: () => void
}

// Ready-up screen shown before round 1 begins. Names highlight as players ready
// up, but the host starts the round whenever they like.
export function RoundIntro({ room, user, isHost, onToggleReady, onStart }: Props) {
  const rs = room.roundState!
  const points = rs.questions[0]?.points ?? 0
  const categories = Array.from(new Set(rs.questions.map((q) => q.category)))

  return (
    <div className="round-stage panel elevated-panel stack" style={{ textAlign: 'center' }}>
      <div className="stack" style={{ gap: '0.35rem', alignItems: 'center' }}>
        {rs.isFinalRound && <span className="final-badge">Final Round</span>}
        <span className="eyebrow" style={{ marginBottom: 0 }}>
          Round {rs.roundIndex + 1} of {rs.roundsCount}
        </span>
        <h2 className="round-intro-title">
          {rs.isFinalRound ? 'The hardest questions' : 'Get ready'}
        </h2>
        <p className="muted">
          {rs.questions.length} question{rs.questions.length === 1 ? '' : 's'} · ${points} each
          {rs.isFinalRound ? ' · all top difficulty' : ''}
        </p>
      </div>

      {categories.length > 0 && (
        <div className="round-cat-chips">
          {categories.map((c) => (
            <span key={c} className="cat-chip">{c}</span>
          ))}
        </div>
      )}

      <ReadyRoster room={room} user={user} onToggleReady={onToggleReady} />

      <div className="round-footline" style={{ justifyContent: 'center' }}>
        {isHost ? (
          <button className="btn-lg" onClick={onStart}>Start round →</button>
        ) : (
          <span className="muted" style={{ fontSize: '0.88rem' }}>
            Waiting for the host to start…
          </span>
        )}
      </div>
    </div>
  )
}
