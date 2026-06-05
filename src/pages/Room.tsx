import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import { leaveRoom } from '../lib/rooms'
import { startGame, startRoundGame } from '../lib/game'
import { recordGameResult } from '../lib/stats'
import { resolvePacks } from '../data/packs'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { JeopardyGame } from '../components/game/JeopardyGame'
import { RoundGame } from '../components/game/RoundGame'
import { GameFinished } from '../components/game/GameFinished'
import { WaitingRoom } from '../components/room/WaitingRoom'
import { MediaProvider } from '../components/game/MediaProvider'
import { BackdropOrb } from '../components/ui/BackdropOrb'
import { PageMeta } from '../components/seo/PageMeta'

export default function Room() {
  const { code } = useParams<{ code: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { room, loading, notFound } = useRoom(code)
  // Set when we intentionally leave so the "kicked out" effect doesn't redirect us.
  const leavingRef = useRef(false)

  // Record the result once per finished game (guarded against snapshot churn
  // and refreshes; the stats write itself is also idempotent per game).
  const recordedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!room || !user) return
    // Jeopardy/classic end on the 'finished' phase; rounds mode ends on the
    // cinematic final standings (phase stays 'round-question').
    const ended = room.phase === 'finished' || room.roundState?.status === 'final'
    if (!ended) return
    const key = `${room.code}-${room.createdAt}`
    if (recordedRef.current === key) return
    recordedRef.current = key
    void recordGameResult(room, user.uid)
  }, [room, user])

  // Kicked / removed: if we're no longer in the room's player list, bounce out.
  // Refreshing keeps the player in the doc, so this only fires on a real removal.
  useEffect(() => {
    if (loading || notFound || !room || !user || leavingRef.current) return
    if (!room.players[user.uid]) navigate('/lobby')
  }, [room, user, loading, notFound, navigate])

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
  const pack = resolvePacks(room.settings.questionSetIds)

  async function handleStart() {
    if (!isHost || !room) return
    if (room.settings.mode === 'rounds') {
      await startRoundGame(room, pack)
    } else {
      await startGame(room, pack)
    }
  }

  async function handleLeave() {
    if (!code) return
    leavingRef.current = true
    try { await leaveRoom(code, user!.uid) } finally { navigate('/lobby') }
  }

  // Used by non-host players to exit a running game back to their home menu.
  async function handleLeaveGame() {
    if (!code) return
    leavingRef.current = true
    try { await leaveRoom(code, user!.uid) } finally { navigate('/') }
  }

  function renderPhase() {
    if (!room || !user) return null
    if (
      room.phase === 'board' || room.phase === 'clue' ||
      room.phase === 'final-wager' || room.phase === 'final-answer' ||
      room.phase === 'final-results'
    ) {
      return <JeopardyGame room={room} user={user} pack={pack} onLeaveGame={handleLeaveGame} />
    }
    if (room.phase === 'round-question') {
      return <RoundGame room={room} user={user} pack={pack} onLeaveGame={handleLeaveGame} />
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
    return (
      <>
        <BackdropOrb />
        <PageMeta title="Game Room" description="Waiting for the host to start the game." />
        <WaitingRoom room={room} user={user} onStart={handleStart} onLeave={handleLeave} />
      </>
    )
  }

  // One MediaProvider wraps every phase so the shared YouTube player is never torn
  // down across waiting room → game → lobby (queue + playback persist).
  return (
    <MediaProvider room={room} user={user}>
      {renderPhase()}
    </MediaProvider>
  )
}
