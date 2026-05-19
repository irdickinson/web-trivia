import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { QuestionPack } from '../../types/question'
import { BoardView } from './BoardView'
import { ClueView } from './ClueView'
import { OutcomeOverlay } from './OutcomeOverlay'
import { FinalRound } from './FinalRound'
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
} from '../../lib/game'

interface Props {
  room: Room
  user: User
  pack: QuestionPack
}

export function JeopardyGame({ room, user, pack }: Props) {
  const isHost = user.uid === room.hostId
  const { phase } = room

  // ── Board phase ─────────────────────────────────────────────────────────────

  async function handleSelectClue(row: number, col: number) {
    if (!isHost && user.uid !== room.currentChooserId) return
    await selectClue(room, row, col)
  }

  // ── Clue phase ──────────────────────────────────────────────────────────────

  async function handleBuzz() {
    await buzz(room.code, user.uid, room.settings.answerTimeSeconds)
  }

  async function handleSubmitAnswer(answer: string) {
    await submitAnswer(room, user.uid, answer)
  }

  async function handleSubmitChoice(idx: number) {
    await submitChoice(room, user.uid, idx)
  }

  // Host drives timeout transitions.
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

  async function handleAdjustScore(targetUid: string, delta: number) {
    if (!isHost) return
    await adjustScore(room, targetUid, delta)
  }

  // ── Final round ──────────────────────────────────────────────────────────────

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

  // ── Rendering ────────────────────────────────────────────────────────────────

  if (phase === 'board') {
    return (
      <BoardView
        room={room}
        user={user}
        onSelectClue={handleSelectClue}
      />
    )
  }

  if (phase === 'clue') {
    const cs = room.clueState
    const showOutcome = cs?.status === 'resolved'

    return (
      <>
        <ClueView
          room={room}
          user={user}
          onBuzz={handleBuzz}
          onSubmitAnswer={handleSubmitAnswer}
          onSubmitChoice={handleSubmitChoice}
          onHostTimeout={handleHostTimeout}
        />
        {showOutcome && (
          <OutcomeOverlay
            room={room}
            user={user}
            onContinue={handleContinue}
            onAdjustScore={handleAdjustScore}
          />
        )}
      </>
    )
  }

  if (phase === 'final-wager' || phase === 'final-answer' || phase === 'final-results') {
    return (
      <FinalRound
        room={room}
        user={user}
        onSubmitWager={handleFinalWager}
        onSubmitAnswers={handleFinalAnswers}
        onRevealResults={handleRevealResults}
        onFinish={handleFinish}
      />
    )
  }

  return null
}
