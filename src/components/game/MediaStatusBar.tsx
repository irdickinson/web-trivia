import { useMediaPlayer } from './MediaProvider'

// Compact now-playing bar for the shared YouTube media. Replaces the old
// procedural-music transport. Shows the current title plus local controls
// (play/pause, sync to host, volume, collapse) and, for the controller, the
// room-wide "Play for everyone" / "Sync all" broadcast.
export function MediaStatusBar() {
  const {
    hasMedia, title, controllerName, canControl,
    localPlaying, volume, setVolume,
    togglePlay, syncToHost, broadcastSync,
    collapsed, toggleCollapsed,
  } = useMediaPlayer()

  return (
    <div className="media-status-bar panellet">
      <div className="media-status-now">
        <span className="media-status-icon" aria-hidden>{hasMedia ? '🎬' : '🎞'}</span>
        <span className="media-status-title" title={hasMedia ? title : undefined}>
          {hasMedia ? (title || 'Loading…') : 'No media playing'}
        </span>
      </div>

      {hasMedia && (
        <div className="media-status-controls">
          <button
            className="secondary mini-btn"
            onClick={togglePlay}
            title={localPlaying ? 'Pause' : 'Play'}
          >
            {localPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="secondary mini-btn"
            onClick={syncToHost}
            title={canControl ? 'Resync to your own playback' : `Sync to ${controllerName}`}
          >
            ⟲ Sync
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            title="Media volume"
            style={{ flex: '0 0 64px' }}
          />
          <button
            className="secondary mini-btn"
            onClick={toggleCollapsed}
            title={collapsed ? 'Show video' : 'Hide video'}
          >
            {collapsed ? '▸' : '▾'}
          </button>
          {canControl && (
            <button
              className="mini-btn"
              onClick={broadcastSync}
              title="Play & sync for everyone in the room"
            >
              ▶ Play for everyone
            </button>
          )}
        </div>
      )}
    </div>
  )
}
