import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import { leaveRoom } from '../lib/rooms'
import { startGame } from '../lib/game'
import { DEFAULT_PACK } from '../data/defaultPack'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { Button } from '../components/ui/Button'
import { RoomCode } from '../components/room/RoomCode'
import { PlayerList } from '../components/room/PlayerList'
import { JeopardyGame } from '../components/game/JeopardyGame'
import { GameFinished } from '../components/game/GameFinished'
import { PageMeta } from '../components/seo/PageMeta'

export default function Room() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { room, loading, notFound } = useRoom(code)

  if (loading) return <LoadingScreen />

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-300">Room not found.</p>
        <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
      </div>
    )
  }

  if (!room || !user) return null

  const isHost = user.uid === room.hostId
  const players = Object.values(room.players)

  // Resolve the question pack (custom packs will slot in here later)
  const pack = DEFAULT_PACK

  // ── Active game ────────────────────────────────────────────────────────────
  if (room.phase === 'board' || room.phase === 'clue' ||
      room.phase === 'final-wager' || room.phase === 'final-answer' ||
      room.phase === 'final-results') {
    return <JeopardyGame room={room} user={user} pack={pack} />
  }

  // ── Finished ───────────────────────────────────────────────────────────────
  if (room.phase === 'finished') {
    return (
      <GameFinished
        players={room.players}
        currentUid={user.uid}
        onPlayAgain={() => navigate('/lobby')}
      />
    )
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────
  async function handleStart() {
    if (!isHost || !room) return
    await startGame(room, pack)
  }

  async function handleLeave() {
    if (!code) return
    try {
      await leaveRoom(code, user!.uid)
    } finally {
      navigate('/lobby')
    }
  }

  const MODE_LABELS: Record<string, string> = {
    jeopardy: 'Jeopardy',
    classic: 'Classic',
    'multiple-choice': 'Multiple Choice',
    speed: 'Speed',
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <PageMeta title="Game Room" description="Waiting for the host to start the game." />
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Room code</p>
            <RoomCode code={room.code} />
          </div>
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            Leave
          </Button>
        </div>

        <PlayerList players={players} hostId={room.hostId} />

        <div className="flex gap-3 text-sm text-gray-500 flex-wrap">
          <span>{MODE_LABELS[room.settings.mode] ?? room.settings.mode}</span>
          <span>·</span>
          <span>{room.settings.categoryCount} categories</span>
          <span>·</span>
          <span>{room.settings.questionCountPerCategory} questions each</span>
          <span>·</span>
          <span>up to ${(room.settings.pointValues[room.settings.pointValues.length - 1] ?? 0).toLocaleString()}</span>
        </div>

        {isHost ? (
          <Button
            size="lg"
            onClick={handleStart}
            disabled={players.length < 1}
            className="w-full"
          >
            Start Game
          </Button>
        ) : (
          <p className="text-center text-sm text-gray-500">
            Waiting for the host to start…
          </p>
        )}

      </div>
    </main>
  )
}
