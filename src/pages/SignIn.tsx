import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

export default function SignIn() {
  const { signInWithEmail, signInAsGuest } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      navigate('/')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGuest() {
    setError('')
    setLoading(true)
    try {
      await signInAsGuest()
      navigate('/')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page center auth-shell">
      <PageMeta
        title="Sign In"
        description="Sign in to Web Trivia to host or join multiplayer trivia games with friends."
        path="/sign-in"
      />
      <div className="panel elevated-panel auth-panel stack">
        <div>
          <div className="eyebrow">Welcome back</div>
          <h1 className="auth-title">Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="stack compact-stack">
          <label className="stack" style={{ gap: '0.4rem' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="stack" style={{ gap: '0.4rem' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="divider" />

        <div className="stack compact-stack">
          <button className="secondary" onClick={handleGuest} disabled={loading}>
            Continue as guest
          </button>
          <p className="muted" style={{ textAlign: 'center', fontSize: '0.88rem' }}>
            No account?{' '}
            <Link to="/sign-up" style={{ color: 'var(--gold)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
