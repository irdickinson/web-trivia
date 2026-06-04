import { User } from 'firebase/auth'
import { Room } from '../../types/game'

interface Props {
  room: Room
  user: User
  onToggleReady: () => void
}

// Player roster used on the ready-up screens (round intro + summary). Ready is a
// cosmetic signal — the host starts the round regardless — so a player can only
// toggle their own chip; everyone else's is read-only.
export function ReadyRoster({ room, user, onToggleReady }: Props) {
  const rs = room.roundState!
  const players = Object.values(room.players)
  const readyCount = players.filter((p) => rs.ready?.[p.uid]).length

  return (
    <div className="stack compact-stack">
      <div className="ready-head">
        <span className="eyebrow" style={{ marginBottom: 0 }}>Players</span>
        <span className="muted" style={{ fontSize: '0.82rem' }}>
          {readyCount} of {players.length} ready
        </span>
      </div>
      <div className="ready-roster">
        {players.map((p) => {
          const isReady = !!rs.ready?.[p.uid]
          const isMe = p.uid === user.uid
          return (
            <button
              key={p.uid}
              type="button"
              className={`ready-chip${isReady ? ' ready' : ''}${isMe ? ' me' : ''}`}
              onClick={isMe ? onToggleReady : undefined}
              disabled={!isMe}
              title={isMe ? 'Toggle ready' : undefined}
            >
              <span className="ready-dot" />
              <span className="ready-name">{p.name}</span>
              {p.uid === room.hostId && (
                <span className="tag chooser-tag ready-tag">Host</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
