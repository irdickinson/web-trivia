import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import { leaveRoom } from '../lib/rooms'
import { startGame } from '../lib/game'
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { Button } from '../components/ui/Button'
import { RoomCode } from '../components/room/RoomCode'
import { PlayerList } from '../components/room/PlayerList'
import { ClassicGame } from '../components/game/ClassicGame'
import { GameFinished } from '../components/game/GameFinished'
import { Question } from '../types/question'

const MODE_LABELS: Record<string, string> = {
  classic: 'Classic',
  speed: 'Speed',
  'multiple-choice': 'Multiple Choice',
  'fastest-finger': 'Fastest Finger',
}

export default function Room() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { room, loading, notFound } = useRoom(code)

  const questions = useMemo((): Question[] => {
    if (!room) return []
    if (room.settings.questionSetId === 'built-in') {
      return DEFAULT_QUESTIONS.slice(0, room.settings.totalQuestions)
    }
    return []
  }, [room?.settings.questionSetId, room?.settings.totalQuestions])

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

  // — Game in progress —
  if (room.status === 'playing') {
    if (room.settings.mode === 'classic' || room.settings.mode === 'speed') {
      return <ClassicGame room={room} user={user} questions={questions} />
    }
    // Other modes arrive in later stages
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">
          {MODE_LABELS[room.settings.mode]} mode — coming soon
        </p>
      </div>
    )
  }

  // — Finished —
  if (room.status === 'finished') {
    return (
      <GameFinished
        players={room.players}
        currentUid={user.uid}
        onPlayAgain={() => navigate('/lobby')}
      />
    )
  }

  // — Lobby —
  async function handleStart() {
    if (!isHost || !room) return
    await startGame(room, questions)
  }

  async function handleLeave() {
    if (!code) return
    try {
      await leaveRoom(code, user!.uid)
    } finally {
      navigate('/lobby')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
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

        <div className="flex gap-3 text-sm text-gray-500">
          <span>{MODE_LABELS[room.settings.mode] ?? room.settings.mode}</span>
          <span>·</span>
          <span>{room.settings.totalQuestions} questions</span>
          <span>·</span>
          <span>{room.settings.secondsPerQuestion}s each</span>
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
    </div>
  )
}
