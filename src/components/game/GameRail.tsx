import { useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { useAudio } from '../../hooks/useAudio'
import { ScoreChart } from './ScoreChart'
import { ChatPanel } from './ChatPanel'
import { MediaPlayer } from './MediaPlayer'

type RailTab = 'chat' | 'media' | 'activity'

interface Props {
  room: Room
  user: User
  audio: ReturnType<typeof useAudio>
}

// The right-hand info rail shared by every in-game view: live scoreboard plus a
// tabbed Chat / Media / Activity panel. All panes stay mounted (hidden via the
// `hidden` attribute) so the media player keeps playing and chat keeps its
// scroll position while you switch tabs.
export function GameRail({ room, user, audio }: Props) {
  const [railTab, setRailTab] = useState<RailTab>('chat')

  // Surface a dot on the Chat tab when new messages arrive while it's hidden.
  const seenChatRef = useRef(0)
  const [chatUnread, setChatUnread] = useState(false)
  const chatCount = room.chat?.length ?? 0
  useEffect(() => {
    if (railTab === 'chat') {
      seenChatRef.current = chatCount
      setChatUnread(false)
    } else if (chatCount > seenChatRef.current) {
      setChatUnread(true)
    }
  }, [chatCount, railTab])

  return (
    <aside className="info-rail">
      <ScoreChart
        players={room.players}
        currentUid={user.uid}
        chooserId={room.currentChooserId}
        answeringId={room.clueState?.activeAnswerPlayerId}
      />

      <div className="rail-tabs" role="tablist">
        <button
          role="tab"
          className={`rail-tab${railTab === 'chat' ? ' active' : ''}`}
          aria-selected={railTab === 'chat'}
          onClick={() => setRailTab('chat')}
        >
          Chat{chatUnread && <span className="rail-tab-dot" aria-label="new messages" />}
        </button>
        <button
          role="tab"
          className={`rail-tab${railTab === 'media' ? ' active' : ''}`}
          aria-selected={railTab === 'media'}
          onClick={() => setRailTab('media')}
        >
          Media
        </button>
        <button
          role="tab"
          className={`rail-tab${railTab === 'activity' ? ' active' : ''}`}
          aria-selected={railTab === 'activity'}
          onClick={() => setRailTab('activity')}
        >
          Activity
        </button>
      </div>

      <div className="rail-pane" hidden={railTab !== 'chat'}>
        <ChatPanel room={room} user={user} />
      </div>
      <div className="rail-pane" hidden={railTab !== 'media'}>
        <MediaPlayer room={room} user={user} audio={audio} />
      </div>
      <div className="rail-pane" hidden={railTab !== 'activity'}>
        <ActivityLog room={room} />
      </div>
    </aside>
  )
}

function ActivityLog({ room }: { room: Room }) {
  return (
    <div className="panel elevated-panel stack">
      <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Activity</div>
      <div className="log-panel stack compact-stack">
        {[...room.messages].reverse().slice(0, 12).map((msg) => (
          <div
            key={msg.id}
            className={`msg${msg.type === 'override' ? ' override' : msg.type === 'warning' ? ' warning' : ''}`}
          >
            {msg.text}
          </div>
        ))}
        {room.messages.length === 0 && (
          <p className="muted" style={{ fontSize: '0.82rem' }}>No activity yet.</p>
        )}
      </div>
    </div>
  )
}
