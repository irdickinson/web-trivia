import { useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { Button } from '../ui/Button'

interface Props {
  room: Room
  user: User
  onSubmitWager: (wager: number) => void
  onSubmitAnswers: (answers: Record<string, string>) => void
  onRevealResults: () => void
  onFinish: () => void
}

// ── Wager phase ──────────────────────────────────────────────────────────────

function WagerPhase({
  room,
  user,
  onSubmit,
}: {
  room: Room
  user: User
  onSubmit: (w: number) => void
}) {
  const myScore = room.players[user.uid]?.score ?? 0
  const maxWager = Math.max(0, myScore)
  const fr = room.finalRound!
  const myEntry = fr.playerEntries[user.uid]
  const hasWagered = myEntry?.wager !== undefined && myEntry.wager > 0

  const [wager, setWager] = useState(Math.min(maxWager, 0))
  const [submitted, setSubmitted] = useState(hasWagered)

  const waitingCount = Object.keys(room.players).filter(
    (uid) => !fr.playerEntries[uid]?.wager,
  ).length

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Final Round</h2>
        <p className="text-gray-400 mt-1 text-sm">
          {fr.questions.length} question{fr.questions.length !== 1 ? 's' : ''}. Set your wager — the top scorer doubles it.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Your score</span>
          <span className="font-mono font-semibold text-indigo-300">${myScore.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Max wager</span>
          <span className="font-mono font-semibold text-yellow-300">${maxWager.toLocaleString()}</span>
        </div>

        {submitted ? (
          <p className="text-center text-sm text-gray-500 py-2">
            Wager submitted: <span className="text-white font-medium">${myEntry.wager.toLocaleString()}</span>
          </p>
        ) : (
          <>
            <input
              type="range"
              min={0}
              max={maxWager}
              step={100}
              value={wager}
              onChange={(e) => setWager(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={maxWager}
                step={100}
                value={wager}
                onChange={(e) =>
                  setWager(Math.min(maxWager, Math.max(0, parseInt(e.target.value) || 0)))
                }
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                onClick={() => { setSubmitted(true); onSubmit(wager) }}
                className="shrink-0"
              >
                Lock In
              </Button>
            </div>
          </>
        )}
      </div>

      {waitingCount > 0 && (
        <p className="text-center text-xs text-gray-600">
          Waiting for {waitingCount} player{waitingCount !== 1 ? 's' : ''} to wager…
        </p>
      )}
    </div>
  )
}

// ── Answer phase ─────────────────────────────────────────────────────────────

function AnswerPhase({
  room,
  user,
  onSubmit,
}: {
  room: Room
  user: User
  onSubmit: (answers: Record<string, string>) => void
}) {
  const fr = room.finalRound!
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(fr.questions.map((q) => [q.id, ''])),
  )
  const [submitted, setSubmitted] = useState(
    Object.keys(fr.playerEntries[user.uid]?.answers ?? {}).length > 0,
  )

  const myEntry = fr.playerEntries[user.uid]
  const allFilled = fr.questions.every((q) => answers[q.id]?.trim())

  const waitingCount = Object.keys(room.players).filter(
    (uid) => Object.keys(fr.playerEntries[uid]?.answers ?? {}).length === 0,
  ).length

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Answer the Clues</h2>
        <p className="text-gray-400 mt-1 text-sm">
          Wager: <span className="text-yellow-300 font-semibold">${myEntry?.wager.toLocaleString()}</span>
        </p>
      </div>

      {submitted ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-3">
          <p className="text-gray-400 text-sm text-center">Answers submitted. Waiting for others…</p>
          {fr.questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-500">{q.category}</p>
              <p className="text-sm text-gray-300">{q.clue}</p>
              <p className="text-sm text-indigo-300 font-medium">
                Your answer: {myEntry?.answers[q.id] ?? '—'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {fr.questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  {q.category}
                </span>
                <span className="text-xs text-gray-600">Q{i + 1}</span>
              </div>
              <p className="text-base text-white leading-snug">{q.clue}</p>
              <input
                value={answers[q.id] ?? ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder="Your answer…"
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          ))}
          <Button
            onClick={() => { setSubmitted(true); onSubmit(answers) }}
            disabled={!allFilled}
            className="w-full"
            size="lg"
          >
            Submit Answers
          </Button>
        </div>
      )}

      {waitingCount > 0 && (
        <p className="text-center text-xs text-gray-600">
          Waiting for {waitingCount} more player{waitingCount !== 1 ? 's' : ''}…
        </p>
      )}
    </div>
  )
}

// ── Results phase ─────────────────────────────────────────────────────────────

function ResultsPhase({
  room,
  user,
  isHost,
  onReveal,
  onFinish,
}: {
  room: Room
  user: User
  isHost: boolean
  onReveal: () => void
  onFinish: () => void
}) {
  const fr = room.finalRound!
  const sorted = Object.values(room.players).sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Final Results</h2>
      </div>

      {/* Questions + answers */}
      {fr.questions.map((q, i) => (
        <div key={q.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">{q.category}</span>
            <span className="text-xs text-gray-600">Q{i + 1}</span>
          </div>
          <p className="text-sm text-white">{q.clue}</p>
          <p className="text-xs text-green-400">
            Answer: <span className="font-semibold">{q.acceptedAnswers[0]}</span>
          </p>
          <div className="flex flex-col gap-1">
            {Object.entries(fr.playerEntries).map(([uid, entry]) => {
              const player = room.players[uid]
              const ans = entry.answers[q.id] ?? '—'
              return (
                <div key={uid} className={`flex items-center gap-2 text-xs ${uid === user.uid ? 'text-indigo-300' : 'text-gray-400'}`}>
                  <span className="w-24 truncate font-medium">{player?.name ?? uid}</span>
                  <span className="flex-1">{ans}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Final scores */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Final Scores</p>
        {sorted.map((p, i) => {
          const entry = fr.playerEntries[p.uid]
          return (
            <div
              key={p.uid}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                p.uid === user.uid ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-gray-800'
              }`}
            >
              <span className="w-6 text-sm text-gray-500">{i + 1}</span>
              <span className="flex-1 font-medium truncate">{p.name}</span>
              {entry?.doubled && (
                <span className="text-xs text-yellow-400 font-bold">DOUBLED</span>
              )}
              <span className={`font-mono font-bold tabular-nums ${p.score < 0 ? 'text-red-400' : 'text-indigo-300'}`}>
                ${p.score.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>

      {isHost ? (
        <div className="flex gap-3">
          <Button onClick={onReveal} variant="secondary" className="flex-1">
            Reveal Answers
          </Button>
          <Button onClick={onFinish} className="flex-1" size="lg">
            Finish Game
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">Waiting for host to finish…</p>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function FinalRound({ room, user, onSubmitWager, onSubmitAnswers, onRevealResults, onFinish }: Props) {
  const isHost = user.uid === room.hostId
  const fr = room.finalRound

  if (!fr) return null

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        {fr.status === 'wager' && (
          <WagerPhase room={room} user={user} onSubmit={onSubmitWager} />
        )}
        {fr.status === 'answer' && (
          <AnswerPhase room={room} user={user} onSubmit={onSubmitAnswers} />
        )}
        {fr.status === 'results' && (
          <ResultsPhase
            room={room}
            user={user}
            isHost={isHost}
            onReveal={onRevealResults}
            onFinish={onFinish}
          />
        )}
      </div>
    </main>
  )
}
