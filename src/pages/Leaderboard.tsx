import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchLeaderboard } from '../lib/stats'
import { PlayerStats } from '../types/stats'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { PageMeta } from '../components/seo/PageMeta'

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState<PlayerStats[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchLeaderboard()
      .then((data) => { if (active) setRows(data) })
      .catch(() => { if (active) setError('Could not load the leaderboard right now.') })
    return () => { active = false }
  }, [])

  return (
    <main className="page">
      <PageMeta
        title="Leaderboards"
        description="See the top Web Trivia players ranked by total score, wins, and games played."
        path="/leaderboards"
      />

      <div className="narrow-page stack">
        <div>
          <div className="eyebrow">Hall of fame</div>
          <h1 className="page-title">Leaderboards</h1>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Ranked by total score across every game. Guest games aren&apos;t counted.
          </p>
        </div>

        {rows === null && !error && <LoadingScreen />}
        {error && <p className="error">{error}</p>}

        {rows && rows.length === 0 && (
          <div className="panel elevated-panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <p className="muted">No games on the board yet. Be the first to finish a game!</p>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="panel elevated-panel leaderboard-card">
            <div className="lb-row lb-head">
              <span className="lb-rank">#</span>
              <span className="lb-name">Player</span>
              <span className="lb-num">Games</span>
              <span className="lb-num">Wins</span>
              <span className="lb-num">Best</span>
              <span className="lb-num lb-total">Total</span>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.uid}
                className={`lb-row${user?.uid === r.uid ? ' me' : ''}`}
              >
                <span className="lb-rank rank-pill">{i + 1}</span>
                <span className="lb-name">{r.displayName}</span>
                <span className="lb-num">{r.gamesPlayed}</span>
                <span className="lb-num">{r.wins}</span>
                <span className="lb-num">${r.bestScore.toLocaleString()}</span>
                <span className="lb-num lb-total">${r.totalScore.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
