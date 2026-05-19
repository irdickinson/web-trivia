import { Player } from '../../types/game'
import { Button } from '../ui/Button'

interface Props {
  players: Record<string, Player>
  currentUid: string
  onPlayAgain: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']

export function GameFinished({ players, currentUid, onPlayAgain }: Props) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex((p) => p.uid === currentUid) + 1

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Game Over</h1>
        {myRank > 0 && (
          <p className="text-gray-400 mt-2">
            You finished {myRank === 1 ? '1st' : myRank === 2 ? '2nd' : myRank === 3 ? '3rd' : `${myRank}th`}
            {myRank === 1 ? ' 🎉' : ''}
          </p>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col gap-2">
        {sorted.map((player, i) => (
          <div
            key={player.uid}
            className={`flex items-center gap-4 rounded-xl p-4 ${
              player.uid === currentUid
                ? 'bg-indigo-500/15 border border-indigo-500/30'
                : i === 0
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-gray-800'
            }`}
          >
            <span className="w-8 text-center text-xl">{MEDALS[i] ?? i + 1}</span>
            <span className="flex-1 font-medium truncate">{player.name}</span>
            <span className={`font-mono font-bold text-lg tabular-nums ${player.score < 0 ? 'text-red-400' : 'text-indigo-400'}`}>
              ${player.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onPlayAgain}>
        Play Again
      </Button>
    </div>
  )
}
