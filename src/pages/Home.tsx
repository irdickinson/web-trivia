import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { getAuthErrorMessage } from '../utils/authErrors'
import { PageMeta } from '../components/seo/PageMeta'

export default function Home() {
  const { user, loading, isAnonymous, signInAsGuest, signOut } = useAuth()
  const navigate = useNavigate()
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <LoadingScreen />

  async function handlePlayAsGuest() {
    setError('')
    setGuestLoading(true)
    try {
      await signInAsGuest()
      navigate('/lobby')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-8">
      <PageMeta
        title="Free Multiplayer Trivia Game"
        description="Host a trivia room, share the code, and challenge your friends across History, Science, Geography, Pop Culture, and more. No download required."
        path="/"
      />
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight">Web Trivia</h1>
        <p className="text-gray-400 mt-3 text-lg">
          Host a game. Join by code. Test your knowledge.
        </p>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Link to="/lobby" className="w-full">
            <Button size="lg" className="w-full">Play Now</Button>
          </Link>
          {isAnonymous && (
            <Link
              to="/upgrade"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Save your progress → create an account
            </Link>
          )}
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <Link to="/sign-in" className="w-full">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
          <Link to="/sign-up" className="w-full">
            <Button variant="secondary" size="lg" className="w-full">
              Create Account
            </Button>
          </Link>
          <div className="flex items-center gap-3 w-full my-1">
            <hr className="flex-1 border-gray-700" />
            <span className="text-xs text-gray-500">or</span>
            <hr className="flex-1 border-gray-700" />
          </div>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            loading={guestLoading}
            onClick={handlePlayAsGuest}
          >
            Play as Guest
          </Button>
          {error && <p role="alert" className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      )}
    </main>
  )
}
