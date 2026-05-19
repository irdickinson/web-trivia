import { Room, ClueOutcome } from '../../types/game'
import { User } from 'firebase/auth'

interface Props {
  room: Room
  user: User
  isHost: boolean
  onAdjustScore: (targetUid: string, delta: number) => void
}

export function OutcomeCard({ room, user, isHost, onAdjustScore }: Props) {
  const cs = room.clueState!
  const outcome: ClueOutcome = cs.outcome ?? { wasCorrect: false, pointsDelta: 0, correctAnswer: '' }
  const winner = outcome.winnerId ? room.players[outcome.winnerId] : null

  const isCorrect = outcome.wasCorrect
  const isIncorrect = !outcome.wasCorrect && !!outcome.winnerId
  const isTimeout = !outcome.winnerId

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-2xl shadow-2xl border flex flex-col gap-4 p-5 ${
          isCorrect
            ? 'bg-green-950/95 border-green-700'
            : isIncorrect
              ? 'bg-red-950/95 border-red-800'
              : 'bg-gray-900/95 border-gray-700'
        }`}
      >
        {/* Result headline */}
        <div className="text-center">
          {isCorrect && winner && (
            <>
              <p className="text-green-400 font-black text-xl">{winner.name} got it!</p>
              <p className="text-green-300 font-bold text-lg mt-0.5">+${outcome.pointsDelta.toLocaleString()}</p>
            </>
          )}
          {isIncorrect && winner && (
            <>
              <p className="text-red-400 font-black text-xl">Wrong answer</p>
              {room.settings.deductOnWrongAnswer && outcome.pointsDelta < 0 && (
                <p className="text-red-300 font-bold text-lg mt-0.5">
                  −${Math.abs(outcome.pointsDelta).toLocaleString()}
                </p>
              )}
            </>
          )}
          {isTimeout && (
            <p className="text-orange-400 font-black text-xl">Time ran out</p>
          )}
          <p className={`mt-2 text-sm ${isCorrect ? 'text-green-200' : isIncorrect ? 'text-red-200' : 'text-gray-300'}`}>
            Answer:{' '}
            <span className="font-bold text-white">{outcome.correctAnswer || cs.correctAnswers[0]}</span>
          </p>
          <p className="text-[11px] text-gray-600 mt-1 uppercase tracking-widest">
            {cs.category} · ${cs.value}
          </p>
        </div>

        {/* Submitted answers */}
        {Object.keys(cs.submittedAnswers).length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Submitted</p>
            <div className="flex flex-col gap-0.5">
              {Object.entries(cs.submittedAnswers).map(([uid, ans]) => {
                const player = room.players[uid]
                const isWinner = uid === outcome.winnerId && outcome.wasCorrect
                return (
                  <div key={uid} className="flex items-center gap-2 text-sm px-2 py-1 rounded bg-gray-800/60">
                    <span className="flex-1 text-gray-400 truncate text-xs">{player?.name ?? uid}</span>
                    <span className={`font-medium text-xs ${isWinner ? 'text-green-400' : 'text-gray-300'}`}>{ans}</span>
                    {isWinner && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Host score adjustment */}
        {isHost && (
          <div className="flex flex-col gap-2 border-t border-gray-700/50 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Score Adjust</p>
            <div className="flex flex-col gap-1">
              {Object.values(room.players).map((p) => (
                <div key={p.uid} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate text-gray-300">{p.name}</span>
                  <span className={`font-mono tabular-nums w-16 text-right ${p.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    ${p.score.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onAdjustScore(p.uid, cs.value)}
                    className="w-6 h-6 rounded bg-green-900 hover:bg-green-700 text-white font-bold text-xs transition-colors"
                    title={`+$${cs.value}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => onAdjustScore(p.uid, -cs.value)}
                    className="w-6 h-6 rounded bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs transition-colors"
                    title={`−$${cs.value}`}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isHost && (
          <p className="text-center text-xs text-gray-600">Continuing automatically…</p>
        )}
      </div>
    </div>
  )
}
