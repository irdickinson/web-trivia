import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingScreen } from '../ui/LoadingScreen'

interface Props {
  children: React.ReactNode
  /** If true, only anonymous users are allowed (e.g. the upgrade page). */
  anonymousOnly?: boolean
}

export function RequireAuth({ children, anonymousOnly = false }: Props) {
  const { user, loading, isAnonymous } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/sign-in" replace />
  if (anonymousOnly && !isAnonymous) return <Navigate to="/" replace />

  return <>{children}</>
}

/** Redirects already-authenticated users away from sign-in / sign-up. */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}
