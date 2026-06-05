import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { MediaStatusBar } from './MediaStatusBar'

interface HeaderProps {
  room: Room
  user: User
  isHost: boolean
  onBackToLobby: () => void
  onLeaveGame: () => void
}

// Shared game header: status chips, the shared-media status bar, and the
// lobby/leave control. The host can end the game back to the lobby; everyone
// else can leave to Home.
export function GameHeader({ room, user, isHost, onBackToLobby, onLeaveGame }: HeaderProps) {
  const me = room.players[user.uid]
  const chooser = room.players[room.currentChooserId ?? '']
  const cs = room.clueState
  const activeAnswerer = cs?.activeAnswerPlayerId ? room.players[cs.activeAnswerPlayerId] : null

  return (
    <header className="topbar panel elevated-panel">
      {/* Status chips */}
      <div className="row gap wrap">
        {me && (
          <div className="hero-chip primary-chip">
            <span className="chip-label">You</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{me.name}</span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1,
              color: me.score < 0 ? 'var(--danger)' : 'var(--gold)',
              marginTop: '0.1rem',
            }}>
              ${me.score.toLocaleString()}
            </span>
          </div>
        )}
        {chooser && chooser.uid !== user.uid && (
          <div className="hero-chip">
            <span className="chip-label">Chooser</span>
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{chooser.name}</span>
          </div>
        )}
        {activeAnswerer && (
          <div className="hero-chip answering-chip">
            <span className="chip-label">Answering</span>
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{activeAnswerer.name}</span>
          </div>
        )}
      </div>

      {/* Shared-media status bar + lobby/leave */}
      <div className="topbar-actions">
        <MediaStatusBar />
        {isHost ? (
          <button className="danger mini-btn" onClick={onBackToLobby}>
            ← Lobby
          </button>
        ) : (
          <button className="danger mini-btn" onClick={onLeaveGame}>
            Leave
          </button>
        )}
      </div>
    </header>
  )
}

// Host confirmation before ending the game back to the lobby.
export function EndConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="review-modal">
      <div className="panel elevated-panel stack review-card" style={{ textAlign: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 900 }}>Return to lobby?</h2>
          <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
            The current game will end for all players.
          </p>
        </div>
        <div className="row gap">
          <button className="danger btn-lg" style={{ flex: 1 }} onClick={onConfirm}>Confirm</button>
          <button className="secondary btn-lg" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
