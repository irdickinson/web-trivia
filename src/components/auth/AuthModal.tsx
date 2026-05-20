import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { getAuthErrorMessage } from '../../utils/authErrors'

const ADMIN_EMAIL = 'admin@webtrivia.dev'
const ADMIN_PASS = 'Admin1234!'

export function AuthModal() {
  const { isOpen, tab, close, open } = useAuthModal()
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when tab changes or modal closes
  useEffect(() => {
    setError('')
    setEmail('')
    setPassword('')
    setDisplayName('')
  }, [tab, isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      close()
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUpWithEmail(email, password, displayName)
      close()
      navigate('/')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="panel elevated-panel auth-modal-card stack" style={{ padding: '1.5rem' }}>
        <button className="modal-close" onClick={close} aria-label="Close">×</button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'signin' ? ' active' : ''}`}
            onClick={() => open('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => open('signup')}
          >
            Create Account
          </button>
        </div>

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="stack compact-stack">
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
            {error && <p className="error" style={{ fontSize: '0.88rem' }}>{error}</p>}
            <button type="submit" className="btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            {import.meta.env.DEV && (
              <p style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                <button
                  type="button"
                  className="dev-quick-fill"
                  onClick={() => { setEmail(ADMIN_EMAIL); setPassword(ADMIN_PASS) }}
                >
                  [DEV] Fill admin credentials
                </button>
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="stack compact-stack">
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
            {error && <p className="error" style={{ fontSize: '0.88rem' }}>{error}</p>}
            <button type="submit" className="btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
