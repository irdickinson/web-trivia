import { Room, ClueOutcome } from '../../types/game'
import { User } from 'firebase/auth'
import { Button } from '../ui/Button'

interface Props {
  room: Room
  user: User
  onContinue: () => void          // host clicks to go back to board
  onAdjustScore: (targetUid: string, delta: number) => void
}

export function OutcomeOverlay({ room, user, onContinue, onAdjustScore }: Props) {
  const cs = room.clueState!
  const outcome: ClueOutcome = cs.outcome ?? { wasCorrect: false, pointsDelta: 0, correctAnswer: '' }
  const isHost = user.uid === room.hostId

  const winner = outcome.winnerId ? room.players[outcome.winnerId] : null

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col gap-5 p-6">

        {/* Result banner */}
        <div
          className={`rounded-xl px-5 py-4 text-center border ${
            outcome.wasCorrect
              ? 'bg-green-500/10 border-green-500/30'
              : outcome.winnerId
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-gray-800 border-gray-700'
          }`}
        >
          {outcome.wasCorrect && winner && (
            <>
              <p className="text-green-400 font-bold text-lg">{winner.name} got it!</p>
              <p className="text-green-300 text-sm mt-1">+${outcome.pointsDelta.toLocaleString()}</p>
            </>
          )}
          {!outcome.wasCorrect && outcome.winnerId && (
            <p className="text-red-400 font-medium">
              Wrong answer
              {room.settings.deductOnWrongAnswer && outcome.pointsDelta < 0 && (
                <span className="text-red-300"> (–${Math.abs(outcome.pointsDelta).toLocaleString()})</span>
              )}
            </p>
          )}
          {!outcome.winnerId && (
            <p className="text-gray-400 font-medium">No one answered in time</p>
          )}
          <p className="text-gray-300 mt-2 text-sm">
            Answer: <span className="text-white font-semibold">{outcome.correctAnswer}</span>
          </p>
        </div>

        {/* Submitted answers */}
        {Object.keys(cs.submittedAnswers).length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Submitted</p>
            <div className="bg-gray-800 rounded-lg divide-y divide-gray-700 border border-gray-700">
              {Object.entries(cs.submittedAnswers).map(([uid, ans]) => {
                const player = room.players[uid]
                return (
                  <div key={uid} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <span className="flex-1 text-gray-400 truncate">{player?.name ?? uid}</span>
                    <span className="text-white">{ans}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Host score adjustment */}
        {isHost && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Score Adjust</p>
            <div className="flex flex-col gap-1">
              {Object.values(room.players).map((p) => (
                <div key={p.uid} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate text-gray-300">{p.name}</span>
                  <span className={`font-mono tabular-nums w-16 text-right ${p.score < 0 ? 'text-red-400' : 'text-indigo-300'}`}>
                    ${p.score.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onAdjustScore(p.uid, cs.value)}
                    className="w-7 h-7 rounded bg-green-800 hover:bg-green-600 text-white font-bold text-xs transition-colors"
                    title={`+$${cs.value}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => onAdjustScore(p.uid, -cs.value)}
                    className="w-7 h-7 rounded bg-red-900 hover:bg-red-700 text-white font-bold text-xs transition-colors"
                    title={`-$${cs.value}`}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {isHost ? (
          <Button onClick={onContinue} className="w-full" size="lg">
            Continue →
          </Button>
        ) : (
          <p className="text-center text-sm text-gray-500">Waiting for host to continue…</p>
        )}
      </div>
    </div>
  )
}
