import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'

export function SiteHeader() {
  const { user, isAnonymous, signOut } = useAuth()
  const { open } = useAuthModal()
  const navigate = useNavigate()

  const isSignedInWithAccount = user && !isAnonymous

  const initials = isSignedInWithAccount
    ? (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()
    : null

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      {/* Logo */}
      <Link to="/" className="nav-logo">WEB TRIVIA</Link>

      {/* Nav links */}
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/lobby" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Play
        </NavLink>
        <NavLink to="/leaderboards" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Leaderboards
        </NavLink>
        <NavLink to="/how-to-play" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          How to Play
        </NavLink>
      </nav>

      {/* Auth area */}
      <div className="nav-auth">
        {isSignedInWithAccount ? (
          <>
            <div
              className="user-nav-chip"
              onClick={() => navigate('/settings')}
              title="Account settings"
            >
              <div className="user-avatar">{initials}</div>
              <span>{user.displayName ?? 'Player'}</span>
            </div>
            <button
              className="secondary mini-btn"
              onClick={handleSignOut}
              style={{ fontSize: '0.82rem', opacity: 0.7 }}
            >
              Sign out
            </button>
          </>
        ) : user && isAnonymous ? (
          <>
            <span className="muted" style={{ fontSize: '0.82rem' }}>Playing as guest</span>
            <button className="secondary mini-btn" onClick={() => open('signin')}>Sign In</button>
            <button className="mini-btn" onClick={() => open('signup')}>Create Account</button>
          </>
        ) : (
          <>
            <button className="secondary mini-btn" onClick={() => open('signin')}>Sign In</button>
            <button className="mini-btn" onClick={() => open('signup')}>Create Account</button>
          </>
        )}
      </div>
    </header>
  )
}
