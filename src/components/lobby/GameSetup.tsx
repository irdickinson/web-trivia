import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createRoom, joinRoom, DEFAULT_SETTINGS } from '../../lib/rooms'
import { GameMode, GameSettings } from '../../types/game'
import { packSummaries } from '../../data/packs'
import { randomSeed } from '../../lib/rng'

const PACKS = packSummaries()

const MODE_ANSWER_DEFAULTS: Record<GameMode, number> = {
  'jeopardy': 15,
  'classic': 15,
  'multiple-choice': 10,
  'speed': 10,
  'rounds': 15,
}

const ANSWER_TIME_OPTIONS = [3, 5, 8, 10, 15, 20, 30, 45, 60]

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  'jeopardy': 'Buzz in before anyone else, then answer solo',
  'classic': 'Everyone types simultaneously — all correct answers score',
  'multiple-choice': 'Choose from four options, everyone answers at once',
  'speed': 'First correct answer wins the clue',
  'rounds': 'Fast rounds — everyone answers, results reveal after each round, harder rounds score more',
}

// The create-room / join-room form. Shared by the Home hub and the /lobby route.
export function GameSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const defaultName = user?.displayName ?? ''

  const [createName, setCreateName] = useState(defaultName)
  const [settings, setSettings] = useState<GameSettings>(() => ({ ...DEFAULT_SETTINGS, seed: randomSeed() }))
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  const [joinName, setJoinName] = useState(defaultName)
  const [roomCode, setRoomCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  const isRounds = settings.mode === 'rounds'

  function patch(delta: Partial<GameSettings>) {
    setSettings((s) => ({ ...s, ...delta }))
  }

  function handleModeChange(mode: GameMode) {
    patch({ mode, answerTimeSeconds: MODE_ANSWER_DEFAULTS[mode] })
  }

  function togglePack(id: string) {
    setSettings((s) => {
      const has = s.questionSetIds.includes(id)
      // Keep at least one pack selected.
      if (has && s.questionSetIds.length === 1) return s
      const questionSetIds = has
        ? s.questionSetIds.filter((p) => p !== id)
        : [...s.questionSetIds, id]
      return { ...s, questionSetIds }
    })
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
            <option value="rounds">Rounds</option>
          </select>
          <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            {MODE_DESCRIPTIONS[settings.mode]}
          </p>
        </div>

        {/* Question packs */}
        <div className="stack" style={{ gap: '0.4rem' }}>
          <span className="eyebrow" style={{ marginBottom: 0 }}>Question packs</span>
          <div className="pack-grid">
            {PACKS.map((p) => {
              const selected = settings.questionSetIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`pack-card${selected ? ' selected' : ''}`}
                  onClick={() => togglePack(p.id)}
                  aria-pressed={selected}
                >
                  <span className="pack-check" aria-hidden>{selected ? '✓' : ''}</span>
                  <span className="pack-body">
                    <span className="pack-name">{p.name}</span>
                    {p.description && <span className="pack-desc">{p.description}</span>}
                    <span className="pack-meta">{p.categoryCount} categories · {p.questionCount} questions</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="muted" style={{ fontSize: '0.78rem', margin: 0 }}>
            Categories from every selected pack are pooled together when building the game.
          </p>
        </div>

        {isRounds ? (
          /* ── Rounds-mode settings ─────────────────────────────────────── */
          <>
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
                <span className="eyebrow" style={{ marginBottom: 0 }}>Rounds</span>
                <select
                  value={settings.roundsCount}
                  onChange={(e) => patch({ roundsCount: parseInt(e.target.value) })}
                >
                  {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Questions / round</span>
                <select
                  value={settings.questionsPerRound}
                  onChange={(e) => patch({ questionsPerRound: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Time / question (s)</span>
                <select
                  value={settings.answerTimeSeconds}
                  onChange={(e) => patch({ answerTimeSeconds: parseInt(e.target.value) })}
                >
                  {ANSWER_TIME_OPTIONS.map((n) => <option key={n} value={n}>{n}s</option>)}
                </select>
              </label>
            </div>

            <label className="stack" style={{ gap: '0.4rem' }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>
                Multiple choice ratio — {Math.round(settings.mcRatio * 100)}%
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.mcRatio}
                onChange={(e) => patch({ mcRatio: parseFloat(e.target.value) })}
              />
              <p className="muted" style={{ fontSize: '0.78rem', margin: 0 }}>
                Share of questions shown as multiple choice; the rest are typed. Round N pulls
                difficulty-N questions, so later rounds are harder and worth more.
              </p>
            </label>

            <div className="settings-grid checks">
              <Check label="Typo tolerance" checked={settings.typoTolerance} onChange={(v) => patch({ typoTolerance: v })} />
            </div>
          </>
        ) : (
          /* ── Board-mode settings ──────────────────────────────────────── */
          <>
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
          </>
        )}

        {/* Board seed — same seed reproduces the same game */}
        <label className="stack" style={{ gap: '0.4rem' }}>
          <span className="eyebrow" style={{ marginBottom: 0 }}>Game seed</span>
          <div className="row gap">
            <input
              value={settings.seed}
              onChange={(e) => patch({ seed: e.target.value.toUpperCase().slice(0, 16) })}
              placeholder="Random seed"
              style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.12em', fontWeight: 700 }}
            />
            <button
              type="button"
              className="secondary mini-btn"
              onClick={() => patch({ seed: randomSeed() })}
              title="Randomize seed"
            >
              🎲
            </button>
          </div>
          <p className="muted" style={{ fontSize: '0.78rem', margin: 0 }}>
            Same seed + packs always builds the same game. Change it for a fresh one.
          </p>
        </label>

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
