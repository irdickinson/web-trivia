import { Player } from '../../types/game'

interface Props {
  players: Player[]
  hostId: string
}

export function PlayerList({ players, hostId }: Props) {
  return (
    <div className="stack compact-stack">
      <div className="eyebrow">Players — {players.length}</div>
      {players.map((player) => (
        <div
          key={player.uid}
          className="player-row"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span style={{ fontWeight: 600 }}>{player.name}</span>
          {player.uid === hostId && <span className="tag chooser-tag">Host</span>}
        </div>
      ))}
      {players.length === 0 && (
        <p className="muted" style={{ fontSize: '0.88rem' }}>No players yet…</p>
      )}
    </div>
  )
}
