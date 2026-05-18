import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { getAuthErrorMessage } from '../utils/authErrors'

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Save Your Progress</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Link an account to keep your question sets and stats. Your current guest
            session carries over — nothing is lost.
          </p>
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
              Save Account
            </Button>
          </form>
        </Card>

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-400 text-center transition-colors"
        >
          ← Go back
        </button>
      </div>
    </div>
  )
}
