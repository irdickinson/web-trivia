import { GameMode, GameSettings } from '../../types/game'
import { packSummaries } from '../../data/packs'
import { randomSeed } from '../../lib/rng'

const PACKS = packSummaries()

export const MODE_ANSWER_DEFAULTS: Record<GameMode, number> = {
  'jeopardy': 15,
  'classic': 15,
  'multiple-choice': 10,
  'speed': 10,
  'rounds': 15,
}

const ANSWER_TIME_OPTIONS = [3, 5, 8, 10, 15, 20, 30, 45, 60]

export const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  'jeopardy': 'Buzz in before anyone else, then answer solo',
  'classic': 'Everyone types simultaneously — all correct answers score',
  'multiple-choice': 'Choose from four options, everyone answers at once',
  'speed': 'First correct answer wins the clue',
  'rounds': 'Fast rounds — everyone answers, results reveal after each round, harder rounds score more',
}

interface Props {
  settings: GameSettings
  onChange: (delta: Partial<GameSettings>) => void
}

// Editable game-settings form: mode, question packs, mode-specific options, and
// the board seed. Shared by the create-room flow (GameSetup) and the waiting room,
// where the host can retune the game without disbanding the lobby.
export function SettingsForm({ settings, onChange }: Props) {
  const isRounds = settings.mode === 'rounds'

  function handleModeChange(mode: GameMode) {
    onChange({ mode, answerTimeSeconds: MODE_ANSWER_DEFAULTS[mode] })
  }

  function togglePack(id: string) {
    const has = settings.questionSetIds.includes(id)
    // Keep at least one pack selected.
    if (has && settings.questionSetIds.length === 1) return
    const questionSetIds = has
      ? settings.questionSetIds.filter((p) => p !== id)
      : [...settings.questionSetIds, id]
    onChange({ questionSetIds })
  }

  return (
    <>
      {/* Mode selector */}
      <div className="stack" style={{ gap: '0.4rem' }}>
        <span className="eyebrow" style={{ marginBottom: 0 }}>Game mode</span>
        <select
          value={settings.mode}
          onChange={(e) => handleModeChange(e.target.value as GameMode)}
        >
          <option value="classic">Classic</option>
          <option value="jeopardy">Jeopardy</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="speed">Speed</option>
          <option value="rounds">Rounds</option>
        </select>
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          {MODE_DESCRIPTIONS[settings.mode]}
        </p>
      </div>

      {/* Question packs */}
      <div className="stack" style={{ gap: '0.4rem' }}>
        <span className="eyebrow" style={{ marginBottom: 0 }}>Question packs</span>
        <div className="pack-grid">
          {PACKS.map((p) => {
            const selected = settings.questionSetIds.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`pack-card${selected ? ' selected' : ''}`}
                onClick={() => togglePack(p.id)}
                aria-pressed={selected}
              >
                <span className="pack-check" aria-hidden>{selected ? '✓' : ''}</span>
                <span className="pack-body">
                  <span className="pack-name">{p.name}</span>
                  {p.description && <span className="pack-desc">{p.description}</span>}
                  <span className="pack-meta">{p.categoryCount} categories · {p.questionCount} questions</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="muted" style={{ fontSize: '0.78rem', margin: 0 }}>
          Categories from every selected pack are pooled together when building the game.
        </p>
      </div>

      {isRounds ? (
        /* ── Rounds-mode settings ─────────────────────────────────────── */
        <>
          <div className="settings-grid">
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Categories</span>
              <select
                value={settings.categoryCount}
                onChange={(e) => onChange({ categoryCount: parseInt(e.target.value) })}
              >
                {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Rounds</span>
              <select
                value={settings.roundsCount}
                onChange={(e) => onChange({ roundsCount: parseInt(e.target.value) })}
              >
                {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Questions / round</span>
              <select
                value={settings.questionsPerRound}
                onChange={(e) => onChange({ questionsPerRound: parseInt(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Time / question (s)</span>
              <select
                value={settings.answerTimeSeconds}
                onChange={(e) => onChange({ answerTimeSeconds: parseInt(e.target.value) })}
              >
                {ANSWER_TIME_OPTIONS.map((n) => <option key={n} value={n}>{n}s</option>)}
              </select>
            </label>
          </div>

          <label className="stack" style={{ gap: '0.4rem' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>
              Multiple choice ratio — {Math.round(settings.mcRatio * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={settings.mcRatio}
              onChange={(e) => onChange({ mcRatio: parseFloat(e.target.value) })}
            />
            <p className="muted" style={{ fontSize: '0.78rem', margin: 0 }}>
              Share of questions shown as multiple choice; the rest are typed. Round N pulls
              difficulty-N questions, so later rounds are harder and worth more.
            </p>
          </label>

          <div className="settings-grid checks">
            <Check label="Typo tolerance" checked={settings.typoTolerance} onChange={(v) => onChange({ typoTolerance: v })} />
          </div>
        </>
      ) : (
        /* ── Board-mode settings ──────────────────────────────────────── */
        <>
          <div className="settings-grid">
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Categories</span>
              <select
                value={settings.categoryCount}
                onChange={(e) => onChange({ categoryCount: parseInt(e.target.value) })}
              >
                {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Rows</span>
              <select
                value={settings.questionCountPerCategory}
                onChange={(e) => {
                  const rows = parseInt(e.target.value)
                  onChange({ questionCountPerCategory: rows, pointValues: Array.from({ length: rows }, (_, i) => (i + 1) * 100) })
                }}
              >
                {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Reveal speed (ms)</span>
              <select
                value={settings.revealSpeedMs}
                onChange={(e) => onChange({ revealSpeedMs: parseInt(e.target.value) })}
              >
                <option value={80}>Slow (80)</option>
                <option value={40}>Medium (40)</option>
                <option value={20}>Fast (20)</option>
              </select>
            </label>
            <label>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Answer timer (s)</span>
              <select
                value={settings.answerTimeSeconds}
                onChange={(e) => onChange({ answerTimeSeconds: parseInt(e.target.value) })}
              >
                {ANSWER_TIME_OPTIONS.map((n) => <option key={n} value={n}>{n}s</option>)}
              </select>
            </label>
            {settings.mode === 'jeopardy' && (
              <label>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Buzz window (s)</span>
                <select
                  value={settings.postRevealBuzzSeconds}
                  onChange={(e) => onChange({ postRevealBuzzSeconds: parseInt(e.target.value) })}
                >
                  {[5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}s</option>)}
                </select>
              </label>
            )}
          </div>

          <div className="settings-grid checks">
            <Check label="Deduct on wrong" checked={settings.deductOnWrongAnswer} onChange={(v) => onChange({ deductOnWrongAnswer: v })} />
            <Check label="Allow negative scores" checked={settings.allowNegativeScores} onChange={(v) => onChange({ allowNegativeScores: v })} />
            <Check label="Typo tolerance" checked={settings.typoTolerance} onChange={(v) => onChange({ typoTolerance: v })} />
            {settings.mode === 'jeopardy' && (
              <Check label="Buzz rebound" checked={settings.allowBuzzRebound} onChange={(v) => onChange({ allowBuzzRebound: v })} />
            )}
            <Check label="Progressive reveal" checked={settings.progressiveReveal} onChange={(v) => onChange({ progressiveReveal: v })} />
            <Check label="Enable final round" checked={settings.enableFinalRound} onChange={(v) => onChange({ enableFinalRound: v })} />
          </div>
        </>
      )}

      {/* Board seed — same seed reproduces the same game */}
      <label className="stack" style={{ gap: '0.4rem' }}>
        <span className="eyebrow" style={{ marginBottom: 0 }}>Game seed</span>
        <div className="row gap">
          <input
            value={settings.seed}
            onChange={(e) => onChange({ seed: e.target.value.toUpperCase().slice(0, 16) })}
            placeholder="Random seed"
            style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.12em', fontWeight: 700 }}
          />
          <button
            type="button"
            className="secondary mini-btn"
            onClick={() => onChange({ seed: randomSeed() })}
            title="Randomize seed"
          >
            🎲
          </button>
        </div>
        <p className="muted" style={{ fontSize: '0.78rem', margin: 0 }}>
          Same seed + packs always builds the same game. Change it for a fresh one.
        </p>
      </label>
    </>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check-label soft-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
