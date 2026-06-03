import { useState } from 'react'
import { User } from 'firebase/auth'
import { Room } from '../../types/game'

interface Props {
  room: Room
  user: User
  onSubmitWager: (wager: number) => void
  onSubmitAnswers: (answers: Record<string, string>) => void
  onRevealResults: () => void
  onFinish: () => void
}

// ── Wager phase ──────────────────────────────────────────────────────────────

function WagerPhase({ room, user, onSubmit }: { room: Room; user: User; onSubmit: (w: number) => void }) {
  const myScore = room.players[user.uid]?.score ?? 0
  const maxWager = Math.max(0, myScore)
  const fr = room.finalRound!
  const myEntry = fr.playerEntries[user.uid]
  const hasWagered = myEntry?.wager != null

  const [wager, setWager] = useState(0)
  const [submitted, setSubmitted] = useState(hasWagered)

  const waitingCount = Object.keys(room.players).filter(
    (uid) => fr.playerEntries[uid]?.wager === null || fr.playerEntries[uid]?.wager === undefined,
  ).length

  return (
    <div className="stack" style={{ maxWidth: '460px', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow">Final round</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem' }}>Place Your Wager</h2>
        <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
          {fr.questions.length} question{fr.questions.length !== 1 ? 's' : ''} — top scorer doubles their wager
        </p>
      </div>

      <div className="panel elevated-panel stack compact-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span className="muted">Your score</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--gold)' }}>
            ${myScore.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span className="muted">Max wager</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold)' }}>
            ${maxWager.toLocaleString()}
          </span>
        </div>

        {submitted ? (
          <p className="muted" style={{ textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem 0' }}>
            Wager locked: <strong style={{ color: 'var(--text)' }}>${(myEntry?.wager ?? 0).toLocaleString()}</strong>
          </p>
        ) : (
          <>
            <input
              type="range"
              min={0}
              max={maxWager}
              step={100}
              value={wager}
              onChange={(e) => setWager(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <input
                type="number"
                min={0}
                max={maxWager}
                step={100}
                value={wager}
                onChange={(e) => setWager(Math.min(maxWager, Math.max(0, parseInt(e.target.value) || 0)))}
                style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace', fontWeight: 800 }}
              />
              <button
                onClick={() => { setSubmitted(true); onSubmit(wager) }}
                style={{ flex: '0 0 auto' }}
              >
                Lock In
              </button>
            </div>
          </>
        )}
      </div>

      {waitingCount > 0 && (
        <p className="muted" style={{ textAlign: 'center', fontSize: '0.82rem' }}>
          Waiting for {waitingCount} player{waitingCount !== 1 ? 's' : ''} to wager…
        </p>
      )}
    </div>
  )
}

// ── Answer phase (sequential — one question at a time) ───────────────────────

function AnswerPhase({ room, user, onSubmit }: { room: Room; user: User; onSubmit: (a: Record<string, string>) => void }) {
  const fr = room.finalRound!
  const myEntry = fr.playerEntries[user.uid]
  const alreadySubmitted = Object.keys(myEntry?.answers ?? {}).length > 0

  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(fr.questions.map((q) => [q.id, ''])),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const [submitted, setSubmitted] = useState(alreadySubmitted)

  const waitingCount = Object.keys(room.players).filter(
    (uid) => Object.keys(fr.playerEntries[uid]?.answers ?? {}).length === 0,
  ).length

  if (submitted) {
    return (
      <div className="stack" style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">Final round</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.6rem' }}>Answers Submitted</h2>
        </div>
        <div className="panel elevated-panel stack compact-stack">
          {fr.questions.map((q, i) => (
            <div key={q.id} className="final-question stack compact-stack">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="eyebrow" style={{ marginBottom: 0 }}>{q.category}</span>
                <span className="muted" style={{ fontSize: '0.78rem' }}>Q{i + 1} of {fr.questions.length}</span>
              </div>
              <p style={{ fontSize: '0.92rem' }}>{q.clue}</p>
              <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>
                {myEntry?.answers[q.id] ?? answers[q.id] ?? '—'}
              </p>
            </div>
          ))}
        </div>
        {waitingCount > 0 && (
          <p className="muted" style={{ textAlign: 'center', fontSize: '0.82rem' }}>
            Waiting for {waitingCount} more player{waitingCount !== 1 ? 's' : ''}…
          </p>
        )}
      </div>
    )
  }

  if (reviewing) {
    return (
      <div className="stack" style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">Final round — review</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.6rem' }}>Review Your Answers</h2>
          <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
            Wager: <strong style={{ color: 'var(--gold)' }}>${(myEntry?.wager ?? 0).toLocaleString()}</strong>
          </p>
        </div>
        <div className="stack compact-stack">
          {fr.questions.map((q, i) => (
            <div key={q.id} className="final-question stack compact-stack">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="eyebrow" style={{ marginBottom: 0 }}>{q.category}</span>
                <span className="muted" style={{ fontSize: '0.78rem' }}>Q{i + 1} of {fr.questions.length}</span>
              </div>
              <p style={{ fontSize: '0.88rem' }}>{q.clue}</p>
              <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>{answers[q.id] || '—'}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            className="secondary btn-lg"
            style={{ flex: 1 }}
            onClick={() => setReviewing(false)}
          >
            ← Edit
          </button>
          <button
            className="btn-lg"
            style={{ flex: 1 }}
            onClick={() => { setSubmitted(true); onSubmit(answers) }}
          >
            Submit Answers
          </button>
        </div>
      </div>
    )
  }

  const q = fr.questions[currentIndex]
  const isLast = currentIndex === fr.questions.length - 1
  const canAdvance = !!answers[q.id]?.trim()

  return (
    <div className="stack" style={{ maxWidth: '560px', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow">Final round — question {currentIndex + 1} of {fr.questions.length}</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem' }}>Answer the Clue</h2>
        <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
          Wager: <strong style={{ color: 'var(--gold)' }}>${(myEntry?.wager ?? 0).toLocaleString()}</strong>
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
        {fr.questions.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === currentIndex
                ? 'var(--gold)'
                : answers[fr.questions[i].id]?.trim()
                  ? 'var(--teal)'
                  : 'rgba(255,255,255,0.15)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      <div className="final-question stack compact-stack">
        <span className="eyebrow" style={{ marginBottom: 0 }}>{q.category}</span>
        <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>{q.clue}</p>
        <input
          key={q.id}
          value={answers[q.id] ?? ''}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter' && canAdvance) isLast ? setReviewing(true) : setCurrentIndex(i => i + 1) }}
          placeholder="Your answer…"
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', gap: '0.65rem' }}>
        {currentIndex > 0 && (
          <button className="secondary btn-lg" style={{ flex: '0 0 auto' }} onClick={() => setCurrentIndex(i => i - 1)}>
            ←
          </button>
        )}
        <button
          className="btn-lg"
          style={{ flex: 1 }}
          disabled={!canAdvance}
          onClick={() => isLast ? setReviewing(true) : setCurrentIndex(i => i + 1)}
        >
          {isLast ? 'Review →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── Results phase ─────────────────────────────────────────────────────────────

function ResultsPhase({
  room,
  user,
  isHost,
  onReveal,
  onFinish,
}: {
  room: Room
  user: User
  isHost: boolean
  onReveal: () => void
  onFinish: () => void
}) {
  const fr = room.finalRound!
  const sorted = Object.values(room.players).sort((a, b) => b.score - a.score)

  return (
    <div className="stack" style={{ maxWidth: '600px', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow">Final round</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem' }}>Results</h2>
      </div>

      {/* Questions + submitted answers */}
      <div className="final-grid">
        {fr.questions.map((q, i) => (
          <div key={q.id} className="final-question stack compact-stack">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>{q.category}</span>
              <span className="muted" style={{ fontSize: '0.78rem' }}>Q{i + 1}</span>
            </div>
            <p style={{ fontSize: '0.88rem' }}>{q.clue}</p>
            <p style={{ color: 'var(--success)', fontSize: '0.82rem', fontWeight: 700 }}>
              {q.acceptedAnswers[0]}
            </p>
            <div className="stack compact-stack" style={{ borderTop: '1px solid var(--line)', paddingTop: '0.5rem' }}>
              {Object.entries(fr.playerEntries).map(([uid, entry]) => {
                const player = room.players[uid]
                return (
                  <div
                    key={uid}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      color: uid === user.uid ? 'var(--gold)' : 'var(--muted)',
                    }}
                  >
                    <span style={{ fontWeight: 600, minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {player?.name ?? uid}
                    </span>
                    <span>{entry.answers[q.id] ?? '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Final scores */}
      <div className="panel elevated-panel stack compact-stack">
        <div className="eyebrow" style={{ marginBottom: '0.4rem' }}>Final Scores</div>
        {sorted.map((p, i) => {
          const entry = fr.playerEntries[p.uid]
          return (
            <div
              key={p.uid}
              className={`player-row scoreboard-row${p.uid === user.uid ? ' me' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
            >
              <span className="rank-pill" style={{ minWidth: '1.8rem', textAlign: 'center' }}>{i + 1}</span>
              <span style={{ flex: 1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              {entry?.earnedWager && entry.wager ? (
                <span className="tag chooser-tag" style={{ fontSize: '0.72rem' }}>+${(entry.wager ?? 0).toLocaleString()}</span>
              ) : entry && !entry.earnedWager && entry.wager ? (
                <span className="tag" style={{ fontSize: '0.72rem', borderColor: 'rgba(255,127,127,0.3)', color: 'var(--danger)' }}>−${(entry.wager ?? 0).toLocaleString()}</span>
              ) : null}
              <span
                className="score-value"
                style={p.score < 0 ? { color: 'var(--danger)' } : undefined}
              >
                ${p.score.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>

      {isHost ? (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary btn-lg" style={{ flex: 1 }} onClick={onReveal}>
            Reveal Answers
          </button>
          <button className="btn-lg" style={{ flex: 1 }} onClick={onFinish}>
            Finish Game
          </button>
        </div>
      ) : (
        <p className="muted" style={{ textAlign: 'center', fontSize: '0.88rem' }}>
          Waiting for host to finish…
        </p>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function FinalRound({ room, user, onSubmitWager, onSubmitAnswers, onRevealResults, onFinish }: Props) {
  const isHost = user.uid === room.hostId
  const fr = room.finalRound
  if (!fr) return null

  return (
    <div
      className="panel elevated-panel final-stage-card stack"
      style={{ alignItems: 'center', padding: '2rem 1.5rem', overflowY: 'auto' }}
    >
      {fr.status === 'wager' && (
        <WagerPhase room={room} user={user} onSubmit={onSubmitWager} />
      )}
      {fr.status === 'answer' && (
        <AnswerPhase room={room} user={user} onSubmit={onSubmitAnswers} />
      )}
      {fr.status === 'results' && (
        <ResultsPhase room={room} user={user} isHost={isHost} onReveal={onRevealResults} onFinish={onFinish} />
      )}
    </div>
  )
}
