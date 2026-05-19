import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <PageMeta
        title="Create Account"
        description="Create a free Web Trivia account to host and join multiplayer trivia games with your friends."
        path="/sign-up"
      />
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Join the game</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see you"
              minLength={2}
              maxLength={30}
              autoComplete="nickname"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              autoComplete="new-password"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
