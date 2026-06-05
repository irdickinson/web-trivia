import { useEffect, useRef, useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { ScoreChart } from './ScoreChart'
import { ChatPanel } from './ChatPanel'
import { MediaPlayer } from './MediaPlayer'
import { SharedVideo, useMediaPlayer } from './MediaProvider'

type RailTab = 'chat' | 'media' | 'activity'

interface Props {
  room: Room
  user: User
}

// The right-hand info rail shared by every in-game view: the shared-media video
// frame (always mounted while media is active so playback survives tab switches),
// the live scoreboard, then a tabbed Chat / Media / Activity panel. Tabs are
// closed by default and toggle open/closed; panes stay mounted (hidden via the
// `hidden` attribute) so chat keeps its scroll position.
export function GameRail({ room, user }: Props) {
  const [railTab, setRailTab] = useState<RailTab | null>(null)
  const { hasMedia, canControl } = useMediaPlayer()

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

  function toggle(tab: RailTab) {
    setRailTab((cur) => (cur === tab ? null : tab))
  }

  return (
    <aside className="info-rail">
      {(hasMedia || canControl) && <SharedVideo />}

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
          onClick={() => toggle('chat')}
        >
          Chat{chatUnread && <span className="rail-tab-dot" aria-label="new messages" />}
        </button>
        <button
          role="tab"
          className={`rail-tab${railTab === 'media' ? ' active' : ''}`}
          aria-selected={railTab === 'media'}
          onClick={() => toggle('media')}
        >
          Media
        </button>
        <button
          role="tab"
          className={`rail-tab${railTab === 'activity' ? ' active' : ''}`}
          aria-selected={railTab === 'activity'}
          onClick={() => toggle('activity')}
        >
          Activity
        </button>
      </div>

      <div className="rail-pane" hidden={railTab !== 'chat'}>
        <ChatPanel room={room} user={user} />
      </div>
      <div className="rail-pane" hidden={railTab !== 'media'}>
        <MediaPlayer room={room} user={user} />
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
