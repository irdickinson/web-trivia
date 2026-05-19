import { useParams, useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import { leaveRoom } from '../lib/rooms'
import { db } from '../lib/firebase'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { Button } from '../components/ui/Button'
import { RoomCode } from '../components/room/RoomCode'
import { PlayerList } from '../components/room/PlayerList'

const MODE_LABELS: Record<string, string> = {
  'classic': 'Classic',
  'speed': 'Speed',
  'multiple-choice': 'Multiple Choice',
  'fastest-finger': 'Fastest Finger',
}

export default function Room() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { room, loading, notFound } = useRoom(code)

  const isHost = user?.uid === room?.hostId
  const players = Object.values(room?.players ?? {})

  async function handleStart() {
    if (!code || !isHost) return
    await updateDoc(doc(db, 'rooms', code), { status: 'playing' })
  }

  async function handleLeave() {
    if (!user || !code) return
    try {
      await leaveRoom(code, user.uid)
    } finally {
      navigate('/lobby')
    }
  }

  if (loading) return <LoadingScreen />

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-300">Room not found.</p>
        <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
      </div>
    )
  }

  if (!room) return null

  if (room.status === 'playing') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Game in progress — game logic coming soon</p>
        <Button variant="ghost" onClick={() => navigate('/lobby')}>Leave</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Room code</p>
            <RoomCode code={room.code} />
          </div>
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            Leave
          </Button>
        </div>

        {/* Player list */}
        <PlayerList players={players} hostId={room.hostId} />

        {/* Settings summary */}
        <div className="flex gap-3 text-sm text-gray-500">
          <span>{MODE_LABELS[room.settings.mode] ?? room.settings.mode}</span>
          <span>·</span>
          <span>{room.settings.totalQuestions} questions</span>
          <span>·</span>
          <span>{room.settings.secondsPerQuestion}s each</span>
        </div>

        {/* Host controls / waiting message */}
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
    </div>
  )
}
