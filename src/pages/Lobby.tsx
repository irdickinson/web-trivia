import { GameSetup } from '../components/lobby/GameSetup'
import { PageMeta } from '../components/seo/PageMeta'

export default function Lobby() {
  return (
    <main className="page">
      <PageMeta title="Play" description="Host or join a Web Trivia game room." path="/lobby" />

      <div style={{ maxWidth: '980px', margin: '0 auto' }} className="stack">
        <div>
          <div className="eyebrow">Game lobby</div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '0.01em' }}>
            Play Trivia
          </h1>
        </div>

        <GameSetup />
      </div>
    </main>
  )
}
