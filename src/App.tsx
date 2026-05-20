import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext'
import { SiteHeader } from './components/layout/SiteHeader'
import { AuthModal } from './components/auth/AuthModal'
import { RequireAuth } from './components/auth/RequireAuth'
import { LoadingScreen } from './components/ui/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const UpgradeAccount = lazy(() => import('./pages/UpgradeAccount'))
const Lobby = lazy(() => import('./pages/Lobby'))
const Room = lazy(() => import('./pages/Room'))

// Reads ?signin=1 or ?signup=1 from URL and auto-opens the auth modal
function AuthParamHandler() {
  const { open } = useAuthModal()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('signin')) {
      open('signin')
      navigate('/', { replace: true })
    } else if (params.has('signup')) {
      open('signup')
      navigate('/', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

function SiteLayout() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <AuthParamHandler />
      <div className="site-content">
        <Outlet />
      </div>
      <AuthModal />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Routes rendered inside the site shell (sticky header + navbar) */}
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/lobby" element={<RequireAuth><Lobby /></RequireAuth>} />
                <Route path="/upgrade" element={<RequireAuth anonymousOnly><UpgradeAccount /></RequireAuth>} />
              </Route>

              {/* Full-screen game page — no site header */}
              <Route path="/room/:code" element={<RequireAuth><Room /></RequireAuth>} />

              {/* Legacy auth URLs redirect to home with modal auto-open */}
              <Route path="/sign-in" element={<Navigate to="/?signin=1" replace />} />
              <Route path="/sign-up" element={<Navigate to="/?signup=1" replace />} />
            </Routes>
          </Suspense>
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
