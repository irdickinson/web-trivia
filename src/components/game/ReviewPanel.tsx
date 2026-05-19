import { AnswerEntry, Player } from '../../types/game'
import { Button } from '../ui/Button'

interface Props {
  answers: Record<string, AnswerEntry>
  players: Record<string, Player>
  onOverride: (uid: string, markCorrect: boolean) => void
  onReveal: () => void
}

export function ReviewPanel({ answers, players, onOverride, onReveal }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Review Answers</p>
        <Button size="sm" onClick={onReveal}>
          Reveal Answer →
        </Button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
        {Object.entries(answers).map(([uid, entry]) => {
          const effective =
            entry.hostOverride !== null ? entry.hostOverride : entry.isCorrect
          const player = players[uid]

          return (
            <div key={uid} className="flex items-center gap-3 px-4 py-3">
              <span className="w-28 text-sm font-medium truncate">
                {player?.name ?? uid}
              </span>
              <span className="flex-1 text-sm text-gray-300 truncate">{entry.answer}</span>
              {entry.points > 0 && (
                <span className="text-xs text-indigo-400 font-mono tabular-nums w-16 text-right">
                  +{entry.points.toLocaleString()}
                </span>
              )}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onOverride(uid, true)}
                  title="Mark correct"
                  className={`w-7 h-7 rounded text-sm font-bold transition-colors ${
                    effective === true
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-green-800 hover:text-white'
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => onOverride(uid, false)}
                  title="Mark wrong"
                  className={`w-7 h-7 rounded text-sm font-bold transition-colors ${
                    effective === false
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-red-800 hover:text-white'
                  }`}
                >
                  ✗
                </button>
              </div>
            </div>
          )
        })}
        {Object.keys(answers).length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500">No answers submitted this round.</p>
        )}
      </div>
    </div>
  )
}
