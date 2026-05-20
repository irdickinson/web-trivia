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

export default function Home() {
  const { user, loading, isAnonymous, signInAsGuest } = useAuth()
  const { open } = useAuthModal()
  const navigate = useNavigate()
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <LoadingScreen />

  async function handlePlay() {
    if (user) { navigate('/lobby'); return }
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

  return (
    <main className="hero-section">
      <PageMeta
        title="Free Multiplayer Trivia Game"
        description="Host a trivia room, share the code, and challenge your friends across History, Science, Geography, Pop Culture, and more. No download required."
        path="/"
      />

      <div className="eyebrow" style={{ marginBottom: 0 }}>Multiplayer trivia</div>
      <h1 className="hero-title">Web Trivia</h1>
      <p className="hero-sub">
        Host a game. Share the code. Test your knowledge against friends in real time.
      </p>

      <div className="hero-cta">
        <button
          className="btn-lg"
          onClick={handlePlay}
          disabled={guestLoading}
          style={{ minWidth: '160px', fontSize: '1.05rem' }}
        >
          {guestLoading ? 'Joining…' : user ? 'Play Now' : 'Play as Guest'}
        </button>
        {!user && (
          <button
            className="secondary btn-lg"
            onClick={() => open('signin')}
            style={{ minWidth: '130px' }}
          >
            Sign In
          </button>
        )}
        {user && isAnonymous && (
          <button className="secondary btn-lg" onClick={() => open('signup')}>
            Create Account
          </button>
        )}
      </div>

      {error && <p className="error" style={{ fontSize: '0.88rem' }}>{error}</p>}

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
