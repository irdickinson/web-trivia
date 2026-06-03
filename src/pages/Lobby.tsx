import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createRoom, joinRoom, DEFAULT_SETTINGS } from '../lib/rooms'
import { GameMode, GameSettings } from '../types/game'
import { PageMeta } from '../components/seo/PageMeta'

const MODE_ANSWER_DEFAULTS: Record<GameMode, number> = {
  'jeopardy': 15,
  'classic': 15,
  'multiple-choice': 10,
  'speed': 10,
}

const ANSWER_TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  'jeopardy': 'Buzz in before anyone else, then answer solo',
  'classic': 'Everyone types simultaneously — all correct answers score',
  'multiple-choice': 'Choose from four options, everyone answers at once',
  'speed': 'First correct answer wins the clue',
}

export default function Lobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const defaultName = user?.displayName ?? ''

  const [createName, setCreateName] = useState(defaultName)
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  const [joinName, setJoinName] = useState(defaultName)
  const [roomCode, setRoomCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  function patch(delta: Partial<GameSettings>) {
    setSettings((s) => ({ ...s, ...delta }))
  }

  function handleModeChange(mode: GameMode) {
    patch({ mode, answerTimeSeconds: MODE_ANSWER_DEFAULTS[mode] })
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

  return (
    <main className="page">
      <PageMeta title="Play" description="Host or join a Web Trivia game room." path="/lobby" />

      <div style={{ maxWidth: '980px', margin: '0 auto' }} className="stack">
        <div>
          <div className="eyebrow">Game lobby</div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '0.01em' }}>
            Play Trivia
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>

          {/* ── Create Room ──────────────────────────────────────────────────── */}
          <section className="panel elevated-panel stack lobby-panel">
            <div className="lobby-headline">
              <div>
                <div className="eyebrow">New game</div>
                <h2>Host a room</h2>
              </div>
            </div>

            <label className="stack" style={{ gap: '0.4rem' }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Your name</span>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Display name"
                maxLength={30}
              />
            </label>

            {/* Mode selector */}
            <div className="stack" style={{ gap: '0.4rem' }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Game mode</span>
              <select
                value={settings.mode}
                onChange={(e) => handleModeChange(e.target.value as GameMode)}
              >
                <option value="classic">Classic</option>
                <option value="jeopardy">Jeopardy</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="speed">Speed</option>
              </select>
              <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                {MODE_DESCRIPTIONS[settings.mode]}
              </p>
            </div>

            <div className="settings-grid">
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Categories</span>
                <select
                  value={settings.categoryCount}
                  onChange={(e) => patch({ categoryCount: parseInt(e.target.value) })}
                >
                  {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Rows</span>
                <select
                  value={settings.questionCountPerCategory}
                  onChange={(e) => {
                    const rows = parseInt(e.target.value)
                    patch({ questionCountPerCategory: rows, pointValues: Array.from({ length: rows }, (_, i) => (i + 1) * 100) })
                  }}
                >
                  {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Reveal speed (ms)</span>
                <select
                  value={settings.revealSpeedMs}
                  onChange={(e) => patch({ revealSpeedMs: parseInt(e.target.value) })}
                >
                  <option value={80}>Slow (80)</option>
                  <option value={40}>Medium (40)</option>
                  <option value={20}>Fast (20)</option>
                </select>
              </label>
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Answer timer (s)</span>
                <select
                  value={settings.answerTimeSeconds}
                  onChange={(e) => patch({ answerTimeSeconds: parseInt(e.target.value) })}
                >
                  {ANSWER_TIME_OPTIONS.map((n) => <option key={n} value={n}>{n}s</option>)}
                </select>
              </label>
              {settings.mode === 'jeopardy' && (
                <label>
                  <span className="eyebrow" style={{ marginBottom: 0 }}>Buzz window (s)</span>
                  <select
                    value={settings.postRevealBuzzSeconds}
                    onChange={(e) => patch({ postRevealBuzzSeconds: parseInt(e.target.value) })}
                  >
                    {[5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}s</option>)}
                  </select>
                </label>
              )}
            </div>

            <div className="settings-grid checks">
              <Check label="Deduct on wrong" checked={settings.deductOnWrongAnswer} onChange={(v) => patch({ deductOnWrongAnswer: v })} />
              <Check label="Allow negative scores" checked={settings.allowNegativeScores} onChange={(v) => patch({ allowNegativeScores: v })} />
              <Check label="Typo tolerance" checked={settings.typoTolerance} onChange={(v) => patch({ typoTolerance: v })} />
              {settings.mode === 'jeopardy' && (
                <Check label="Buzz rebound" checked={settings.allowBuzzRebound} onChange={(v) => patch({ allowBuzzRebound: v })} />
              )}
              <Check label="Progressive reveal" checked={settings.progressiveReveal} onChange={(v) => patch({ progressiveReveal: v })} />
              <Check label="Enable final round" checked={settings.enableFinalRound} onChange={(v) => patch({ enableFinalRound: v })} />
            </div>

            {createError && <p className="error">{createError}</p>}

            <button
              className="btn-lg"
              onClick={handleCreate}
              disabled={!createName.trim() || createLoading}
            >
              {createLoading ? 'Creating…' : 'Create Room'}
            </button>
          </section>

          {/* ── Join Room ─────────────────────────────────────────────────────── */}
          <section className="panel elevated-panel stack">
            <div>
              <div className="eyebrow">Have a code?</div>
              <h2>Join a room</h2>
            </div>

            <label className="stack" style={{ gap: '0.4rem' }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Your name</span>
              <input
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Display name"
                maxLength={30}
              />
            </label>

            <label className="stack" style={{ gap: '0.4rem' }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Room code</span>
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="XXXXXX"
                maxLength={6}
                style={{ letterSpacing: '0.22em', fontWeight: 900, fontSize: '1.3rem' }}
              />
            </label>

            {joinError && <p className="error">{joinError}</p>}

            <button
              className="secondary btn-lg"
              onClick={handleJoin}
              disabled={!joinName.trim() || roomCode.length < 6 || joinLoading}
            >
              {joinLoading ? 'Joining…' : 'Join Room'}
            </button>
          </section>

        </div>
      </div>
    </main>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check-label soft-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
