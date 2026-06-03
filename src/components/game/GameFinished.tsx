import { Player } from '../../types/game'
import { BackdropOrb } from '../ui/BackdropOrb'
import { ScoreChartRows } from './ScoreChart'

interface Props {
  players: Record<string, Player>
  currentUid: string
  onPlayAgain: () => void
}

const RANK_SUFFIX = ['st', 'nd', 'rd']

export function GameFinished({ players, currentUid, onPlayAgain }: Props) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex((p) => p.uid === currentUid) + 1

  return (
    <main className="page center" style={{ padding: '2rem' }}>
      <BackdropOrb />
      <div className="panel elevated-panel stack" style={{ width: 'min(540px, 94vw)', padding: '1.75rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">Game over</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, letterSpacing: '0.01em' }}>
            Final Scores
          </h1>
          {myRank > 0 && (
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              You finished {myRank}{RANK_SUFFIX[myRank - 1] ?? 'th'}
              {myRank === 1 ? ' — well played!' : ''}
            </p>
          )}
        </div>

        <div className="divider" />

        <div className="stack score-chart">
          <ScoreChartRows players={players} currentUid={currentUid} />
        </div>

        <button className="btn-lg" style={{ width: '100%' }} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </main>
  )
}
