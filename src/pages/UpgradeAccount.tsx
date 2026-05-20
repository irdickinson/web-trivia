import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

export default function UpgradeAccount() {
  const { upgradeAccount } = useAuth()
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
      await upgradeAccount(email, password, displayName)
      navigate('/')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page center" style={{ padding: '2rem' }}>
      <PageMeta title="Save Your Progress" description="Link an account to your guest session." path="/upgrade" />
      <div className="panel elevated-panel stack" style={{ width: 'min(480px, 94vw)', padding: '1.75rem' }}>
        <div>
          <div className="eyebrow">Guest account</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem' }}>Save Your Progress</h1>
          <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Link an email account to your guest session — nothing is lost, your UID stays the same.
          </p>
        </div>

        <div className="divider" />

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
          {error && <p className="error" style={{ fontSize: '0.88rem' }}>{error}</p>}
          <button type="submit" className="btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Saving…' : 'Save Account'}
          </button>
        </form>

        <button
          className="secondary"
          style={{ opacity: 0.6, fontSize: '0.88rem' }}
          onClick={() => navigate(-1)}
        >
          ← Go back
        </button>
      </div>
    </main>
  )
}
