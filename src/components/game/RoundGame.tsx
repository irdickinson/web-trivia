import { useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { QuestionPack } from '../../types/question'
import { GameHeader, EndConfirmModal } from './GameHeader'
import { GameRail } from './GameRail'
import { RoundQuestionView } from './RoundQuestionView'
import { RoundReveal } from './RoundReveal'
import { useAudio } from '../../hooks/useAudio'
import { BackdropOrb } from '../ui/BackdropOrb'
import {
  submitRoundAnswer,
  advanceRoundQuestion,
  advanceReveal,
  nextRound,
  returnToLobby,
} from '../../lib/game'

interface Props {
  room: Room
  user: User
  pack: QuestionPack
  onLeaveGame: () => void
}

// Orchestrator for the faster round-based mode. Mirrors JeopardyGame's shell
// (shared header + info rail) but swaps the board/clue stage for the round flow:
// simultaneous answering → per-question results reveal → next round.
export function RoundGame({ room, user, pack, onLeaveGame }: Props) {
  const isHost = user.uid === room.hostId
  const audio = useAudio()
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  async function handleSubmit(answer: string) {
    await submitRoundAnswer(room, user.uid, answer)
  }

  async function handleAdvanceQuestion() {
    if (!isHost) return
    await advanceRoundQuestion(room)
  }

  async function handleAdvanceReveal() {
    if (!isHost) return
    await advanceReveal(room)
  }

  async function handleNextRound() {
    if (!isHost) return
    await nextRound(room, pack)
  }

  async function handleConfirmReturn() {
    setShowEndConfirm(false)
    await returnToLobby(room.code)
  }

  return (
    <div className="page game-page">
      <BackdropOrb />
      <GameHeader
        room={room}
        user={user}
        audio={audio}
        isHost={isHost}
        onBackToLobby={() => setShowEndConfirm(true)}
        onLeaveGame={onLeaveGame}
      />

      <main className="show-layout" style={{ flex: 1, minHeight: 0 }}>
        <div className="main-stage">
          {room.phase === 'round-question' && (
            <RoundQuestionView
              room={room}
              user={user}
              onSubmit={handleSubmit}
              onAdvance={handleAdvanceQuestion}
            />
          )}
          {room.phase === 'round-reveal' && (
            <RoundReveal
              room={room}
              user={user}
              isHost={isHost}
              audio={audio}
              onAdvanceReveal={handleAdvanceReveal}
              onNextRound={handleNextRound}
            />
          )}
        </div>

        <GameRail room={room} user={user} audio={audio} />
      </main>

      {showEndConfirm && (
        <EndConfirmModal
          onConfirm={handleConfirmReturn}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </div>
  )
}
