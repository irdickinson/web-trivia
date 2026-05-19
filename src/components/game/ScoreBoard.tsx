import { Player } from '../../types/game'

interface Props {
  players: Record<string, Player>
  highlightUid?: string
}

export function ScoreBoard({ players, highlightUid }: Props) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider">Scoreboard</p>
      <div className="flex flex-col gap-1">
        {sorted.map((player, i) => (
          <div
            key={player.uid}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              player.uid === highlightUid ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-gray-800'
            }`}
          >
            <span className="w-5 text-sm text-gray-500 text-center">{i + 1}</span>
            <span className="flex-1 text-sm truncate">{player.name}</span>
            <span className="font-mono text-sm font-medium text-indigo-400 tabular-nums">
              {player.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
