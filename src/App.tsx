import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RedirectIfAuth } from './components/auth/RequireAuth'
import { LoadingScreen } from './components/ui/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const UpgradeAccount = lazy(() => import('./pages/UpgradeAccount'))
const Lobby = lazy(() => import('./pages/Lobby'))
const Room = lazy(() => import('./pages/Room'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<RedirectIfAuth><SignIn /></RedirectIfAuth>} />
            <Route path="/sign-up" element={<RedirectIfAuth><SignUp /></RedirectIfAuth>} />
            <Route path="/upgrade" element={<RequireAuth anonymousOnly><UpgradeAccount /></RequireAuth>} />
            <Route path="/lobby" element={<RequireAuth><Lobby /></RequireAuth>} />
            <Route path="/room/:code" element={<RequireAuth><Room /></RequireAuth>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
