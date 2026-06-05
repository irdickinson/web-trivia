import { useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'
import { useMediaPlayer } from './MediaProvider'
import { extractVideoId } from '../../lib/youtube'
import {
  loadMediaVideo,
  stopMedia,
  grantMediaControl,
  enqueueMedia,
  removeFromQueue,
  moveQueueItem,
  playQueueItem,
  playNext,
  replayFromHistory,
} from '../../lib/media'

interface Props {
  room: Room
  user: User
}

// The Media control panel (lives in a tab). The actual video frame is rendered
// separately via <SharedVideo> so playback survives tab switching; this panel
// manages the queue, history, the load input, and host grant-of-control.
export function MediaPlayer({ room, user }: Props) {
  const { canControl, controllerName, hasMedia } = useMediaPlayer()
  const isHost = user.uid === room.hostId
  const media = room.media
  const queue = media?.queue ?? []
  const history = media?.history ?? []
  const controllerId = media?.controllerId ?? room.hostId
  const myName = room.players[user.uid]?.name ?? 'Player'

  const [urlInput, setUrlInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [queueInput, setQueueInput] = useState('')
  const [queueError, setQueueError] = useState('')

  function handleLoad() {
    setInputError('')
    const id = extractVideoId(urlInput)
    if (!id) {
      setInputError('Enter a valid YouTube link or video ID.')
      return
    }
    setUrlInput('')
    void loadMediaVideo(room, id, id)
  }

  function handleEnqueue() {
    setQueueError('')
    const id = extractVideoId(queueInput)
    if (!id) {
      setQueueError('Enter a valid YouTube link or video ID.')
      return
    }
    setQueueInput('')
    void enqueueMedia(room, id, queueInput.trim(), user.uid, myName)
  }

  return (
    <div className="panel elevated-panel stack media-player">
      <div className="row between" style={{ alignItems: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 0 }}>Media</div>
        {hasMedia && (
          <span className="media-now muted">
            {canControl ? 'You control playback' : `${controllerName} hosting`}
          </span>
        )}
      </div>

      {hasMedia ? (
        <div className="media-track" title={media?.title}>
          {media?.title || 'Custom track'}
        </div>
      ) : (
        <p className="muted" style={{ fontSize: '0.84rem' }}>
          {canControl
            ? 'Paste a YouTube link (or share one in chat) to play it in the room.'
            : `${controllerName} can start shared media.`}
        </p>
      )}

      {/* Controller: broadcast a track + stop */}
      {canControl && (
        <>
          <div className="row gap" style={{ gap: '0.4rem' }}>
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoad() }}
              placeholder="YouTube link or ID"
              style={{ flex: 1, fontSize: '0.84rem', padding: '0.5rem 0.6rem' }}
            />
            <button className="mini-btn" onClick={handleLoad}>Load</button>
          </div>
          {inputError && <p className="error" style={{ fontSize: '0.8rem' }}>{inputError}</p>}
          {hasMedia && (
            <button className="secondary mini-btn" onClick={() => void stopMedia(room)}>■ Stop for everyone</button>
          )}
        </>
      )}

      {/* Queue — anyone can add; the controller/host manages order + playback */}
      <div className="media-queue stack" style={{ gap: '0.4rem' }}>
        <div className="row between" style={{ alignItems: 'center' }}>
          <span className="chip-label">Up next{queue.length > 0 ? ` · ${queue.length}` : ''}</span>
          {canControl && queue.length > 0 && (
            <button
              className="secondary mini-btn"
              onClick={() => void playNext(room)}
              title="Skip to next"
            >
              ⏭ Next
            </button>
          )}
        </div>

        {queue.length === 0 ? (
          <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>Queue is empty.</p>
        ) : (
          <ul className="queue-list">
            {queue.map((item, i) => (
              <li key={item.id} className="queue-item">
                <span className="queue-title" title={item.title}>{item.title}</span>
                <span className="queue-by muted">{item.addedByName}</span>
                {canControl && (
                  <span className="queue-actions row" style={{ gap: '0.2rem' }}>
                    <button className="icon-btn" onClick={() => void moveQueueItem(room, item.id, -1)} disabled={i === 0} title="Move up">▲</button>
                    <button className="icon-btn" onClick={() => void moveQueueItem(room, item.id, 1)} disabled={i === queue.length - 1} title="Move down">▼</button>
                    <button className="icon-btn" onClick={() => void playQueueItem(room, item.id)} title="Play now">▶</button>
                    <button className="icon-btn" onClick={() => void removeFromQueue(room, item.id)} title="Remove">✕</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="row gap" style={{ gap: '0.4rem' }}>
          <input
            value={queueInput}
            onChange={(e) => setQueueInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEnqueue() }}
            placeholder="Add a YouTube link to the queue"
            style={{ flex: 1, fontSize: '0.84rem', padding: '0.5rem 0.6rem' }}
          />
          <button className="secondary mini-btn" onClick={handleEnqueue}>+ Queue</button>
        </div>
        {queueError && <p className="error" style={{ fontSize: '0.8rem' }}>{queueError}</p>}
      </div>

      {/* History — recently played; one tap to replay */}
      {history.length > 0 && (
        <div className="media-history stack" style={{ gap: '0.4rem' }}>
          <span className="chip-label">Recently played</span>
          <ul className="queue-list">
            {history.map((item) => (
              <li key={item.id} className="queue-item">
                <span className="queue-title" title={item.title}>{item.title}</span>
                {canControl && (
                  <span className="queue-actions row" style={{ gap: '0.2rem' }}>
                    <button className="icon-btn" onClick={() => void replayFromHistory(room, item)} title="Play again">▶</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Host grants control */}
      {isHost && (
        <label className="media-grant">
          <span className="chip-label">Control</span>
          <select
            value={controllerId}
            onChange={(e) => void grantMediaControl(room, e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.5rem' }}
          >
            {Object.values(room.players).map((p) => (
              <option key={p.uid} value={p.uid}>
                {p.name}{p.uid === room.hostId ? ' (host)' : ''}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
