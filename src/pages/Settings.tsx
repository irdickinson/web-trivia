import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

export default function Settings() {
  const { user, isAnonymous, updateDisplayName, signOut } = useAuth()
  const { open } = useAuthModal()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(0)
  const [error, setError] = useState('')

  const meta = (
    <PageMeta title="Settings" description="Manage your Web Trivia account." path="/settings" />
  )

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      await updateDisplayName(name)
      setSavedAt(Date.now())
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  // Guests have no account to manage — nudge them to create one.
  if (isAnonymous) {
    return (
      <main className="page">
        {meta}
        <div className="narrow-page stack">
          <div>
            <div className="eyebrow">Account</div>
            <h1 className="page-title">Settings</h1>
          </div>
          <div className="panel elevated-panel stack" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              You&apos;re playing as a guest. Create an account to set a permanent display name,
              keep your stats, and climb the leaderboard.
            </p>
            <div className="auth-card-actions" style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
              <button className="btn-lg" onClick={() => open('signup')}>Create Account</button>
              <button className="secondary btn-lg" onClick={() => open('signin')}>Sign In</button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const nameChanged = name.trim() !== (user?.displayName ?? '')

  return (
    <main className="page">
      {meta}
      <div className="narrow-page stack" style={{ gap: '1.5rem' }}>
        <div>
          <div className="eyebrow">Account</div>
          <h1 className="page-title">Settings</h1>
        </div>

        <section className="panel elevated-panel stack">
          <div>
            <h2 className="section-heading">Profile</h2>
            <p className="muted" style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Signed in as {user?.email}
            </p>
          </div>

          <label className="stack" style={{ gap: '0.4rem' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Display name</span>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSavedAt(0) }}
              placeholder="Display name"
              maxLength={30}
            />
          </label>

          {error && <p className="error">{error}</p>}
          {savedAt > 0 && !error && <p className="muted" style={{ fontSize: '0.85rem' }}>Saved.</p>}

          <button
            className="btn-lg"
            onClick={handleSave}
            disabled={saving || !name.trim() || !nameChanged}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </section>

        <section className="panel elevated-panel stack">
          <h2 className="section-heading">Session</h2>
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            Sign out of this device. Your stats are saved to your account.
          </p>
          <button className="danger btn-lg" style={{ alignSelf: 'flex-start' }} onClick={handleSignOut}>
            Sign out
          </button>
        </section>
      </div>
    </main>
  )
}
