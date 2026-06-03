import { useEffect, useRef, useState, Fragment } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { sendChat } from '../../lib/chat'
import { loadMediaVideo, grantMediaControl } from '../../lib/media'
import { extractVideoId } from '../../lib/youtube'

interface Props {
  room: Room
  user: User
}

const URL_RE = /(https?:\/\/[^\s]+)/g

export function ChatPanel({ room, user }: Props) {
  const messages = room.chat ?? []
  const controllerId = room.media?.controllerId ?? room.hostId
  const canControl = user.uid === room.hostId || user.uid === controllerId

  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // Keep the view pinned to the newest message.
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    void sendChat(room, user.uid, room.players[user.uid]?.name ?? 'Player', trimmed)
  }

  function loadFromChat(url: string) {
    const id = extractVideoId(url)
    if (!id) return
    // Make sure the loader actually has control before broadcasting.
    if (user.uid !== controllerId) void grantMediaControl(room, user.uid)
    void loadMediaVideo(room, id, url)
  }

  return (
    <div className="panel elevated-panel stack chat-panel">
      <div className="eyebrow" style={{ marginBottom: 0 }}>Chat</div>

      <div className="chat-log" ref={listRef}>
        {messages.length === 0 && (
          <p className="muted" style={{ fontSize: '0.82rem' }}>No messages yet. Say hi or drop a link.</p>
        )}
        {messages.map((m) => {
          const mine = m.uid === user.uid
          return (
            <div key={m.id} className="chat-msg">
              <span className={`chat-author${mine ? ' me' : ''}`}>{m.name}</span>
              <span className="chat-text">{renderText(m.text, canControl, loadFromChat)}</span>
            </div>
          )
        })}
      </div>

      <div className="row gap" style={{ gap: '0.4rem' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
          placeholder="Message or YouTube link…"
          maxLength={300}
          style={{ flex: 1, fontSize: '0.84rem', padding: '0.5rem 0.6rem' }}
        />
        <button className="mini-btn" onClick={handleSend} disabled={!text.trim()}>Send</button>
      </div>
    </div>
  )
}

// Splits message text into plain spans and clickable links. YouTube links also
// get a one-tap Load button for whoever currently controls media.
function renderText(
  text: string,
  canControl: boolean,
  onLoad: (url: string) => void,
) {
  const parts = text.split(URL_RE)
  return parts.map((part, i) => {
    if (!/^https?:\/\//.test(part)) return <Fragment key={i}>{part}</Fragment>
    const isYouTube = extractVideoId(part) !== null
    return (
      <Fragment key={i}>
        <a href={part} target="_blank" rel="noopener noreferrer" className="chat-link">{part}</a>
        {isYouTube && canControl && (
          <button className="chat-load-btn" onClick={() => onLoad(part)} title="Play in the room">▶ Load</button>
        )}
      </Fragment>
    )
  })
}
