import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { User } from 'firebase/auth'
import { Room, ClueState, GameMode } from '../../types/game'
import { Button } from '../ui/Button'

interface Props {
  room: Room
  user: User
  onBuzz: () => void
  onSubmitAnswer: (answer: string) => void
  onSubmitChoice: (idx: number) => void
  onHostTimeout: () => void
}

// ── Hooks ────────────────────────────────────────────────────────────────────

function useRevealedText(cs: ClueState): string {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (cs.status !== 'revealing' && cs.status !== 'answering') return
    const id = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(id)
  }, [cs.status, cs.revealStartedAt])
  const elapsed = Date.now() - cs.revealStartedAt
  const chars = Math.min(cs.fullText.length, Math.floor(elapsed / cs.revealSpeedMs))
  return cs.fullText.slice(0, chars)
}

function useDeadlineMs(deadline: number | null | undefined): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])
  if (!deadline) return 0
  return Math.max(0, deadline - now)
}

// ── Timer bar ────────────────────────────────────────────────────────────────

function TimerBar({
  label,
  secsLeft,
  percent,
  variant,
}: {
  label: string
  secsLeft: number
  percent: number
  variant: 'answer' | 'buzz'
}) {
  const urgent = variant === 'answer' && secsLeft <= 3
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <div className="flex justify-between items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{label}</span>
        <span className={`text-xs font-mono font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-white'}`}>
          {secsLeft.toFixed(1)}s
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-none ${
            variant === 'buzz'
              ? 'bg-blue-500'
              : urgent
                ? 'bg-red-500'
                : 'bg-yellow-400'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function ClueView({ room, user, onBuzz, onSubmitAnswer, onSubmitChoice, onHostTimeout }: Props) {
  const cs = room.clueState!
  const isHost = user.uid === room.hostId
  const mode: GameMode = room.settings.mode
  const isJeopardy = mode === 'jeopardy'

  const revealedText = useRevealedText(cs)
  const buzzMsLeft = useDeadlineMs(cs.buzzDeadline)
  const answerMsLeft = useDeadlineMs(cs.answerDeadline)
  const isFullyRevealed = revealedText.length >= cs.fullText.length

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEligibleToBuzz =
    cs.status === 'revealing' &&
    isJeopardy &&
    cs.remainingEligiblePlayers.includes(user.uid) &&
    !cs.activeAnswerPlayerId

  const isActiveAnswerer = cs.activeAnswerPlayerId === user.uid
  const myAnswer = cs.submittedAnswers[user.uid]

  // Host drives deadline transitions
  const onHostTimeoutRef = useRef(onHostTimeout)
  useEffect(() => { onHostTimeoutRef.current = onHostTimeout })

  useEffect(() => {
    if (!isHost) return
    const id = setInterval(() => {
      if (cs.status === 'revealing' && cs.buzzDeadline && Date.now() > cs.buzzDeadline) {
        onHostTimeoutRef.current()
      }
      if ((cs.status === 'buzzed' || cs.status === 'answering') && cs.answerDeadline && Date.now() > cs.answerDeadline) {
        onHostTimeoutRef.current()
      }
    }, 200)
    return () => clearInterval(id)
  }, [isHost, cs.status, cs.buzzDeadline, cs.answerDeadline])

  // Classic/speed: transition revealing → answering once fully revealed (host)
  const hostTransitionedRef = useRef(false)
  useEffect(() => {
    if (!isHost || isJeopardy || hostTransitionedRef.current) return
    if (isFullyRevealed && cs.status === 'revealing') {
      hostTransitionedRef.current = true
      onHostTimeoutRef.current()
    }
  }, [isFullyRevealed, cs.status, isHost, isJeopardy])
  useEffect(() => { hostTransitionedRef.current = false }, [cs.questionId])

  // Focus input when it's our turn
  useEffect(() => {
    if ((isActiveAnswerer || (cs.status === 'answering' && !myAnswer)) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [cs.status, isActiveAnswerer, myAnswer])

  async function handleSubmit() {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    await onSubmitAnswer(answer.trim())
    setAnswer('')
    setSubmitting(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void handleSubmit()
  }

  const totalBuzzMs = cs.fullText.length * cs.revealSpeedMs + room.settings.postRevealBuzzSeconds * 1000
  const buzzPercent = cs.buzzDeadline ? (buzzMsLeft / totalBuzzMs) * 100 : 0
  const answerPercent = cs.answerDeadline ? (answerMsLeft / (room.settings.answerTimeSeconds * 1000)) * 100 : 0
  const buzzSecsLeft = buzzMsLeft / 1000
  const answerSecsLeft = answerMsLeft / 1000

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Clue header strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-950/60 border-b border-blue-900/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-blue-300">
            {cs.category}
          </span>
          <span className="text-yellow-400 font-black text-lg">${cs.value}</span>
        </div>

        {/* Timer bars */}
        <div className="flex items-center gap-4">
          {cs.status === 'revealing' && isJeopardy && cs.buzzDeadline && buzzMsLeft > 0 && (
            <TimerBar label="Buzz window" secsLeft={buzzSecsLeft} percent={buzzPercent} variant="buzz" />
          )}
          {(cs.status === 'buzzed' || cs.status === 'answering') && cs.answerDeadline && answerMsLeft > 0 && (
            <TimerBar label="Answer" secsLeft={answerSecsLeft} percent={answerPercent} variant="answer" />
          )}
        </div>
      </div>

      {/* Main clue area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Reveal progress */}
        {!isFullyRevealed && (
          <div className="w-full max-w-2xl h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-none"
              style={{ width: `${cs.fullText.length ? (revealedText.length / cs.fullText.length) * 100 : 0}%` }}
            />
          </div>
        )}

        {/* Clue text */}
        <div className="w-full max-w-2xl text-center px-4">
          <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white min-h-[4rem]">
            {revealedText}
            {!isFullyRevealed && (
              <span className="animate-pulse text-blue-400">▌</span>
            )}
          </p>
        </div>

        {/* Status messages */}
        {cs.status === 'buzzed' && cs.activeAnswerPlayerId && (
          <div className={`px-4 py-2 rounded-lg border font-bold text-sm ${
            isActiveAnswerer
              ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
              : 'bg-gray-800 border-gray-700 text-gray-400'
          }`}>
            {isActiveAnswerer
              ? '🔔 You buzzed in! Type your answer.'
              : `${room.players[cs.activeAnswerPlayerId]?.name ?? 'Someone'} buzzed in!`}
          </div>
        )}

        {cs.status === 'answering' && !isJeopardy && !myAnswer && (
          <p className="text-sm text-blue-300 font-medium">Everyone answer now!</p>
        )}

        {/* Multiple choice */}
        {mode === 'multiple-choice' && cs.status === 'answering' && cs.options && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
            {cs.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => !myAnswer && onSubmitChoice(idx)}
                disabled={!!myAnswer}
                className={`px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                  myAnswer === opt
                    ? 'bg-blue-700 border-blue-500 text-white'
                    : myAnswer
                      ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-default'
                      : 'bg-blue-900/40 border-blue-800 text-gray-200 hover:border-blue-600 hover:bg-blue-900/70 cursor-pointer active:scale-95'
                }`}
              >
                <span className="text-blue-500 mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Text answer input */}
        {(cs.status === 'answering' || (cs.status === 'buzzed' && isActiveAnswerer)) &&
          mode !== 'multiple-choice' && (
          <div className="flex gap-2 w-full max-w-md">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={myAnswer ? `Submitted: ${myAnswer}` : 'Type your answer…'}
              disabled={!!myAnswer || submitting}
              className="flex-1 bg-gray-800 border-2 border-gray-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50 transition-colors"
            />
            <Button
              onClick={handleSubmit}
              disabled={!!myAnswer || !answer.trim() || submitting}
              loading={submitting}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-0"
            >
              Submit
            </Button>
          </div>
        )}

        {/* Buzz button */}
        {isEligibleToBuzz && isFullyRevealed && (
          <button
            onClick={onBuzz}
            className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-2xl rounded-2xl shadow-xl shadow-yellow-900/30 transition-all border-4 border-yellow-500"
          >
            BUZZ IN
          </button>
        )}

        {/* Submitted confirmation */}
        {myAnswer && cs.status !== 'resolved' && (
          <p className="text-xs text-gray-600 uppercase tracking-widest">
            Submitted: <span className="text-gray-400 normal-case">{myAnswer}</span>
          </p>
        )}

        {/* Not eligible to buzz */}
        {isJeopardy && cs.status === 'revealing' && !isEligibleToBuzz &&
          !cs.remainingEligiblePlayers.includes(user.uid) && (
          <p className="text-xs text-gray-700">You are not eligible to buzz for this clue.</p>
        )}

        {cs.status === 'buzzed' && !isActiveAnswerer && (
          <p className="text-sm text-gray-500">
            Waiting for{' '}
            <span className="text-white font-medium">
              {room.players[cs.activeAnswerPlayerId ?? '']?.name ?? 'player'}
            </span>{' '}
            to answer…
          </p>
        )}
      </div>

      {/* Bottom score strip */}
      <div className="flex gap-2 justify-center px-4 py-2.5 bg-gray-900/80 border-t border-gray-800 overflow-x-auto shrink-0">
        {Object.values(room.players)
          .sort((a, b) => b.score - a.score)
          .map((p) => (
            <div
              key={p.uid}
              className={`flex flex-col items-center gap-0 px-3 py-1 rounded-lg shrink-0 ${
                p.uid === user.uid ? 'bg-blue-900/30 border border-blue-800/40' : ''
              }`}
            >
              <span className="text-[10px] text-gray-500 truncate max-w-[5rem]">{p.name}</span>
              <span className={`text-sm font-black font-mono tabular-nums ${p.score < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                ${p.score.toLocaleString()}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}
