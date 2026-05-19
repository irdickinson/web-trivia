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

// Compute how many characters should be visible right now based on when the
// reveal started and how fast it runs.  Clients all compute this independently
// so no per-character Firestore writes are needed.
function useRevealedText(cs: ClueState): string {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (cs.status !== 'revealing' && cs.status !== 'answering') return
    const id = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(id)
  }, [cs.status, cs.revealStartedAt])

  const elapsed = Date.now() - cs.revealStartedAt
  const chars = Math.min(cs.fullText.length, Math.floor(elapsed / cs.revealSpeedMs))
  return cs.fullText.slice(0, chars)
  // tick intentionally used only to force re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
}

function useBuzzDeadlineCountdown(cs: ClueState): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])
  if (!cs.buzzDeadline) return 0
  return Math.max(0, cs.buzzDeadline - now)
}

function useAnswerDeadlineCountdown(cs: ClueState): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])
  if (!cs.answerDeadline) return 0
  return Math.max(0, cs.answerDeadline - now)
}

export function ClueView({ room, user, onBuzz, onSubmitAnswer, onSubmitChoice, onHostTimeout }: Props) {
  const cs = room.clueState!
  const isHost = user.uid === room.hostId
  const mode: GameMode = room.settings.mode
  const isJeopardy = mode === 'jeopardy'

  const revealedText = useRevealedText(cs)
  const buzzMsLeft = useBuzzDeadlineCountdown(cs)
  const answerMsLeft = useAnswerDeadlineCountdown(cs)
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
  const isAnswering = (cs.status === 'answering' || cs.status === 'buzzed') && !myAnswer

  // Host timeout monitoring
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

  // Classic/speed: transition from revealing → answering once fully revealed (host only)
  const hostTransitionedRef = useRef(false)
  useEffect(() => {
    if (!isHost || isJeopardy || hostTransitionedRef.current) return
    if (isFullyRevealed && cs.status === 'revealing') {
      hostTransitionedRef.current = true
      onHostTimeoutRef.current() // reuse — game.ts will flip to 'answering'
    }
  }, [isFullyRevealed, cs.status, isHost, isJeopardy])
  useEffect(() => { hostTransitionedRef.current = false }, [cs.questionId])

  // Focus answer input when it's our turn
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

  const buzzSecsLeft = Math.ceil(buzzMsLeft / 1000)
  const answerSecsLeft = Math.ceil(answerMsLeft / 1000)
  const revealProgress = cs.fullText.length ? revealedText.length / cs.fullText.length : 0

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            {cs.category}
          </span>
          <span className="ml-3 text-yellow-300 font-bold">${cs.value}</span>
        </div>
        <div className="flex items-center gap-4">
          {cs.status === 'revealing' && isJeopardy && cs.buzzDeadline && buzzMsLeft > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-none"
                  style={{ width: `${(buzzMsLeft / (room.settings.postRevealBuzzSeconds * 1000 + cs.fullText.length * cs.revealSpeedMs)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 tabular-nums w-8">{buzzSecsLeft}s</span>
            </div>
          )}
          {cs.status === 'buzzed' && cs.answerDeadline && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-none ${answerSecsLeft <= 3 ? 'bg-red-500' : 'bg-yellow-400'}`}
                  style={{ width: `${(answerMsLeft / (room.settings.answerTimeSeconds * 1000)) * 100}%` }}
                />
              </div>
              <span className={`text-xs tabular-nums w-8 ${answerSecsLeft <= 3 ? 'text-red-400' : 'text-yellow-300'}`}>
                {answerSecsLeft}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Clue area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Reveal progress bar */}
        {!isFullyRevealed && (
          <div className="w-full max-w-2xl h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-none"
              style={{ width: `${revealProgress * 100}%` }}
            />
          </div>
        )}

        {/* Clue text */}
        <div className="w-full max-w-2xl text-center">
          <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white min-h-[4rem]">
            {revealedText}
            {!isFullyRevealed && (
              <span className="animate-pulse text-gray-600">▌</span>
            )}
          </p>
        </div>

        {/* Status messages */}
        {cs.status === 'buzzed' && cs.activeAnswerPlayerId && (
          <p className="text-sm text-yellow-300 font-medium">
            {cs.activeAnswerPlayerId === user.uid
              ? 'You buzzed in!'
              : `${room.players[cs.activeAnswerPlayerId]?.name ?? 'Someone'} buzzed in!`}
          </p>
        )}

        {cs.status === 'answering' && !isJeopardy && !myAnswer && (
          <p className="text-sm text-gray-400">Everyone answer now!</p>
        )}

        {/* Multiple choice options */}
        {mode === 'multiple-choice' && cs.status === 'answering' && cs.options && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
            {cs.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => !myAnswer && onSubmitChoice(idx)}
                disabled={!!myAnswer}
                className={`px-4 py-3 rounded-xl border text-left text-sm font-medium transition-colors ${
                  myAnswer === opt
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : myAnswer
                      ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-default'
                      : 'bg-gray-800 border-gray-600 text-gray-200 hover:border-indigo-500 hover:bg-gray-700 cursor-pointer'
                }`}
              >
                <span className="text-gray-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
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
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <Button
              onClick={handleSubmit}
              disabled={!!myAnswer || !answer.trim() || submitting}
              loading={submitting}
            >
              Submit
            </Button>
          </div>
        )}

        {/* Buzz button */}
        {isEligibleToBuzz && isFullyRevealed && (
          <button
            onClick={onBuzz}
            className="px-10 py-5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-xl rounded-2xl shadow-xl shadow-yellow-900/40 transition-all"
          >
            BUZZ IN
          </button>
        )}

        {/* My submitted answer confirmation */}
        {myAnswer && cs.status !== 'resolved' && (
          <p className="text-sm text-gray-500">
            Answer submitted: <span className="text-gray-300">{myAnswer}</span>
          </p>
        )}

        {/* Non-chooser waiting (jeopardy — reveal phase, no buzz yet shown) */}
        {isJeopardy && cs.status === 'revealing' && !isEligibleToBuzz &&
          !cs.remainingEligiblePlayers.includes(user.uid) && (
          <p className="text-sm text-gray-600">You are not eligible to buzz for this clue.</p>
        )}

        {cs.status === 'buzzed' && !isActiveAnswerer && !myAnswer && (
          <p className="text-sm text-gray-500">
            Waiting for{' '}
            <span className="text-white">
              {room.players[cs.activeAnswerPlayerId ?? '']?.name ?? 'player'}
            </span>{' '}
            to answer…
          </p>
        )}
      </div>

      {/* Bottom: score strip */}
      <div className="flex gap-3 justify-center px-4 py-3 bg-gray-900 border-t border-gray-800 overflow-x-auto">
        {Object.values(room.players)
          .sort((a, b) => b.score - a.score)
          .map((p) => (
            <div
              key={p.uid}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg shrink-0 ${
                p.uid === user.uid ? 'bg-indigo-500/20' : ''
              }`}
            >
              <span className="text-xs text-gray-400 truncate max-w-[6rem]">{p.name}</span>
              <span className={`text-sm font-bold font-mono tabular-nums ${p.score < 0 ? 'text-red-400' : 'text-indigo-300'}`}>
                ${p.score.toLocaleString()}
              </span>
            </div>
          ))}
      </div>
    </main>
  )
}
