import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RedirectIfAuth } from './components/auth/RequireAuth'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import UpgradeAccount from './pages/UpgradeAccount'
import Lobby from './pages/Lobby'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/sign-in"
            element={<RedirectIfAuth><SignIn /></RedirectIfAuth>}
          />
          <Route
            path="/sign-up"
            element={<RedirectIfAuth><SignUp /></RedirectIfAuth>}
          />
          <Route
            path="/upgrade"
            element={<RequireAuth anonymousOnly><UpgradeAccount /></RequireAuth>}
          />
          <Route
            path="/lobby"
            element={<RequireAuth><Lobby /></RequireAuth>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
