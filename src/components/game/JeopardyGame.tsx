import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { QuestionPack } from '../../types/question'
import { BoardView } from './BoardView'
import { ClueView } from './ClueView'
import { OutcomeCard } from './OutcomeCard'
import { FinalRound } from './FinalRound'
import { GameHeader, EndConfirmModal } from './GameHeader'
import { GameRail } from './GameRail'
import { useAudio } from '../../hooks/useAudio'
import { BackdropOrb } from '../ui/BackdropOrb'
import {
  selectClue,
  buzz,
  submitAnswer,
  submitChoice,
  handleClueTimeout,
  resolveClassicClue,
  returnToBoard,
  adjustScore,
  initFinalRound,
  submitFinalWager,
  submitFinalAnswers,
  revealFinalResults,
  finishGame,
  returnToLobby,
} from '../../lib/game'

interface Props {
  room: Room
  user: User
  pack: QuestionPack
  onLeaveGame: () => void
}

type FlashKind = 'correct' | 'incorrect' | 'timeout'

// ── Main game orchestrator ────────────────────────────────────────────────────

export function JeopardyGame({ room, user, pack, onLeaveGame }: Props) {
  const isHost = user.uid === room.hostId
  const { phase } = room
  const audio = useAudio()

  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [resultFlash, setResultFlash] = useState<FlashKind | null>(null)

  const processedOutcomeRef = useRef<string | null>(null)
  const flashTimerRef = useRef<number | null>(null)
  const transitionTimerRef = useRef<number | null>(null)
  const buzzingRef = useRef(false)

  // Detect clue resolution → SFX + flash class + host auto-transition
  useEffect(() => {
    const cs = room.clueState
    if (!cs || cs.status !== 'resolved' || !cs.outcome) return

    const key = `${cs.questionId}-${cs.status}`
    if (processedOutcomeRef.current === key) return
    processedOutcomeRef.current = key

    const kind: FlashKind = cs.outcome.wasCorrect
      ? 'correct'
      : cs.outcome.winnerId
        ? 'incorrect'
        : 'timeout'

    audio.playSfx(kind === 'correct' ? 'correct' : kind === 'incorrect' ? 'incorrect' : 'timeout')

    setResultFlash(kind)
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    flashTimerRef.current = window.setTimeout(() => setResultFlash(null), 900)

    if (isHost) {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
      const delay = kind === 'correct' ? 5000 : 4000
      transitionTimerRef.current = window.setTimeout(() => { void handleContinue() }, delay)
    }

    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.clueState?.status, room.clueState?.questionId, isHost])

  // Tick SFX when answer timer ≤ 5s
  const prevAnswerSecsRef = useRef<number | null>(null)
  useEffect(() => {
    const cs = room.clueState
    if (!cs?.answerDeadline) { prevAnswerSecsRef.current = null; return }
    const secsLeft = Math.ceil((cs.answerDeadline - Date.now()) / 1000)
    if (secsLeft <= 5 && secsLeft > 0 && prevAnswerSecsRef.current !== secsLeft) {
      audio.playSfx('tick')
      prevAnswerSecsRef.current = secsLeft
    }
  })

  // ── Board actions ───────────────────────────────────────────────────────────

  async function handleSelectClue(row: number, col: number) {
    if (!isHost && user.uid !== room.currentChooserId) return
    await selectClue(room, row, col)
  }

  // ── Clue actions ────────────────────────────────────────────────────────────

  async function handleBuzz() {
    if (buzzingRef.current) return
    buzzingRef.current = true
    audio.playSfx('buzz')
    try {
      await buzz(room.code, user.uid, room.settings.answerTimeSeconds)
    } finally {
      buzzingRef.current = false
    }
  }

  async function handleSubmitAnswer(answer: string) {
    await submitAnswer(room, user.uid, answer)
  }

  async function handleSubmitChoice(idx: number) {
    await submitChoice(room, user.uid, idx)
  }

  async function handleHostTimeout() {
    if (!isHost) return
    const cs = room.clueState
    if (!cs) return
    if (cs.status === 'answering') {
      await resolveClassicClue(room)
    } else {
      await handleClueTimeout(room)
    }
  }

  async function handleContinue() {
    if (!isHost) return
    const allRevealed = Object.values(room.board).every((q) => q.revealed)
    if (allRevealed && room.settings.enableFinalRound) {
      await initFinalRound(room, pack)
    } else {
      await returnToBoard(room)
    }
  }

  function handleContinueManual() {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
    transitionTimerRef.current = null
    void handleContinue()
  }

  async function handleAdjustScore(targetUid: string, delta: number) {
    if (!isHost) return
    audio.playSfx('adjust')
    await adjustScore(room, targetUid, delta)
  }

  // ── Final round actions ─────────────────────────────────────────────────────

  async function handleFinalWager(wager: number) {
    await submitFinalWager(room, user.uid, wager)
  }

  async function handleFinalAnswers(answers: Record<string, string>) {
    await submitFinalAnswers(room, user.uid, answers)
  }

  async function handleRevealResults() {
    if (!isHost) return
    await revealFinalResults(room)
  }

  async function handleFinish() {
    if (!isHost) return
    await finishGame(room.code)
  }

  async function handleConfirmReturn() {
    setShowEndConfirm(false)
    await returnToLobby(room.code)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const showOutcomeCard = phase === 'clue' && room.clueState?.status === 'resolved'
  const showBoard = phase === 'board' || phase === 'clue'
  const showFinal = phase === 'final-wager' || phase === 'final-answer' || phase === 'final-results'

  return (
    <div className={`page game-page${resultFlash ? ` flash-${resultFlash}` : ''}`}>
      <BackdropOrb />
      <GameHeader
        room={room}
        user={user}
        isHost={isHost}
        onBackToLobby={() => setShowEndConfirm(true)}
        onLeaveGame={onLeaveGame}
      />

      <main className="show-layout" style={{ flex: 1, minHeight: 0 }}>
        <div className="main-stage">
          {showBoard && (
            <BoardView room={room} user={user} onSelectClue={handleSelectClue} />
          )}
          {showFinal && (
            <FinalRound
              room={room}
              user={user}
              onSubmitWager={handleFinalWager}
              onSubmitAnswers={handleFinalAnswers}
              onRevealResults={handleRevealResults}
              onFinish={handleFinish}
            />
          )}
        </div>

        <GameRail room={room} user={user} />
      </main>

      {/* Fixed overlays */}
      {phase === 'clue' && (
        <ClueView
          room={room}
          user={user}
          onBuzz={handleBuzz}
          onSubmitAnswer={handleSubmitAnswer}
          onSubmitChoice={handleSubmitChoice}
          onHostTimeout={handleHostTimeout}
        />
      )}
      {showOutcomeCard && (
        <OutcomeCard
          room={room}
          user={user}
          isHost={isHost}
          onAdjustScore={handleAdjustScore}
          onContinue={handleContinueManual}
        />
      )}
      {showEndConfirm && (
        <EndConfirmModal
          onConfirm={handleConfirmReturn}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </div>
  )
}
