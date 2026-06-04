import { useEffect, useMemo, useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { useAudio } from '../../hooks/useAudio'

interface Props {
  room: Room
  user: User
  isHost: boolean
  audio: ReturnType<typeof useAudio>
  onBackToLobby: () => void
  onNewGame: () => void
}

const CONFETTI_COUNT = 40

// Cinematic end-of-game reveal: standings fill in lowest → highest, building to
// the winner with a celebration. Runs locally on every client off the final
// scores already in Firestore — no extra writes needed.
export function FinalRoundCinematic({ room, user, isHost, audio, onBackToLobby, onNewGame }: Props) {
  const ranked = useMemo(
    () => Object.values(room.players).sort((a, b) => b.score - a.score),
    [room.players],
  )
  const n = ranked.length

  // `shown` counts how many places have been revealed, from last place up.
  const [shown, setShown] = useState(0)
  const allRevealed = shown >= n

  useEffect(() => {
    if (shown >= n) return
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 700 : 1400)
    return () => clearTimeout(t)
  }, [shown, n])

  useEffect(() => {
    if (shown === 0) return
    audio.playSfx(shown >= n ? 'correct' : 'tick')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  const myRank = ranked.findIndex((p) => p.uid === user.uid) + 1
  const winner = ranked[0]

  return (
    <div className="round-stage panel elevated-panel stack final-cinematic" style={{ textAlign: 'center' }}>
      {allRevealed && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <span key={i} className="confetti-piece" style={{
              left: `${(i / CONFETTI_COUNT) * 100}%`,
              animationDelay: `${(i % 10) * 0.12}s`,
            }} />
          ))}
        </div>
      )}

      <div className="stack" style={{ gap: '0.3rem', alignItems: 'center' }}>
        <span className="eyebrow" style={{ marginBottom: 0 }}>Game over</span>
        <h1 className="final-title">Final Results</h1>
        {allRevealed && winner && (
          <p className="final-winner-line">
            🏆 {winner.name} wins with ${winner.score.toLocaleString()}!
          </p>
        )}
      </div>

      <ol className="final-standings">
        {ranked.map((p, i) => {
          const place = i + 1
          const revealed = i >= n - shown
          const isWinner = i === 0 && allRevealed
          return (
            <li
              key={p.uid}
              className={
                `final-row${revealed ? ' revealed' : ''}` +
                `${isWinner ? ' winner' : ''}${p.uid === user.uid ? ' me' : ''}`
              }
            >
              <span className="rank-pill final-rank">{place}</span>
              <span className="final-name">{revealed ? p.name : '—'}</span>
              <span className="final-score">{revealed ? `$${p.score.toLocaleString()}` : ''}</span>
            </li>
          )
        })}
      </ol>

      {allRevealed && (
        <>
          {myRank > 0 && (
            <p className="muted">
              You finished {place(myRank)}{myRank === 1 ? ' — well played!' : ''}
            </p>
          )}
          <div className="round-footline" style={{ justifyContent: 'center' }}>
            {isHost ? (
              <>
                <button className="secondary" onClick={onBackToLobby}>Back to lobby</button>
                <button className="btn-lg" onClick={onNewGame}>Start new game →</button>
              </>
            ) : (
              <span className="muted" style={{ fontSize: '0.88rem' }}>
                Waiting for the host…
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const RANK_SUFFIX = ['st', 'nd', 'rd']
function place(rank: number): string {
  return `${rank}${RANK_SUFFIX[rank - 1] ?? 'th'}`
}
