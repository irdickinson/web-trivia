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
  const allRevealed = Object.values(room.board).every((q) => q.revealed)

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Board */}
      <div className="flex-1 p-3 md:p-4 flex flex-col">
        {/* Chooser banner */}
        <div className="mb-3 text-center">
          {isChooser ? (
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold uppercase tracking-widest">
              Your turn to pick
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-500 text-xs">
              Waiting for{' '}
              <span className="text-gray-300 font-medium">
                {room.players[room.currentChooserId ?? '']?.name ?? '…'}
              </span>{' '}
              to pick
            </span>
          )}
        </div>

        {/* Category headers */}
        <div
          className="grid gap-1.5 mb-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {categories.map((cat, col) => (
            <div
              key={col}
              className="bg-blue-950 border border-blue-900 rounded-lg px-1 py-3 text-center"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 leading-tight break-words">
                {cat}
              </span>
            </div>
          ))}
        </div>

        {/* Question tiles */}
        <div className="flex flex-col gap-1.5 flex-1">
          {Array.from({ length: rows }, (_, row) => (
            <div
              key={row}
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cols }, (_, col) => {
                const q: BoardQuestion | undefined = room.board[`r${row}c${col}`]
                if (!q) return <div key={col} className="h-14 md:h-16" />

                const canPick = isChooser && !q.revealed
                const isUsed = q.revealed

                return (
                  <button
                    key={col}
                    onClick={() => canPick && onSelectClue(row, col)}
                    disabled={!canPick}
                    className={`
                      h-14 md:h-16 rounded-lg font-black text-xl md:text-2xl tabular-nums
                      transition-all duration-100 border-2 select-none
                      ${isUsed
                        ? 'bg-gray-900/30 border-gray-800/30 opacity-30 cursor-default'
                        : canPick
                          ? 'bg-blue-800 border-blue-600 text-yellow-400 hover:bg-blue-700 hover:border-blue-500 hover:scale-105 cursor-pointer shadow-lg shadow-blue-900/40 active:scale-95'
                          : 'bg-blue-900/70 border-blue-800/50 text-yellow-600/70 cursor-default'
                      }
                    `}
                  >
                    {isUsed ? '' : `$${q.value}`}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {allRevealed && (
          <p className="text-center text-gray-600 mt-4 text-xs uppercase tracking-widest">
            All clues answered
          </p>
        )}
      </div>

      {/* Right panel: scores + activity */}
      <div className="w-56 shrink-0 border-l border-gray-800 flex flex-col overflow-hidden">
        {/* Scores */}
        <div className="p-3 border-b border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Scores</p>
          <div className="flex flex-col gap-1">
            {Object.values(room.players)
              .sort((a, b) => b.score - a.score)
              .map((p, i) => {
                const isMe = p.uid === user.uid
                const isCurrentChooser = p.uid === room.currentChooserId
                return (
                  <div
                    key={p.uid}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${
                      isMe ? 'bg-blue-900/30 border border-blue-800/40' : 'bg-gray-800/60'
                    }`}
                  >
                    <span className="text-[10px] text-gray-600 w-3 shrink-0 font-mono">{i + 1}</span>
                    <span className="flex-1 truncate text-gray-300">{p.name}</span>
                    <div className="flex items-center gap-1">
                      {p.isHost && (
                        <span className="text-[9px] bg-gray-700 text-gray-400 px-1 rounded font-bold uppercase">H</span>
                      )}
                      {isCurrentChooser && (
                        <span className="text-[9px] bg-yellow-900/60 text-yellow-400 px-1 rounded font-bold uppercase">C</span>
                      )}
                      <span className={`font-mono font-bold tabular-nums ${p.score < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                        ${p.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Activity log */}
        <div className="flex-1 p-3 overflow-y-auto min-h-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Activity</p>
          <div className="flex flex-col gap-1">
            {[...room.messages].reverse().slice(0, 12).map((msg) => (
              <p
                key={msg.id}
                className={`text-[11px] leading-snug ${
                  msg.type === 'override'
                    ? 'text-yellow-500'
                    : msg.type === 'warning'
                      ? 'text-red-400'
                      : 'text-gray-500'
                }`}
              >
                {msg.text}
              </p>
            ))}
            {room.messages.length === 0 && (
              <p className="text-[11px] text-gray-700">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
