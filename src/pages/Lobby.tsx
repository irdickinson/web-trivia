import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createRoom, joinRoom, DEFAULT_SETTINGS } from '../lib/rooms'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { GameMode } from '../types/game'

const MODES: { value: GameMode; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Everyone types, shared timer' },
  { value: 'speed', label: 'Speed', description: 'First correct answer wins' },
  { value: 'multiple-choice', label: 'Multiple Choice', description: 'Pick from 4 options' },
  { value: 'fastest-finger', label: 'Fastest Finger', description: 'Buzz in, then answer' },
]

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30]
const TIME_OPTIONS = [10, 15, 20, 30, 45, 60]

export default function Lobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const defaultName = user?.displayName ?? ''

  const [createName, setCreateName] = useState(defaultName)
  const [mode, setMode] = useState<GameMode>('classic')
  const [questionCount, setQuestionCount] = useState(10)
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  const [joinName, setJoinName] = useState(defaultName)
  const [roomCode, setRoomCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  async function handleCreate() {
    if (!user) return
    setCreateError('')
    setCreateLoading(true)
    try {
      const code = await createRoom(user, createName, {
        ...DEFAULT_SETTINGS,
        mode,
        totalQuestions: questionCount,
        secondsPerQuestion: timePerQuestion,
      })
      navigate(`/room/${code}`)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create room.')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleJoin() {
    if (!user) return
    setJoinError('')
    if (!roomCode.trim()) {
      setJoinError('Enter a room code.')
      return
    }
    setJoinLoading(true)
    try {
      const code = roomCode.toUpperCase().trim()
      await joinRoom(code, user, joinName)
      navigate(`/room/${code}`)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join room.')
    } finally {
      setJoinLoading(false)
    }
  }

  const selectClass =
    'bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Play</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <Card className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Create Room</h2>

            <Input
              label="Your name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              maxLength={30}
              placeholder="Display name"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">Game mode</label>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                      mode === m.value
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-gray-400">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className={selectClass}
                >
                  {QUESTION_COUNTS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Seconds / Q</label>
                <select
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  className={selectClass}
                >
                  {TIME_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}s</option>
                  ))}
                </select>
              </div>
            </div>

            {createError && <p className="text-red-400 text-sm">{createError}</p>}

            <Button
              onClick={handleCreate}
              loading={createLoading}
              disabled={!createName.trim()}
              size="lg"
              className="w-full mt-auto"
            >
              Create Room
            </Button>
          </Card>

          {/* Join Room */}
          <Card className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Join Room</h2>

            <Input
              label="Your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              maxLength={30}
              placeholder="Display name"
            />

            <Input
              label="Room code"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              }
              placeholder="XXXXXX"
              maxLength={6}
              className="tracking-widest font-mono text-lg"
            />

            {joinError && <p className="text-red-400 text-sm">{joinError}</p>}

            <Button
              onClick={handleJoin}
              loading={joinLoading}
              disabled={!joinName.trim() || roomCode.length < 6}
              variant="secondary"
              size="lg"
              className="w-full mt-auto"
            >
              Join Room
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
