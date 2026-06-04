import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import { leaveRoom } from '../lib/rooms'
import { startGame } from '../lib/game'
import { recordGameResult } from '../lib/stats'
import { resolvePacks } from '../data/packs'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { JeopardyGame } from '../components/game/JeopardyGame'
import { GameFinished } from '../components/game/GameFinished'
import { ChatPanel } from '../components/game/ChatPanel'
import { BackdropOrb } from '../components/ui/BackdropOrb'
import { PageMeta } from '../components/seo/PageMeta'

export default function Room() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { room, loading, notFound } = useRoom(code)

  // Record the result once per finished game (guarded against snapshot churn
  // and refreshes; the stats write itself is also idempotent per game).
  const recordedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!room || !user || room.phase !== 'finished') return
    const key = `${room.code}-${room.createdAt}`
    if (recordedRef.current === key) return
    recordedRef.current = key
    void recordGameResult(room, user.uid)
  }, [room, user])

  if (loading) return <LoadingScreen />

  if (notFound) {
    return (
      <main className="page center">
        <BackdropOrb />
        <div className="panel elevated-panel stack" style={{ textAlign: 'center', padding: '2rem', width: 'min(360px, 94vw)' }}>
          <p className="muted">Room not found.</p>
          <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
        </div>
      </main>
    )
  }

  if (!room || !user) return null

  const isHost = user.uid === room.hostId
  const players = Object.values(room.players)
  const pack = resolvePacks(room.settings.questionSetIds)

  if (
    room.phase === 'board' || room.phase === 'clue' ||
    room.phase === 'final-wager' || room.phase === 'final-answer' ||
    room.phase === 'final-results'
  ) {
    return <JeopardyGame room={room} user={user} pack={pack} />
  }

  if (room.phase === 'finished') {
    return (
      <GameFinished
        players={room.players}
        currentUid={user.uid}
        onPlayAgain={() => navigate('/lobby')}
      />
    )
  }

  async function handleStart() {
    if (!isHost || !room) return
    await startGame(room, pack)
  }

  async function handleLeave() {
    if (!code) return
    try { await leaveRoom(code, user!.uid) } finally { navigate('/lobby') }
  }

  const MODE_LABELS: Record<string, string> = {
    jeopardy: 'Jeopardy',
    classic: 'Classic',
    'multiple-choice': 'Multiple Choice',
    speed: 'Speed',
  }

  return (
    <main className="page center">
      <BackdropOrb />
      <PageMeta title="Game Room" description="Waiting for the host to start the game." />
      <div className="stack" style={{ width: 'min(560px, 94vw)' }}>
      <div className="panel elevated-panel stack" style={{ padding: '1.5rem' }}>

        <div className="topbar">
          <div>
            <div className="eyebrow">Room code</div>
            <div className="lobby-code-display">{room.code}</div>
          </div>
          <button className="secondary mini-btn" onClick={handleLeave}>Leave</button>
        </div>

        <div className="divider" />

        <div className="stack compact-stack">
          <div className="eyebrow">Players — {players.length}</div>
          {players.map((player) => (
            <div
              key={player.uid}
              className="player-row"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 600 }}>{player.name}</span>
              {player.uid === room.hostId && <span className="tag chooser-tag">Host</span>}
            </div>
          ))}
          {players.length === 0 && (
            <p className="muted" style={{ fontSize: '0.88rem' }}>No players yet…</p>
          )}
        </div>

        <div className="divider" />

        <p className="muted" style={{ fontSize: '0.85rem' }}>
          {MODE_LABELS[room.settings.mode] ?? room.settings.mode}
          {' · '}{room.settings.categoryCount} categories
          {' · '}{room.settings.questionCountPerCategory} questions each
          {' · '}up to ${(room.settings.pointValues[room.settings.pointValues.length - 1] ?? 0).toLocaleString()}
        </p>

        {isHost ? (
          <button
            className="btn-lg"
            style={{ width: '100%' }}
            onClick={handleStart}
            disabled={players.length < 1}
          >
            Start Game
          </button>
        ) : (
          <p className="muted" style={{ textAlign: 'center', fontSize: '0.88rem' }}>
            Waiting for the host to start…
          </p>
        )}
      </div>

      <ChatPanel room={room} user={user} />
      </div>
    </main>
  )
}
