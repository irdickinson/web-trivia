import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createRoom, joinRoom, DEFAULT_SETTINGS } from '../../lib/rooms'
import { GameSettings } from '../../types/game'
import { randomSeed } from '../../lib/rng'
import { SettingsForm } from './SettingsForm'

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

        <SettingsForm settings={settings} onChange={patch} />

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
