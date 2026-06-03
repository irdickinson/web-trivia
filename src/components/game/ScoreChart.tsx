import { Player } from '../../types/game'

interface Props {
  players: Record<string, Player>
  currentUid: string
  // Optional in-game highlights — omitted on the finished screen.
  answeringId?: string | null
  chooserId?: string | null
}

const TAG_STYLE = { fontSize: '0.62rem', padding: '1px 5px' }

// The animated score bars. Rendered on its own so the finished screen can
// embed the same bars inside its existing card without nesting panels.
export function ScoreChartRows({ players, currentUid, answeringId, chooserId }: Props) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score)
  const maxScore = Math.max(1, ...sorted.map((p) => p.score).filter((s) => s > 0))

  return (
    <>
      {sorted.map((p, i) => {
        const isMe = p.uid === currentUid
        const isChooser = chooserId != null && p.uid === chooserId
        const isAnswering = answeringId != null && p.uid === answeringId
        const pct = p.score > 0 ? Math.max(2, (p.score / maxScore) * 100) : 0
        return (
          <div key={p.uid} className={`chart-row${isAnswering ? ' active' : ''}`}>
            <span className="rank-pill chart-rank">{i + 1}</span>
            <div className="chart-name-block">
              <span className={`chart-name${isMe ? ' me' : ''}`}>{p.name}</span>
              <div className="player-meta" style={{ marginTop: '0.1rem' }}>
                {p.isHost && <span className="tag" style={TAG_STYLE}>Host</span>}
                {isChooser && <span className="tag chooser-tag" style={TAG_STYLE}>Chooser</span>}
                {isAnswering && <span className="tag answer-tag" style={TAG_STYLE}>Answering</span>}
              </div>
            </div>
            <div className="chart-col">
              <div className="chart-track">
                <div className={`chart-bar${isMe ? ' me' : ''}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`chart-value${p.score < 0 ? ' negative' : ''}`}>
                ${p.score.toLocaleString()}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}

// Panelled version used in the in-game info rail.
export function ScoreChart(props: Props) {
  return (
    <div className="panel elevated-panel stack score-chart">
      <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>Scores</div>
      <ScoreChartRows {...props} />
    </div>
  )
}
