import { Player } from '../../types/game'

interface Props {
  players: Player[]
  hostId: string
}

export function PlayerList({ players, hostId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Players — {players.length}
      </p>
      <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
        {players.map((player) => (
          <div key={player.uid} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{player.name}</span>
            {player.uid === hostId && (
              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
          </div>
        ))}
        {players.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500">No players yet…</p>
        )}
      </div>
    </div>
  )
}
