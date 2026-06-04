import { useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { QuestionPack } from '../../types/question'
import { GameHeader, EndConfirmModal } from './GameHeader'
import { GameRail } from './GameRail'
import { RoundIntro } from './RoundIntro'
import { RoundQuestionView } from './RoundQuestionView'
import { RoundQuestionResult } from './RoundQuestionResult'
import { RoundSummary } from './RoundSummary'
import { FinalRoundCinematic } from './FinalRoundCinematic'
import { useAudio } from '../../hooks/useAudio'
import { BackdropOrb } from '../ui/BackdropOrb'
import {
  toggleReady,
  startRoundQuestions,
  submitRoundAnswer,
  resolveRoundQuestion,
  advanceAfterResult,
  nextRound,
  showFinalResults,
  startRoundGame,
  returnToLobby,
} from '../../lib/game'

interface Props {
  room: Room
  user: User
  pack: QuestionPack
  onLeaveGame: () => void
}

// Orchestrator for the faster round-based mode. Mirrors JeopardyGame's shell
// (shared header + info rail) but swaps the board/clue stage for the round flow.
// The sub-screen is driven by roundState.status:
//   intro → answering → question-result → … → summary → (next round | final)
export function RoundGame({ room, user, pack, onLeaveGame }: Props) {
  const isHost = user.uid === room.hostId
  const audio = useAudio()
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const rs = room.roundState

  async function handleConfirmReturn() {
    setShowEndConfirm(false)
    await returnToLobby(room.code)
  }

  function renderStage() {
    if (!rs) return null
    switch (rs.status) {
      case 'intro':
        return (
          <RoundIntro
            room={room}
            user={user}
            isHost={isHost}
            onToggleReady={() => void toggleReady(room, user.uid)}
            onStart={() => { if (isHost) void startRoundQuestions(room) }}
          />
        )
      case 'answering':
        return (
          <RoundQuestionView
            room={room}
            user={user}
            onSubmit={(answer) => void submitRoundAnswer(room, user.uid, answer)}
            onResolve={() => { if (isHost) void resolveRoundQuestion(room) }}
          />
        )
      case 'question-result':
        return (
          <RoundQuestionResult
            room={room}
            user={user}
            isHost={isHost}
            audio={audio}
            onAdvance={() => { if (isHost) void advanceAfterResult(room) }}
          />
        )
      case 'summary':
        return (
          <RoundSummary
            room={room}
            user={user}
            isHost={isHost}
            onToggleReady={() => void toggleReady(room, user.uid)}
            onNextRound={() => { if (isHost) void nextRound(room, pack) }}
            onShowFinal={() => { if (isHost) void showFinalResults(room) }}
          />
        )
      case 'final':
        return (
          <FinalRoundCinematic
            room={room}
            user={user}
            isHost={isHost}
            audio={audio}
            onBackToLobby={() => { if (isHost) void returnToLobby(room.code) }}
            onNewGame={() => { if (isHost) void startRoundGame(room, pack) }}
          />
        )
      default:
        return null
    }
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
        <div className="main-stage">{renderStage()}</div>
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
