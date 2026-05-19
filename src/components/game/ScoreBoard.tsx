import { useState } from 'react'
import { Player } from '../../types/game'

interface Props {
  players: Record<string, Player>
  highlightUid?: string
  isHost?: boolean
  onAdjust?: (uid: string, delta: number) => void
}

export function ScoreBoard({ players, highlightUid, isHost, onAdjust }: Props) {
  const [adjustDelta, setAdjustDelta] = useState(100)
  const sorted = Object.values(players).sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider">Scoreboard</p>

      {isHost && onAdjust && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-600">Adjust by</span>
          <input
            type="number"
            min={100}
            step={100}
            value={adjustDelta}
            onChange={(e) => setAdjustDelta(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {sorted.map((player, i) => (
          <div
            key={player.uid}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
              player.uid === highlightUid
                ? 'bg-indigo-500/15 border border-indigo-500/30'
                : 'bg-gray-800'
            }`}
          >
            <span className="w-5 text-sm text-gray-500 text-center">{i + 1}</span>
            <span className="flex-1 text-sm truncate">{player.name}</span>
            <span className={`font-mono text-sm font-medium tabular-nums ${player.score < 0 ? 'text-red-400' : 'text-indigo-400'}`}>
              ${player.score.toLocaleString()}
            </span>
            {isHost && onAdjust && (
              <div className="flex gap-1">
                <button
                  onClick={() => onAdjust(player.uid, adjustDelta)}
                  className="w-6 h-6 rounded bg-green-800 hover:bg-green-600 text-white text-xs font-bold transition-colors"
                  title={`+${adjustDelta}`}
                >+</button>
                <button
                  onClick={() => onAdjust(player.uid, -adjustDelta)}
                  className="w-6 h-6 rounded bg-red-900 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                  title={`-${adjustDelta}`}
                >−</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
