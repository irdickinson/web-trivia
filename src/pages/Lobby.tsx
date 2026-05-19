import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createRoom, joinRoom, DEFAULT_SETTINGS } from '../lib/rooms'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { GameMode, GameSettings } from '../types/game'

const MODES: { value: GameMode; label: string; description: string }[] = [
  { value: 'jeopardy',         label: 'Jeopardy',         description: 'Choose a clue, buzz in, answer' },
  { value: 'classic',          label: 'Classic',          description: 'Everyone answers at once' },
  { value: 'multiple-choice',  label: 'Multiple Choice',  description: 'Pick from 4 options' },
  { value: 'speed',            label: 'Speed',            description: 'First correct answer wins' },
]

const REVEAL_SPEEDS = [
  { label: 'Slow',   value: 80 },
  { label: 'Medium', value: 40 },
  { label: 'Fast',   value: 20 },
]

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}

function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-700'}`} />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </div>
      <div>
        <p className="text-sm text-gray-200 group-hover:text-white transition-colors">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </label>
  )
}

export default function Lobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const defaultName = user?.displayName ?? ''

  // ── Create room state ──────────────────────────────────────────────────────
  const [createName, setCreateName] = useState(defaultName)
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // ── Join room state ────────────────────────────────────────────────────────
  const [joinName, setJoinName] = useState(defaultName)
  const [roomCode, setRoomCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  function patch(delta: Partial<GameSettings>) {
    setSettings((s) => ({ ...s, ...delta }))
  }

  async function handleCreate() {
    if (!user) return
    setCreateError('')
    setCreateLoading(true)
    try {
      const code = await createRoom(user, createName, settings)
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
    if (!roomCode.trim()) { setJoinError('Enter a room code.'); return }
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

  const selectClass = 'bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider'

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Play</h1>

        <div className="grid md:grid-cols-2 gap-6 items-start">

          {/* ── Create Room ───────────────────────────────────────────────── */}
          <Card className="flex flex-col gap-5">
            <h2 className="text-xl font-semibold">Create Room</h2>

            <Input
              label="Your name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              maxLength={30}
              placeholder="Display name"
            />

            {/* Mode picker */}
            <div className="flex flex-col gap-2">
              <p className={labelClass}>Game mode</p>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => patch({ mode: m.value })}
                    className={`p-2.5 rounded-lg border text-left text-sm transition-colors ${
                      settings.mode === m.value
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Board size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Categories</label>
                <select
                  value={settings.categoryCount}
                  onChange={(e) => patch({ categoryCount: parseInt(e.target.value) })}
                  className={selectClass}
                >
                  {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Rows</label>
                <select
                  value={settings.questionCountPerCategory}
                  onChange={(e) => {
                    const rows = parseInt(e.target.value)
                    const vals = Array.from({ length: rows }, (_, i) => (i + 1) * 100)
                    patch({ questionCountPerCategory: rows, pointValues: vals })
                  }}
                  className={selectClass}
                >
                  {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Reveal speed */}
            <div className="flex flex-col gap-1">
              <p className={labelClass}>Reveal speed</p>
              <div className="flex gap-2">
                {REVEAL_SPEEDS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => patch({ revealSpeedMs: s.value })}
                    className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors ${
                      settings.revealSpeedMs === s.value
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer time */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Answer time: {settings.answerTimeSeconds}s</label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={settings.answerTimeSeconds}
                onChange={(e) => patch({ answerTimeSeconds: parseInt(e.target.value) })}
                className="accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>5s</span><span>30s</span>
              </div>
            </div>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 text-left transition-colors"
            >
              {showAdvanced ? '▲ Hide' : '▼ Show'} advanced settings
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 pt-1 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Buzz window (s)</label>
                    <select
                      value={settings.postRevealBuzzSeconds}
                      onChange={(e) => patch({ postRevealBuzzSeconds: parseInt(e.target.value) })}
                      className={selectClass}
                    >
                      {[3, 5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}s</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Final questions</label>
                    <select
                      value={settings.finalQuestionCount}
                      onChange={(e) => patch({ finalQuestionCount: parseInt(e.target.value) })}
                      className={selectClass}
                      disabled={!settings.enableFinalRound}
                    >
                      {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Toggle
                    label="Allow buzz rebound"
                    description="Wrong answer → other players can still buzz"
                    checked={settings.allowBuzzRebound}
                    onChange={(v) => patch({ allowBuzzRebound: v })}
                  />
                  <Toggle
                    label="Deduct on wrong answer"
                    checked={settings.deductOnWrongAnswer}
                    onChange={(v) => patch({ deductOnWrongAnswer: v })}
                  />
                  <Toggle
                    label="Allow negative scores"
                    checked={settings.allowNegativeScores}
                    onChange={(v) => patch({ allowNegativeScores: v })}
                  />
                  <Toggle
                    label="Typo tolerance"
                    description="Forgives 1-2 character errors"
                    checked={settings.typoTolerance}
                    onChange={(v) => patch({ typoTolerance: v })}
                  />
                  <Toggle
                    label="Enable final round"
                    description="Jeopardy-style wager finish"
                    checked={settings.enableFinalRound}
                    onChange={(v) => patch({ enableFinalRound: v })}
                  />
                </div>
              </div>
            )}

            {createError && <p role="alert" className="text-red-400 text-sm">{createError}</p>}

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

          {/* ── Join Room ─────────────────────────────────────────────────── */}
          <Card className="flex flex-col gap-5">
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

            {joinError && <p role="alert" className="text-red-400 text-sm">{joinError}</p>}

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
    </main>
  )
}
