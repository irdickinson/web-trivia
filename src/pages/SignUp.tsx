import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

export default function SignUp() {
  const { signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUpWithEmail(email, password, displayName)
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
        title="Create Account"
        description="Create a free Web Trivia account to host and join multiplayer trivia games with your friends."
        path="/sign-up"
      />
      <div className="panel elevated-panel auth-panel stack">
        <div>
          <div className="eyebrow">Join the game</div>
          <h1 className="auth-title">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="stack compact-stack">
          <label className="stack" style={{ gap: '0.4rem' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Display Name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see you"
              minLength={2}
              maxLength={30}
              autoComplete="nickname"
              required
            />
          </label>
          <label className="stack" style={{ gap: '0.4rem' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="At least 6 characters"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="muted" style={{ textAlign: 'center', fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <Link to="/sign-in" style={{ color: 'var(--gold)' }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
