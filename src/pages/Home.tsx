import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

const FEATURES = [
  { icon: '⚡', title: 'Buzz In', desc: 'Race to buzz first and claim the right to answer.' },
  { icon: '🗂️', title: 'Custom Settings', desc: 'Pick category count, rows, point values, and more.' },
  { icon: '🎵', title: 'Live Audio', desc: 'Procedural background music and sound effects throughout.' },
  { icon: '🏆', title: 'Final Round', desc: 'Wager everything on a high-stakes final question.' },
]

const pageMeta = (
  <PageMeta
    title="Free Multiplayer Trivia Game"
    description="Host a trivia room, share the code, and challenge your friends. No download required."
    path="/"
  />
)

export default function Home() {
  const { user, loading, isAnonymous, signInAsGuest } = useAuth()
  const { open } = useAuthModal()
  const navigate = useNavigate()
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <LoadingScreen />

  async function handleGuestPlay() {
    setError('')
    setGuestLoading(true)
    try {
      await signInAsGuest()
      navigate('/lobby')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setGuestLoading(false)
    }
  }

  // Authenticated dashboard
  if (user && !isAnonymous) {
    return (
      <main className="page dashboard-page">
        {pageMeta}
        <div className="dashboard-hero">
          <div className="eyebrow">Welcome back</div>
          <h1 className="dashboard-username">{user.displayName ?? 'Player'}</h1>
        </div>
        <div className="dashboard-cards">
          <div className="panel elevated-panel dashboard-card">
            <span className="eyebrow">Ready to play?</span>
            <h2 className="dashboard-card-title">Jump into a game</h2>
            <p className="dashboard-card-sub">
              Create a room and invite friends, or join an existing game with a code.
            </p>
            <button className="btn-lg" onClick={() => navigate('/lobby')}>Go to Lobby</button>
          </div>
        </div>
        <div className="features-row">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-title">{f.title}</span>
              <span className="feature-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </main>
    )
  }

  // Landing page for unauthenticated / guest users
  return (
    <main className="page landing">
      {pageMeta}
      <section className="landing-hero">
        <div className="eyebrow">Multiplayer trivia</div>
        <h1 className="hero-title">Web Trivia</h1>
        <p className="hero-sub">
          Host a game. Share the code. Test your knowledge against friends in real time.
        </p>

        <div className="panel elevated-panel landing-auth-card">
          {isAnonymous ? (
            <>
              <button className="btn-lg" style={{ width: '100%' }} onClick={() => navigate('/lobby')}>
                Play Now
              </button>
              <div className="landing-auth-divider">save your progress</div>
              <button className="secondary btn-lg" style={{ width: '100%' }} onClick={() => open('signup')}>
                Create Account
              </button>
              <button className="link-btn" onClick={() => open('signin')}>
                Already have an account? Sign in
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-lg"
                style={{ width: '100%' }}
                onClick={handleGuestPlay}
                disabled={guestLoading}
              >
                {guestLoading ? 'Joining…' : 'Play as Guest'}
              </button>
              <div className="landing-auth-divider">or</div>
              <div className="auth-card-actions">
                <button className="secondary btn-lg" onClick={() => open('signin')}>Sign In</button>
                <button className="secondary btn-lg" onClick={() => open('signup')}>Create Account</button>
              </div>
            </>
          )}
          {error && <p className="error" style={{ fontSize: '0.85rem' }}>{error}</p>}
        </div>

        <div className="features-row">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-title">{f.title}</span>
              <span className="feature-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
