import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { QuestionPack } from '../../types/question'
import { BoardView } from './BoardView'
import { ClueView } from './ClueView'
import { OutcomeCard } from './OutcomeCard'
import { FinalRound } from './FinalRound'
import { MediaPlayer } from './MediaPlayer'
import { ScoreChart } from './ScoreChart'
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
}

type FlashKind = 'correct' | 'incorrect' | 'timeout'

// ── Game header ───────────────────────────────────────────────────────────────

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
    <header className="topbar panel elevated-panel">
      {/* Status chips */}
      <div className="row gap wrap">
        {me && (
          <div className="hero-chip primary-chip">
            <span className="chip-label">You</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{me.name}</span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1,
              color: me.score < 0 ? 'var(--danger)' : 'var(--gold)',
              marginTop: '0.1rem',
            }}>
              ${me.score.toLocaleString()}
            </span>
          </div>
        )}
        {chooser && chooser.uid !== user.uid && (
          <div className="hero-chip">
            <span className="chip-label">Chooser</span>
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{chooser.name}</span>
          </div>
        )}
        {activeAnswerer && (
          <div className="hero-chip answering-chip">
            <span className="chip-label">Answering</span>
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{activeAnswerer.name}</span>
          </div>
        )}
      </div>

      {/* Audio controls + lobby */}
      <div className="topbar-actions">
        <div className="panellet music-control">
          <div className="music-row">
            <button className="secondary mini-btn" onClick={audio.prevTrack} title="Previous track">◀</button>
            <button className="secondary mini-btn" onClick={audio.toggleMusic} title={audio.musicPaused ? 'Play' : 'Pause'}>
              {audio.musicPaused ? '▶' : '⏸'}
            </button>
            <button className="secondary mini-btn" onClick={audio.nextTrack} title="Next track">▶</button>
            <button
              className="secondary mini-btn"
              onClick={audio.toggleSfx}
              title={audio.sfxEnabled ? 'Mute SFX' : 'Unmute SFX'}
              style={{ opacity: audio.sfxEnabled ? 1 : 0.4 }}
            >
              {audio.sfxEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          <div className="row gap" style={{ alignItems: 'center' }}>
            <span className="mini-track-name" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {audio.trackName}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.musicVol}
              onChange={(e) => audio.setMusicVol(parseFloat(e.target.value))}
              style={{ flex: '0 0 64px' }}
              title="Music volume"
            />
          </div>
        </div>
        {isHost && (
          <button className="danger mini-btn" onClick={onBackToLobby}>
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
    <div className="review-modal">
      <div className="panel elevated-panel stack review-card" style={{ textAlign: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 900 }}>Return to lobby?</h2>
          <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
            The current game will end for all players.
          </p>
        </div>
        <div className="row gap">
          <button className="danger btn-lg" style={{ flex: 1 }} onClick={onConfirm}>Confirm</button>
          <button className="secondary btn-lg" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Activity log (info rail) ──────────────────────────────────────────────────

function ActivityLog({ room }: { room: Room }) {
  return (
    <div className="panel elevated-panel stack">
      <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Activity</div>
      <div className="log-panel stack compact-stack">
        {[...room.messages].reverse().slice(0, 12).map((msg) => (
          <div
            key={msg.id}
            className={`msg${msg.type === 'override' ? ' override' : msg.type === 'warning' ? ' warning' : ''}`}
          >
            {msg.text}
          </div>
        ))}
        {room.messages.length === 0 && (
          <p className="muted" style={{ fontSize: '0.82rem' }}>No activity yet.</p>
        )}
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
        audio={audio}
        isHost={isHost}
        onBackToLobby={() => setShowEndConfirm(true)}
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

        <aside className="info-rail">
          <ScoreChart room={room} user={user} />
          <MediaPlayer room={room} user={user} audio={audio} />
          <ScoreChart
            players={room.players}
            currentUid={user.uid}
            chooserId={room.currentChooserId}
            answeringId={room.clueState?.activeAnswerPlayerId}
          />
          <ActivityLog room={room} />
        </aside>
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
