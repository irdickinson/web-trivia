import { Room, BoardMap } from '../../types/game'
import { BoardQuestion } from '../../types/question'
import { User } from 'firebase/auth'

interface Props {
  room: Room
  user: User
  onSelectClue: (row: number, col: number) => void
}

function getBoardDimensions(board: BoardMap): { rows: number; cols: number } {
  let rows = 0
  let cols = 0
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
  return Array.from({ length: cols }, (_, col) => {
    const q = board[`r0c${col}`]
    return q?.category ?? ''
  })
}

export function BoardView({ room, user, onSelectClue }: Props) {
  const isChooser = user.uid === room.currentChooserId
  const { rows, cols } = getBoardDimensions(room.board)
  const categories = getCategories(room.board, cols)
  const chooser = room.players[room.currentChooserId ?? '']

  const allRevealed = Object.values(room.board).every((q) => q.revealed)

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <h1 className="text-lg font-bold tracking-tight text-indigo-400">Web Trivia</h1>
        {chooser && (
          <p className="text-sm text-gray-400">
            {isChooser
              ? <span className="text-indigo-300 font-medium">Your turn to pick</span>
              : <span>Waiting for <span className="text-white font-medium">{chooser.name}</span> to pick</span>
            }
          </p>
        )}
      </div>

      <div className="flex flex-1 overflow-auto">
        {/* Board */}
        <div className="flex-1 p-4">
          {/* Category headers */}
          <div
            className="grid gap-2 mb-2"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {categories.map((cat, col) => (
              <div
                key={col}
                className="bg-indigo-900/60 border border-indigo-700/50 rounded-lg px-2 py-3 text-center"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 leading-tight">
                  {cat}
                </span>
              </div>
            ))}
          </div>

          {/* Question tiles */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: rows }, (_, row) => (
              <div
                key={row}
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: cols }, (_, col) => {
                  const q: BoardQuestion | undefined = room.board[`r${row}c${col}`]
                  if (!q) return <div key={col} className="h-16" />

                  const canPick = isChooser && !q.revealed
                  const isAnswered = q.revealed && q.answeredCorrectlyBy
                  const isMissed = q.revealed && !q.answeredCorrectlyBy

                  return (
                    <button
                      key={col}
                      onClick={() => canPick && onSelectClue(row, col)}
                      disabled={!canPick}
                      className={`h-16 rounded-lg font-bold text-lg tabular-nums transition-all duration-150 border ${
                        isAnswered
                          ? 'bg-gray-800/40 border-gray-700/30 text-gray-600 cursor-default'
                          : isMissed
                            ? 'bg-gray-800/40 border-gray-700/30 text-gray-600 cursor-default'
                            : canPick
                              ? 'bg-indigo-700 border-indigo-500 text-yellow-300 hover:bg-indigo-600 hover:scale-105 cursor-pointer shadow-lg shadow-indigo-900/50'
                              : 'bg-indigo-800/60 border-indigo-700/50 text-indigo-300 cursor-default'
                      }`}
                    >
                      {q.revealed ? '' : `$${q.value}`}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {allRevealed && (
            <p className="text-center text-gray-500 mt-6 text-sm">
              All clues answered — waiting for host…
            </p>
          )}
        </div>

        {/* Right panel: scores + log */}
        <div className="w-64 shrink-0 border-l border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Scores */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Scores</p>
            <div className="flex flex-col gap-1">
              {Object.values(room.players)
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <div
                    key={p.uid}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      p.uid === user.uid ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-gray-800'
                    }`}
                  >
                    <span className="w-4 text-gray-500 text-xs">{i + 1}</span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <span
                      className={`font-mono font-semibold tabular-nums text-xs ${
                        p.score < 0 ? 'text-red-400' : 'text-indigo-300'
                      }`}
                    >
                      ${p.score.toLocaleString()}
                    </span>
                    {p.uid === room.currentChooserId && (
                      <span className="text-xs text-yellow-400" title="Current chooser">★</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Activity log */}
          <div className="flex-1 min-h-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Activity</p>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-64">
              {[...room.messages].reverse().slice(0, 20).map((msg) => (
                <p
                  key={msg.id}
                  className={`text-xs leading-snug ${
                    msg.type === 'override'
                      ? 'text-yellow-400'
                      : msg.type === 'warning'
                        ? 'text-red-400'
                        : 'text-gray-500'
                  }`}
                >
                  {msg.text}
                </p>
              ))}
              {room.messages.length === 0 && (
                <p className="text-xs text-gray-600">No activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
