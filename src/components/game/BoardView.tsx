import { Room, BoardMap } from '../../types/game'
import { BoardQuestion } from '../../types/question'
import { User } from 'firebase/auth'

interface Props {
  room: Room
  user: User
  onSelectClue: (row: number, col: number) => void
}

function getBoardDimensions(board: BoardMap): { rows: number; cols: number } {
  let rows = 0; let cols = 0
  for (const key of Object.keys(board)) {
    const m = key.match(/^r(\d+)c(\d+)$/)
    if (m) {
      rows = Math.max(rows, parseInt(m[1]) + 1)
      cols = Math.max(cols, parseInt(m[2]) + 1)
    }
  }
  return { rows, cols }
}

function getCategories(board: BoardMap, cols: number): string[] {
  return Array.from({ length: cols }, (_, col) => board[`r0c${col}`]?.category ?? '')
}

export function BoardView({ room, user, onSelectClue }: Props) {
  const isChooser = user.uid === room.currentChooserId
  const { rows, cols } = getBoardDimensions(room.board)
  const categories = getCategories(room.board, cols)
  const chooser = room.players[room.currentChooserId ?? '']
  const allRevealed = Object.values(room.board).every((q) => q.revealed)

  return (
    <div className="board-panel panel elevated-panel stack">
      {/* Chooser status */}
      <div className="board-topline">
        {isChooser ? (
          <span className="tag chooser-tag">Your turn to pick</span>
        ) : (
          <span className="muted" style={{ fontSize: '0.88rem' }}>
            Waiting for{' '}
            <strong style={{ color: 'var(--text)' }}>{chooser?.name ?? '…'}</strong>
            {' '}to pick
          </span>
        )}
      </div>

      {/* Board grid: header row + tile rows */}
      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {/* Category headers */}
        {categories.map((cat, col) => (
          <div key={`h${col}`} className="board-head">{cat}</div>
        ))}

        {/* Tiles */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const q: BoardQuestion | undefined = room.board[`r${row}c${col}`]
            if (!q) return <div key={`r${row}c${col}`} />
            const canPick = isChooser && !q.revealed
            return (
              <button
                key={`r${row}c${col}`}
                className={`tile${q.revealed ? ' used' : ''}`}
                onClick={() => canPick && onSelectClue(row, col)}
                disabled={!canPick || q.revealed}
              >
                {q.revealed ? '' : `$${q.value}`}
              </button>
            )
          })
        )}
      </div>

      {allRevealed && (
        <p
          className="muted"
          style={{ textAlign: 'center', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          All clues answered
        </p>
      )}
    </div>
  )
}
