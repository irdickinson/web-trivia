import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { ReadyRoster } from './ReadyRoster'

interface Props {
  room: Room
  user: User
  isHost: boolean
  onToggleReady: () => void
  onNextRound: () => void
  onShowFinal: () => void
}

// Full-stop screen after a round's last question: current standings with each
// player's score change from the round just played. For non-final rounds it also
// serves as the ready-up for the next round (host starts it).
export function RoundSummary({ room, user, isHost, onToggleReady, onNextRound, onShowFinal }: Props) {
  const rs = room.roundState!
  const players = Object.values(room.players).sort((a, b) => b.score - a.score)

  return (
    <div className="round-stage panel elevated-panel stack">
      <div className="stack" style={{ gap: '0.25rem', textAlign: 'center' }}>
        <span className="eyebrow" style={{ marginBottom: 0 }}>
          Round {rs.roundIndex + 1} complete
        </span>
        <h2 className="round-intro-title">Standings</h2>
      </div>

      <ul className="summary-list">
        {players.map((p, i) => {
          const delta = p.score - (rs.roundStartScores?.[p.uid] ?? 0)
          return (
            <li key={p.uid} className={`summary-row${p.uid === user.uid ? ' me' : ''}`}>
              <span className="rank-pill">{i + 1}</span>
              <span className="summary-name">{p.name}</span>
              <span className={`summary-delta${delta > 0 ? ' up' : ''}`}>
                {delta > 0 ? `+$${delta.toLocaleString()}` : '—'}
              </span>
              <span className="summary-total">${p.score.toLocaleString()}</span>
            </li>
          )
        })}
      </ul>

      {!rs.isFinalRound && (
        <>
          <div className="divider" />
          <ReadyRoster room={room} user={user} onToggleReady={onToggleReady} />
        </>
      )}

      <div className="round-footline" style={{ justifyContent: 'center' }}>
        {isHost ? (
          rs.isFinalRound ? (
            <button className="btn-lg" onClick={onShowFinal}>See final results →</button>
          ) : (
            <button className="btn-lg" onClick={onNextRound}>
              Start round {rs.roundIndex + 2} →
            </button>
          )
        ) : (
          <span className="muted" style={{ fontSize: '0.88rem' }}>
            {rs.isFinalRound ? 'Waiting for the host…' : 'Waiting for the host to start the next round…'}
          </span>
        )}
      </div>
    </div>
  )
}
