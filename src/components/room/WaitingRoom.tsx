import { useState } from 'react'
import { User } from 'firebase/auth'
import { Room, GameSettings } from '../../types/game'
import { updateRoomSettings, kickPlayer } from '../../lib/rooms'
import { SettingsForm } from '../lobby/SettingsForm'
import { ChatPanel } from '../game/ChatPanel'
import { MediaPlayer } from '../game/MediaPlayer'
import { MediaStatusBar } from '../game/MediaStatusBar'
import { SharedVideo, useMediaPlayer } from '../game/MediaProvider'

const MODE_LABELS: Record<string, string> = {
  jeopardy: 'Jeopardy',
  classic: 'Classic',
  'multiple-choice': 'Multiple Choice',
  speed: 'Speed',
  rounds: 'Rounds',
}

interface Props {
  room: Room
  user: User
  onStart: () => void
  onLeave: () => void
}

type WaitTab = 'chat' | 'media'

// Pre-game waiting room. The host can retune game settings live (without
// disbanding), start the game, and kick players. Everyone sees the shared-media
// status bar / video and a closed-by-default Chat / Media panel.
export function WaitingRoom({ room, user, onStart, onLeave }: Props) {
  const isHost = user.uid === room.hostId
  const players = Object.values(room.players)
  const { hasMedia, canControl } = useMediaPlayer()
  const [tab, setTab] = useState<WaitTab | null>(null)

  function patchSettings(delta: Partial<GameSettings>) {
    void updateRoomSettings(room.code, { ...room.settings, ...delta })
  }

  function toggle(t: WaitTab) {
    setTab((cur) => (cur === t ? null : t))
  }

  const lastPv = room.settings.pointValues[room.settings.pointValues.length - 1] ?? 0

  return (
    <main className="page center">
      <div className="stack" style={{ width: 'min(680px, 94vw)' }}>
        <div className="panel elevated-panel stack" style={{ padding: '1.5rem' }}>
          <div className="topbar">
            <div>
              <div className="eyebrow">Room code</div>
              <div className="lobby-code-display">{room.code}</div>
            </div>
            <button className="secondary mini-btn" onClick={onLeave}>Leave</button>
          </div>

          <div className="divider" />

          <div className="stack compact-stack">
            <div className="eyebrow">Players — {players.length}</div>
            {players.map((player) => (
              <div
                key={player.uid}
                className="player-row"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}
              >
                <span style={{ fontWeight: 600 }}>{player.name}</span>
                <span className="row gap" style={{ alignItems: 'center', gap: '0.4rem' }}>
                  {player.uid === room.hostId && <span className="tag chooser-tag">Host</span>}
                  {isHost && player.uid !== room.hostId && (
                    <button
                      className="icon-btn"
                      onClick={() => void kickPlayer(room.code, user.uid, player.uid)}
                      title={`Kick ${player.name}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              </div>
            ))}
            {players.length === 0 && (
              <p className="muted" style={{ fontSize: '0.88rem' }}>No players yet…</p>
            )}
          </div>

          <div className="divider" />

          {/* Host: live-editable settings; everyone else: read-only summary */}
          {isHost ? (
            <SettingsForm settings={room.settings} onChange={patchSettings} />
          ) : (
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              {MODE_LABELS[room.settings.mode] ?? room.settings.mode}
              {' · '}{room.settings.categoryCount} categories
              {room.settings.mode === 'rounds'
                ? <>{' · '}{room.settings.roundsCount} rounds</>
                : <>{' · '}{room.settings.questionCountPerCategory} questions each{' · '}up to ${lastPv.toLocaleString()}</>}
            </p>
          )}

          {isHost ? (
            <button
              className="btn-lg"
              style={{ width: '100%' }}
              onClick={onStart}
              disabled={players.length < 1}
            >
              Start Game
            </button>
          ) : (
            <p className="muted" style={{ textAlign: 'center', fontSize: '0.88rem' }}>
              Waiting for the host to start…
            </p>
          )}
        </div>

        {/* Shared media: status bar + (collapsible) video */}
        <MediaStatusBar />
        {(hasMedia || canControl) && <SharedVideo />}

        <div className="rail-tabs" role="tablist">
          <button
            role="tab"
            className={`rail-tab${tab === 'chat' ? ' active' : ''}`}
            aria-selected={tab === 'chat'}
            onClick={() => toggle('chat')}
          >
            Chat
          </button>
          <button
            role="tab"
            className={`rail-tab${tab === 'media' ? ' active' : ''}`}
            aria-selected={tab === 'media'}
            onClick={() => toggle('media')}
          >
            Media
          </button>
        </div>

        {/* Panes stay mounted so chat keeps scroll + the media panel stays live. */}
        <div hidden={tab !== 'chat'}>
          <ChatPanel room={room} user={user} />
        </div>
        <div hidden={tab !== 'media'}>
          <MediaPlayer room={room} user={user} />
        </div>
      </div>
    </main>
  )
}
