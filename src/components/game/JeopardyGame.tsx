import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { QuestionPack } from '../../types/question'
import { BoardView } from './BoardView'
import { ClueView } from './ClueView'
import { OutcomeCard } from './OutcomeCard'
import { FinalRound } from './FinalRound'
import { useAudio } from '../../hooks/useAudio'
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
}

type FlashKind = 'correct' | 'incorrect' | 'timeout'

// ── Shared game header ───────────────────────────────────────────────────────

interface HeaderProps {
  room: Room
  user: User
  audio: ReturnType<typeof useAudio>
  isHost: boolean
  onBackToLobby: () => void
}

function GameHeader({ room, user, audio, isHost, onBackToLobby }: HeaderProps) {
  const me = room.players[user.uid]
  const chooser = room.players[room.currentChooserId ?? '']
  const cs = room.clueState
  const activeAnswerer = cs?.activeAnswerPlayerId ? room.players[cs.activeAnswerPlayerId] : null

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
      {/* Status chips */}
      <div className="flex items-center gap-2 overflow-x-auto min-w-0">
        {me && (
          <div className="flex flex-col items-center shrink-0 px-2.5 py-1 rounded-lg bg-blue-900 border border-blue-700">
            <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">You</span>
            <span className="text-xs font-bold text-white leading-tight">{me.name}</span>
            <span className={`text-[11px] font-mono font-bold leading-tight ${me.score < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              ${me.score.toLocaleString()}
            </span>
          </div>
        )}
        {chooser && chooser.uid !== user.uid && (
          <div className="flex flex-col items-center shrink-0 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Chooser</span>
            <span className="text-xs font-bold text-white leading-tight">{chooser.name}</span>
          </div>
        )}
        {activeAnswerer && (
          <div className="flex flex-col items-center shrink-0 px-2.5 py-1 rounded-lg bg-yellow-900/40 border border-yellow-700/60">
            <span className="text-[9px] text-yellow-400 uppercase tracking-widest font-bold">Answering</span>
            <span className="text-xs font-bold text-white leading-tight">{activeAnswerer.name}</span>
          </div>
        )}
      </div>

      {/* Audio controls + back to lobby */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-gray-600 hidden sm:block max-w-[6rem] truncate">{audio.trackName}</span>
        <button
          onClick={audio.prevTrack}
          className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 text-xs"
          title="Previous track"
        >
          ◀◀
        </button>
        <button
          onClick={audio.toggleMusic}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 text-sm"
          title={audio.musicPaused ? 'Play music' : 'Pause music'}
        >
          {audio.musicPaused ? '▶' : '⏸'}
        </button>
        <button
          onClick={audio.nextTrack}
          className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 text-xs"
          title="Next track"
        >
          ▶▶
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={audio.musicVol}
          onChange={(e) => audio.setMusicVol(parseFloat(e.target.value))}
          className="w-14 accent-blue-500 hidden sm:block"
          title="Music volume"
        />
        <button
          onClick={audio.toggleSfx}
          className={`p-1.5 rounded text-xs font-bold ${audio.sfxEnabled ? 'text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-800'}`}
          title={audio.sfxEnabled ? 'Mute SFX' : 'Unmute SFX'}
        >
          {audio.sfxEnabled ? '🔊' : '🔇'}
        </button>
        {isHost && (
          <button
            onClick={onBackToLobby}
            className="ml-2 px-2.5 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            ← Lobby
          </button>
        )}
      </div>
    </header>
  )
}

// ── End confirm modal ─────────────────────────────────────────────────────────

function EndConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white text-center">Return to lobby?</h2>
        <p className="text-gray-400 text-sm text-center">The current game will end for all players.</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main game orchestrator ────────────────────────────────────────────────────

export function JeopardyGame({ room, user, pack }: Props) {
  const isHost = user.uid === room.hostId
  const { phase } = room
  const audio = useAudio()

  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [resultFlash, setResultFlash] = useState<FlashKind | null>(null)

  // Track which clue outcomes we've already processed for SFX/flash/auto-transition
  const processedOutcomeRef = useRef<string | null>(null)
  const flashTimerRef = useRef<number | null>(null)
  const transitionTimerRef = useRef<number | null>(null)

  // Detect when a clue resolves → play SFX, flash, schedule auto-transition
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
    flashTimerRef.current = window.setTimeout(() => setResultFlash(null), 800)

    // Host drives auto-transition (2200ms correct, 1800ms wrong/timeout)
    if (isHost) {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
      const delay = kind === 'correct' ? 2200 : 1800
      transitionTimerRef.current = window.setTimeout(() => {
        void handleContinue()
      }, delay)
    }

    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.clueState?.status, room.clueState?.questionId, isHost])

  // Play tick SFX when answer timer hits ≤5 seconds
  const prevAnswerSecsRef = useRef<number | null>(null)
  useEffect(() => {
    const cs = room.clueState
    if (!cs?.answerDeadline) { prevAnswerSecsRef.current = null; return }
    const secsLeft = Math.ceil((cs.answerDeadline - Date.now()) / 1000)
    if (secsLeft <= 5 && secsLeft > 0) {
      if (prevAnswerSecsRef.current !== secsLeft) {
        audio.playSfx('tick')
        prevAnswerSecsRef.current = secsLeft
      }
    }
  })

  // ── Board actions ───────────────────────────────────────────────────────────

  async function handleSelectClue(row: number, col: number) {
    if (!isHost && user.uid !== room.currentChooserId) return
    await selectClue(room, row, col)
  }

  // ── Clue actions ────────────────────────────────────────────────────────────

  async function handleBuzz() {
    audio.playSfx('buzz')
    await buzz(room.code, user.uid, room.settings.answerTimeSeconds)
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

  return (
    <div className="min-h-screen bg-[#0a0a1e] text-white flex flex-col">
      {/* Full-screen result flash */}
      {resultFlash && (
        <div
          className={`fixed inset-0 z-40 flash-overlay ${
            resultFlash === 'correct'
              ? 'bg-green-500/50'
              : resultFlash === 'incorrect'
                ? 'bg-red-500/50'
                : 'bg-orange-400/40'
          }`}
        />
      )}

      <GameHeader
        room={room}
        user={user}
        audio={audio}
        isHost={isHost}
        onBackToLobby={() => setShowEndConfirm(true)}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {(phase === 'board' || phase === 'clue') && (
          <>
            {phase === 'board' && (
              <BoardView room={room} user={user} onSelectClue={handleSelectClue} />
            )}
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
              />
            )}
          </>
        )}

        {(phase === 'final-wager' || phase === 'final-answer' || phase === 'final-results') && (
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

      {showEndConfirm && (
        <EndConfirmModal
          onConfirm={handleConfirmReturn}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </div>
  )
}
