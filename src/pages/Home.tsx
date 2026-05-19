import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

export default function Home() {
  const { user, loading, isAnonymous, signInAsGuest, signOut } = useAuth()
  const navigate = useNavigate()
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <LoadingScreen />

  async function handlePlayAsGuest() {
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
    <main className="page center auth-shell">
      <PageMeta
        title="Free Multiplayer Trivia Game"
        description="Host a trivia room, share the code, and challenge your friends across History, Science, Geography, Pop Culture, and more. No download required."
        path="/"
      />
      <div className="panel elevated-panel auth-panel stack">
        <div className="stack" style={{ gap: '0.25rem' }}>
          <div className="eyebrow">Multiplayer trivia</div>
          <h1 className="auth-title show-title">Web Trivia</h1>
          <p className="muted auth-copy">
            Host a game. Join by code. Test your knowledge.
          </p>
        </div>

        <div className="divider" />

        {user ? (
          <div className="stack compact-stack">
            <Link to="/lobby">
              <button className="btn-lg" style={{ width: '100%' }}>
                Play Now
              </button>
            </Link>
            {isAnonymous && (
              <Link to="/upgrade">
                <button className="secondary ghost" style={{ fontSize: '0.88rem' }}>
                  Save progress → create an account
                </button>
              </Link>
            )}
            <button className="ghost secondary" style={{ fontSize: '0.85rem', opacity: 0.6 }} onClick={signOut}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="stack compact-stack">
            <Link to="/sign-in">
              <button className="btn-lg" style={{ width: '100%' }}>Sign In</button>
            </Link>
            <Link to="/sign-up">
              <button className="secondary btn-lg" style={{ width: '100%' }}>Create Account</button>
            </Link>
            <div className="divider" />
            <button
              className="ghost btn-lg"
              onClick={handlePlayAsGuest}
              disabled={guestLoading}
            >
              {guestLoading ? 'Joining…' : 'Play as Guest'}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        )}
      </div>
    </main>
  )
}
