import { Link } from 'react-router-dom'
import { PageMeta } from '../components/seo/PageMeta'

const MODES = [
  {
    name: 'Jeopardy',
    desc: 'The host reveals a clue and everyone races to buzz in. The first to buzz answers solo — get it right to claim the points, get it wrong and (if rebound is on) the rest of the table can buzz for the steal.',
  },
  {
    name: 'Classic',
    desc: 'Everyone types an answer at the same time. Every correct answer scores, so there are no buzzer wars — just knowledge and a steady keyboard.',
  },
  {
    name: 'Multiple Choice',
    desc: 'Four options, everyone picks at once. Great for casual rooms and players who prefer recognition over recall.',
  },
  {
    name: 'Speed',
    desc: 'First correct answer takes the clue and the game moves straight on. Fast, loud, and a little chaotic.',
  },
]

const STEPS = [
  { n: 1, t: 'Host a room', d: 'Pick a mode, board size, timers, and scoring rules, then create a room to get a six-character code.' },
  { n: 2, t: 'Share the code', d: 'Friends join from the lobby with the code. No download or account required — guests can jump straight in.' },
  { n: 3, t: 'Work the board', d: 'The chooser picks a category and value. Clues reveal progressively; answer before the timer runs out.' },
  { n: 4, t: 'Final round', d: 'If enabled, everyone secretly wagers part of their score on one last high-stakes question to close the game.' },
]

export default function HowToPlay() {
  return (
    <main className="page">
      <PageMeta
        title="How to Play"
        description="Learn how Web Trivia works: game modes, buzzing, scoring, timers, and the final round."
        path="/how-to-play"
      />

      <div className="narrow-page stack" style={{ gap: '2rem' }}>
        <div>
          <div className="eyebrow">Getting started</div>
          <h1 className="page-title">How to Play</h1>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Web Trivia is a real-time multiplayer quiz you play with friends in the same room or across the world.
          </p>
        </div>

        <section className="stack">
          <h2 className="section-heading">The basics</h2>
          <div className="howto-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="panel elevated-panel howto-step">
                <span className="howto-step-num">{s.n}</span>
                <div>
                  <h3 className="howto-step-title">{s.t}</h3>
                  <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="stack">
          <h2 className="section-heading">Game modes</h2>
          <div className="howto-modes">
            {MODES.map((m) => (
              <div key={m.name} className="panel elevated-panel howto-mode">
                <h3 className="howto-mode-title">{m.name}</h3>
                <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stack">
          <h2 className="section-heading">Scoring</h2>
          <div className="panel elevated-panel stack compact-stack">
            <p className="muted" style={{ lineHeight: 1.6 }}>
              Each clue is worth its point value. Hosts decide whether a wrong answer deducts points,
              whether scores can go negative, and how forgiving the answer matching is — typo tolerance
              accepts near-misses, and variant matching accepts common alternate spellings. The host can
              also adjust any score by hand if a judgement call is needed.
            </p>
          </div>
        </section>

        <div className="howto-cta">
          <Link to="/lobby" className="howto-cta-link">Ready? Start a game →</Link>
        </div>
      </div>
    </main>
  )
}
