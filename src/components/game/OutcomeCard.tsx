import { Room, ClueOutcome } from '../../types/game'
import { User } from 'firebase/auth'

interface Props {
  room: Room
  user: User
  isHost: boolean
  onAdjustScore: (targetUid: string, delta: number) => void
  onContinue: () => void
}

export function OutcomeCard({ room, user, isHost, onAdjustScore, onContinue }: Props) {
  const cs = room.clueState!
  const outcome: ClueOutcome = cs.outcome ?? { wasCorrect: false, pointsDelta: 0, correctAnswer: '' }
  const winner = outcome.winnerId ? room.players[outcome.winnerId] : null

  const isCorrect = outcome.wasCorrect
  const isIncorrect = !outcome.wasCorrect && !!outcome.winnerId
  const overlayVariant = isCorrect ? 'correct' : isIncorrect ? 'incorrect' : 'timeout'

  return (
    <div className={`result-overlay ${overlayVariant}`}>
      <div className="result-card panel elevated-panel stack">

        {/* Verdict */}
        <div style={{ textAlign: 'center' }}>
          {isCorrect && winner && (
            <>
              <p style={{ color: 'var(--success)', fontWeight: 900, fontSize: '1.3rem' }}>
                {winner.name} got it!
              </p>
              <p style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.2rem' }}>
                +${outcome.pointsDelta.toLocaleString()}
              </p>
            </>
          )}
          {isIncorrect && winner && (
            <>
              <p style={{ color: 'var(--danger)', fontWeight: 900, fontSize: '1.3rem' }}>Wrong answer</p>
              {room.settings.deductOnWrongAnswer && outcome.pointsDelta < 0 && (
                <p style={{ color: 'var(--danger)', opacity: 0.8, fontWeight: 800, marginTop: '0.2rem' }}>
                  −${Math.abs(outcome.pointsDelta).toLocaleString()}
                </p>
              )}
            </>
          )}
          {!isCorrect && !isIncorrect && (
            <p style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.3rem' }}>Time ran out</p>
          )}
          <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.95rem' }}>
            Answer:{' '}
            <strong style={{ color: 'var(--text)' }}>
              {outcome.correctAnswer || cs.correctAnswers[0]}
            </strong>
          </p>
          <p
            className="muted"
            style={{ fontSize: '0.72rem', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}
          >
            {cs.category} · ${cs.value}
          </p>
        </div>

        {/* Submitted answers */}
        {Object.keys(cs.submittedAnswers).length > 0 && (
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.55rem' }}>Submitted</div>
            <div className="submitted-grid">
              {Object.entries(cs.submittedAnswers).map(([uid, ans]) => {
                const player = room.players[uid]
                const isWinner = uid === outcome.winnerId && outcome.wasCorrect
                return (
                  <div key={uid} className={`submitted-pill${isWinner ? ' up' : ''}`}>
                    <span
                      className="muted"
                      style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%' }}
                    >
                      {player?.name ?? uid}
                    </span>
                    <span style={{ fontWeight: isWinner ? 700 : 400, color: isWinner ? 'var(--success)' : 'var(--text)', fontSize: '0.88rem' }}>
                      {ans}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Host score adjustment */}
        {isHost && (
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '0.85rem' }}>
            <div className="eyebrow" style={{ marginBottom: '0.55rem' }}>Score adjust</div>
            <div className="stack compact-stack">
              {Object.values(room.players).map((p) => (
                <div key={p.uid} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      minWidth: '4.5rem',
                      textAlign: 'right',
                      color: p.score < 0 ? 'var(--danger)' : 'var(--muted)',
                    }}
                  >
                    ${p.score.toLocaleString()}
                  </span>
                  <button
                    className="mini-btn secondary"
                    onClick={() => onAdjustScore(p.uid, cs.value)}
                    title={`+$${cs.value}`}
                    style={{ background: 'rgba(110,231,168,0.1)', borderColor: 'rgba(110,231,168,0.22)', color: 'var(--success)', minWidth: '2rem' }}
                  >
                    +
                  </button>
                  <button
                    className="mini-btn secondary"
                    onClick={() => onAdjustScore(p.uid, -cs.value)}
                    title={`−$${cs.value}`}
                    style={{ background: 'rgba(255,127,127,0.1)', borderColor: 'rgba(255,127,127,0.22)', color: 'var(--danger)', minWidth: '2rem' }}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isHost ? (
          <button className="btn-lg" style={{ width: '100%' }} onClick={onContinue}>
            Continue →
          </button>
        ) : (
          <p className="muted" style={{ textAlign: 'center', fontSize: '0.8rem' }}>Waiting for host to continue…</p>
        )}
      </div>
    </div>
  )
}
