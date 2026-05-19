import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, type BoardQuestion, type LobbyState, type SystemMessage } from '@jeopardy/shared';
import { useGameSocket } from './useGameSocket';

type ResultFlash = 'correct' | 'incorrect' | 'timeout' | null;
type OutcomeCard =
  | {
      kind: 'correct' | 'incorrect' | 'timeout';
      playerName?: string;
      category: string;
      value: number;
      correctAnswers: string[];
      submittedAnswers: Array<{ playerName: string; answer: string }>;
      scoreChanges: Array<{ playerName: string; delta: number }>;
    }
  | null;

type TrackDef = { name: string; bpm: number; steps: number; kick: number[]; hat: number[]; bass: Array<[number, number]> };

const TRACKS: TrackDef[] = [
  { name: 'Midnight Board', bpm: 94, steps: 8, kick: [0, 4], hat: [0, 2, 4, 6], bass: [[0, 174], [2, 220], [4, 196], [6, 146]] },
  { name: 'Velvet Clue', bpm: 102, steps: 8, kick: [0, 3, 4, 7], hat: [0, 2, 4, 6], bass: [[0, 164], [2, 164], [4, 196], [6, 246]] },
  { name: 'Final Round', bpm: 88, steps: 8, kick: [0, 4], hat: [1, 3, 5, 7], bass: [[0, 146], [2, 174], [4, 130], [6, 196]] },
];

function App() {
  const { playerId, lobby, packs, error, send } = useGameSocket();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [wager, setWager] = useState('0');
  const [finalAnswers, setFinalAnswers] = useState<Record<string, string>>({});
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [resultFlash, setResultFlash] = useState<ResultFlash>(null);
  const [showLog, setShowLog] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [scoreDelta, setScoreDelta] = useState<Record<string, string>>({});
  const [musicTrackIndex, setMusicTrackIndex] = useState(0);
  const [musicPaused, setMusicPaused] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.22);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(0.72);
  const [outcomeCard, setOutcomeCard] = useState<OutcomeCard>(null);

  const lastMessageIdRef = useRef<string | null>(null);
  const prevActiveAnswerRef = useRef<string | undefined>(undefined);
  const prevSecondRef = useRef<number | null>(null);
  const prevScoresRef = useRef<Record<string, number>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicIntervalRef = useRef<number | null>(null);
  const musicStepRef = useRef(0);

  const me = useMemo(() => lobby?.players.find((player) => player.id === playerId), [lobby, playerId]);
  const isHost = lobby?.hostId === playerId;
  const sortedPlayers = useMemo(
    () => [...(lobby?.players ?? [])].sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt),
    [lobby?.players],
  );

  useEffect(() => {
    if (!lobby?.clueState) return;
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [lobby?.clueState?.questionId, lobby?.clueState?.status]);

  useEffect(() => {
    if (!lobby?.players) return;
    const nextScores: Record<string, number> = {};
    for (const player of lobby.players) nextScores[player.id] = player.score;
    prevScoresRef.current = nextScores;
  }, [lobby?.code]);

  useEffect(() => {
    if (!lobby?.messages.length) return;
    const latest = lobby.messages[0];
    if (latest.id === lastMessageIdRef.current) return;

    const previousScores = { ...prevScoresRef.current };
    const text = latest.text.toLowerCase();
    const scoreChanges =
      lobby.players
        .map((player) => ({ playerName: player.name, delta: player.score - (previousScores[player.id] ?? player.score) }))
        .filter((entry) => entry.delta !== 0);
    const submittedAnswers =
      lobby.clueState
        ? Object.entries(lobby.clueState.submittedAnswers)
            .filter(([, value]) => value.trim())
            .map(([pid, value]) => ({
              playerName: lobby.players.find((player) => player.id === pid)?.name ?? 'Player',
              answer: value,
            }))
        : [];

    if (text.includes('answered correctly')) {
      setResultFlash('correct');
      setOutcomeCard({
        kind: 'correct',
        playerName: latest.text.split(' answered correctly')[0],
        category: lobby.clueState?.category ?? '',
        value: lobby.clueState?.value ?? 0,
        correctAnswers: lobby.clueState?.correctAnswers ?? [],
        submittedAnswers,
        scoreChanges,
      });
      playToneSequence('correct', audioCtxRef, sfxEnabled, sfxVolume);
      clearFlashAfterDelay(setResultFlash, 2200);
    } else if (text.includes('answered incorrectly')) {
      setResultFlash('incorrect');
      setOutcomeCard({
        kind: 'incorrect',
        playerName: latest.text.split(' answered incorrectly')[0],
        category: lobby.clueState?.category ?? '',
        value: lobby.clueState?.value ?? 0,
        correctAnswers: lobby.clueState?.correctAnswers ?? [],
        submittedAnswers,
        scoreChanges,
      });
      playToneSequence('incorrect', audioCtxRef, sfxEnabled, sfxVolume);
      clearFlashAfterDelay(setResultFlash, 1800);
    } else if (text.includes('no one answered correctly')) {
      setResultFlash('timeout');
      setOutcomeCard({
        kind: 'timeout',
        category: lobby.clueState?.category ?? '',
        value: lobby.clueState?.value ?? 0,
        correctAnswers: lobby.clueState?.correctAnswers ?? [],
        submittedAnswers,
        scoreChanges,
      });
      playToneSequence('timeout', audioCtxRef, sfxEnabled, sfxVolume);
      clearFlashAfterDelay(setResultFlash, 2000);
    } else if (text.includes('adjusted')) {
      playToneSequence('adjust', audioCtxRef, sfxEnabled, sfxVolume);
    }

    window.setTimeout(() => setOutcomeCard(null), 2600);
    lastMessageIdRef.current = latest.id;
    const nextScores: Record<string, number> = {};
    for (const player of lobby.players) nextScores[player.id] = player.score;
    prevScoresRef.current = nextScores;
  }, [lobby?.messages, lobby?.players, lobby?.clueState, sfxEnabled, sfxVolume]);

  useEffect(() => {
    const activeId = lobby?.clueState?.activeAnswerPlayerId;
    if (activeId && prevActiveAnswerRef.current !== activeId) {
      playToneSequence('buzz', audioCtxRef, sfxEnabled, sfxVolume);
    }
    prevActiveAnswerRef.current = activeId;
  }, [lobby?.clueState?.activeAnswerPlayerId, sfxEnabled, sfxVolume]);

  useEffect(() => {
    const clue = lobby?.clueState;
    if (!clue?.answerWindowEndsAt || clue.status !== 'paused-for-answer') {
      prevSecondRef.current = null;
      return;
    }
    const secondsLeft = Math.max(0, Math.ceil((clue.answerWindowEndsAt - now) / 1000));
    if (secondsLeft <= 5 && prevSecondRef.current !== secondsLeft) {
      prevSecondRef.current = secondsLeft;
      playToneSequence('tick', audioCtxRef, sfxEnabled, sfxVolume);
    }
  }, [lobby?.clueState, now, sfxEnabled, sfxVolume]);

  useEffect(() => {
    if (musicPaused) {
      stopMusicLoop(musicIntervalRef);
      return;
    }
    const track = TRACKS[musicTrackIndex % TRACKS.length];
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    const stepMs = (60_000 / track.bpm) / 2;
    musicStepRef.current = 0;
    const tick = () => {
      const step = musicStepRef.current % track.steps;
      playMusicStep(audioCtxRef.current!, track, step, musicVolume);
      musicStepRef.current += 1;
    };
    tick();
    musicIntervalRef.current = window.setInterval(tick, stepMs);
    return () => stopMusicLoop(musicIntervalRef);
  }, [musicPaused, musicTrackIndex, musicVolume]);

  if (!lobby) {
    return (
      <div className="page center auth-shell">
        <div className="panel auth-panel elevated-panel">
          <div className="eyebrow">Game show lobby</div>
          <h1 className="auth-title">Jeopardy Online</h1>
          <div className="stack compact-stack auth-actions">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <button onClick={() => send({ type: 'createLobby', payload: { name } })} disabled={!name.trim() || !playerId}>
              Host lobby
            </button>
            <div className="divider" />
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Lobby code" />
            <button onClick={() => send({ type: 'joinLobby', payload: { code, name } })} disabled={!name.trim() || !code.trim() || !playerId}>
              Join lobby
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  const currentChooserName = lobby.players.find((player) => player.id === lobby.currentChooserId)?.name ?? '—';
  const activeAnswerPlayer = lobby.clueState?.activeAnswerPlayerId
    ? lobby.players.find((p) => p.id === lobby.clueState?.activeAnswerPlayerId)
    : null;

  return (
    <div className={`page game-page ${resultFlash ? `flash-${resultFlash}` : ''}`}>
      <header className="topbar showbar panel elevated-panel">
        <div className="brand-block">
          <div className="eyebrow">Share this code</div>
          <div className="lobby-code-display">{lobby.code}</div>
          <p className="muted subline">
            {lobby.phase === 'lobby' ? 'Tune the rules, then start the board.' : `Phase: ${formatPhase(lobby.phase)}`}
          </p>
        </div>
        <div className="topbar-actions controls-packed">
          <div className="music-control panellet">
            <span className="chip-label">Music</span>
            <div className="music-row">
              <button className="ghost mini-btn" onClick={() => setMusicTrackIndex((current) => (current - 1 + TRACKS.length) % TRACKS.length)}>◀</button>
              <button className="ghost mini-btn" onClick={() => setMusicPaused((current) => !current)}>{musicPaused ? '▶' : '❚❚'}</button>
              <button className="ghost mini-btn" onClick={() => setMusicTrackIndex((current) => (current + 1) % TRACKS.length)}>▶▶</button>
            </div>
            <div className="mini-track-name">{TRACKS[musicTrackIndex].name}</div>
            <input type="range" min={0} max={100} value={Math.round(musicVolume * 100)} onChange={(e) => setMusicVolume(Number(e.target.value) / 100)} />
          </div>
          <div className="music-control panellet">
            <span className="chip-label">Sound FX</span>
            <button className="ghost mini-btn" onClick={() => setSfxEnabled((current) => !current)}>{sfxEnabled ? 'On' : 'Off'}</button>
            <input type="range" min={0} max={100} value={Math.round(sfxVolume * 100)} onChange={(e) => setSfxVolume(Number(e.target.value) / 100)} disabled={!sfxEnabled} />
          </div>
          <div className="hero-chip primary-chip">
            <span className="chip-label">You</span>
            <strong>{me?.name}</strong>
            <span>{me?.score ?? 0} pts</span>
          </div>
          <div className="hero-chip">
            <span className="chip-label">Chooser</span>
            <strong>{currentChooserName}</strong>
          </div>
          {activeAnswerPlayer && (
            <div className="hero-chip answering-chip">
              <span className="chip-label">Answering</span>
              <strong>{activeAnswerPlayer.name}</strong>
              <span>{lobby.clueState?.value} pts</span>
            </div>
          )}
          {isHost && (
            <button className="secondary" onClick={() => setShowEndConfirm(true)}>
              Back to lobby
            </button>
          )}
        </div>
      </header>

      <main className="show-layout">
        <section className="main-stage">
          {lobby.phase === 'lobby' && (
            <LobbyView
              lobby={lobby}
              packs={packs}
              isHost={Boolean(isHost)}
              onPatch={(settings, selectedPackIds) => send({ type: 'updateSettings', payload: { settings, selectedPackIds } })}
              onStart={() => send({ type: 'startGame', payload: { code: lobby.code } })}
            />
          )}

          {(lobby.phase === 'board' || lobby.phase === 'clue') && (
            <>
              <BoardView
                lobby={lobby}
                playerId={playerId}
                onSelect={(row, col) => send({ type: 'selectQuestion', payload: { code: lobby.code, row, col } })}
              />
              {lobby.phase === 'clue' && lobby.clueState && (
                <ClueView
                  lobby={lobby}
                  playerId={playerId}
                  answer={answer}
                  setAnswer={setAnswer}
                  now={now}
                  onBuzz={() => send({ type: 'buzz', payload: { code: lobby.code } })}
                  onSubmitAnswer={() => {
                    send({ type: 'submitAnswer', payload: { code: lobby.code, answer } });
                    setAnswer('');
                  }}
                />
              )}
            </>
          )}

          {lobby.phase === 'final-wager' && (
            <section className="panel elevated-panel stack final-stage-card">
              <div className="eyebrow">Final round</div>
              <h2>Lock your wager</h2>
              <p className="muted">Wager up to your current score. Highest correct total doubles the risked amount.</p>
              <input value={wager} onChange={(e) => setWager(e.target.value)} type="number" min={0} />
              <button onClick={() => send({ type: 'submitFinalWager', payload: { code: lobby.code, wager: Number(wager) } })}>
                Lock wager
              </button>
            </section>
          )}

          {(lobby.phase === 'final-answer' || lobby.phase === 'final-results') && lobby.finalRound && (
            <section className="panel elevated-panel stack final-stage-card">
              <div className="eyebrow">Final round</div>
              <h2>Three categories. Best result wins.</h2>
              <div className="final-grid">
                {lobby.finalRound.questions.map((question) => (
                  <div key={question.id} className="final-question stack">
                    <strong>{question.category}</strong>
                    <div>{question.clue}</div>
                    {lobby.phase === 'final-answer' ? (
                      <input
                        value={finalAnswers[question.id] ?? ''}
                        onChange={(e) => setFinalAnswers((current) => ({ ...current, [question.id]: e.target.value }))}
                        placeholder="Your answer"
                      />
                    ) : (
                      <div className="muted">Accepted: {question.acceptedAnswers.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
              {lobby.phase === 'final-answer' ? (
                <button onClick={() => send({ type: 'submitFinalAnswers', payload: { code: lobby.code, answers: finalAnswers } })}>
                  Submit final answers
                </button>
              ) : (
                <div className="stack compact-stack">
                  {sortedPlayers.map((player) => {
                    const entry = lobby.finalRound?.playerEntries[player.id];
                    return (
                      <div key={player.id} className="player-row scoreboard-row">
                        <strong>{player.name}</strong>
                        <span>
                          correct: {entry?.correctCount ?? 0} · {entry?.doubled ? 'doubled wager' : 'no payout'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </section>

        <aside className="info-rail">
          <section className="panel elevated-panel rail-section status-card">
            <div className="rail-header">
              <div>
                <div className="eyebrow">Standings</div>
                <h2>Players & scores</h2>
              </div>
              <div className="mini-badge">Max 6</div>
            </div>
            <div className="stack compact-stack scoreboard-list">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-row scoreboard-row ${player.id === lobby.currentChooserId ? 'active' : ''} ${player.id === playerId ? 'me' : ''}`}
                >
                  <div className="player-name-block">
                    <span className="rank-pill">#{index + 1}</span>
                    <div>
                      <strong>{player.name}</strong>
                      <div className="player-meta">
                        {player.id === lobby.hostId ? <span className="tag">Host</span> : null}
                        {player.id === lobby.currentChooserId ? <span className="tag chooser-tag">Chooser</span> : null}
                        {lobby.clueState?.activeAnswerPlayerId === player.id ? <span className="tag answer-tag">Answering</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="score-actions">
                    <span className="score-value">{player.score}</span>
                    {isHost && (
                      <div className="host-adjust-controls">
                        <input
                          type="number"
                          value={scoreDelta[player.id] ?? ''}
                          onChange={(e) => setScoreDelta((current) => ({ ...current, [player.id]: e.target.value }))}
                          placeholder="100"
                        />
                        <button
                          className="ghost mini-btn"
                          onClick={() => applyScoreDelta(send, lobby.code, player.id, Number(scoreDelta[player.id] || 0), setScoreDelta)}
                          disabled={!Number(scoreDelta[player.id] || 0)}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel elevated-panel rail-section spotlight-card">
            <div className="eyebrow">Live status</div>
            <h2>{activeAnswerPlayer ? 'Current answerer' : 'Floor status'}</h2>
            <div className="answerer-card subdued status-tile">
              {activeAnswerPlayer ? (
                <>
                  <strong>{activeAnswerPlayer.name}</strong>
                  <span>{lobby.clueState?.category} · {lobby.clueState?.value} pts</span>
                </>
              ) : (
                <>
                  <strong>{headlineFromLobby(lobby)}</strong>
                  <span>Next chooser: {currentChooserName}</span>
                </>
              )}
            </div>
            <button className="ghost" onClick={() => setShowLog((current) => !current)}>
              {showLog ? 'Hide activity log' : 'Show activity log'}
            </button>
            {showLog && <LogList messages={lobby.messages} />}
          </section>
        </aside>
      </main>

      {lobby.phase === 'clue' && outcomeCard && (
        <OutcomeOverlay outcome={outcomeCard} currentChooserName={currentChooserName} />
      )}

      {showEndConfirm && isHost && (
        <div className="review-modal">
          <div className="panel stack review-card elevated-panel">
            <div className="eyebrow">Warning</div>
            <h2>Return to lobby?</h2>
            <p className="muted">This ends the current game for everyone and sends all players back to the lobby.</p>
            <div className="row gap wrap">
              <button onClick={() => { send({ type: 'returnToLobby', payload: { code: lobby.code } }); setShowEndConfirm(false); }}>
                Confirm
              </button>
              <button className="secondary" onClick={() => setShowEndConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OutcomeOverlay({ outcome, currentChooserName }: { outcome: NonNullable<OutcomeCard>; currentChooserName: string }) {
  return (
    <div className={`result-overlay ${outcome.kind}`}>
      <div className="panel elevated-panel result-card">
        <div className="eyebrow">{outcome.category} · {outcome.value} pts</div>
        <h2>
          {outcome.kind === 'correct' && `${outcome.playerName} is correct`}
          {outcome.kind === 'incorrect' && `${outcome.playerName} is incorrect`}
          {outcome.kind === 'timeout' && 'No correct answer'}
        </h2>
        {outcome.correctAnswers.length > 0 && <p className="muted">Accepted answer: {outcome.correctAnswers.join(', ')}</p>}
        {outcome.submittedAnswers.length > 0 && (
          <div className="stack compact-stack">
            <strong>Submitted answers</strong>
            <div className="submitted-grid">
              {outcome.submittedAnswers.map((entry, index) => (
                <div key={`${entry.playerName}-${index}`} className="submitted-pill">
                  <span>{entry.playerName}</span>
                  <strong>{entry.answer}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
        {outcome.scoreChanges.length > 0 && (
          <div className="stack compact-stack">
            <strong>Score changes</strong>
            <div className="submitted-grid">
              {outcome.scoreChanges.map((entry) => (
                <div key={entry.playerName} className={`submitted-pill ${entry.delta > 0 ? 'up' : 'down'}`}>
                  <span>{entry.playerName}</span>
                  <strong>{entry.delta > 0 ? `+${entry.delta}` : entry.delta}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="muted next-picker-copy">Next chooser: {currentChooserName}</div>
      </div>
    </div>
  );
}

function LobbyView({
  lobby,
  packs,
  isHost,
  onPatch,
  onStart,
}: {
  lobby: LobbyState;
  packs: { id: string; name: string; questionCount: number }[];
  isHost: boolean;
  onPatch: (settings?: Partial<typeof DEFAULT_SETTINGS>, selectedPackIds?: string[]) => void;
  onStart: () => void;
}) {
  const [selectedPacks, setSelectedPacks] = useState<string[]>(lobby.selectedPackIds);
  const patchNumber = (key: keyof typeof DEFAULT_SETTINGS, value: string) => {
    onPatch({ [key]: Number(value) } as Partial<typeof DEFAULT_SETTINGS>, selectedPacks);
  };

  return (
    <section className="panel elevated-panel stack lobby-panel">
      <div className="lobby-headline">
        <div>
          <div className="eyebrow">Host controls</div>
          <h2>Lobby settings</h2>
        </div>
        <div className="share-code-box">
          <span>Lobby code</span>
          <strong>{lobby.code}</strong>
        </div>
      </div>
      <div className="settings-grid">
        <label>
          Categories
          <input disabled={!isHost} type="number" min={2} max={8} value={lobby.settings.categoryCount} onChange={(e) => patchNumber('categoryCount', e.target.value)} />
        </label>
        <label>
          Questions per category
          <input disabled={!isHost} type="number" min={1} max={8} value={lobby.settings.questionCountPerCategory} onChange={(e) => patchNumber('questionCountPerCategory', e.target.value)} />
        </label>
        <label>
          Reveal speed (ms)
          <input disabled={!isHost} type="number" min={15} max={300} value={lobby.settings.revealSpeedMs} onChange={(e) => patchNumber('revealSpeedMs', e.target.value)} />
        </label>
        <label>
          Answer timer (seconds)
          <input disabled={!isHost} type="number" min={3} max={30} value={lobby.settings.answerTimeSeconds} onChange={(e) => patchNumber('answerTimeSeconds', e.target.value)} />
        </label>
        <label>
          Buzz window after full reveal (seconds)
          <input disabled={!isHost} type="number" min={1} max={15} value={lobby.settings.postRevealBuzzSeconds} onChange={(e) => patchNumber('postRevealBuzzSeconds', e.target.value)} />
        </label>
      </div>
      <div className="settings-grid checks">
        <Check label="Deduct on wrong" checked={lobby.settings.deductOnWrongAnswer} disabled={!isHost} onChange={(checked) => onPatch({ deductOnWrongAnswer: checked }, selectedPacks)} />
        <Check label="Allow negative scores" checked={lobby.settings.allowNegativeScores} disabled={!isHost} onChange={(checked) => onPatch({ allowNegativeScores: checked }, selectedPacks)} />
        <Check label="Typo tolerance" checked={lobby.settings.typoTolerance} disabled={!isHost} onChange={(checked) => onPatch({ typoTolerance: checked }, selectedPacks)} />
        <Check label="Variant matching" checked={lobby.settings.variantMatching} disabled={!isHost} onChange={(checked) => onPatch({ variantMatching: checked }, selectedPacks)} />
        <Check label="Case insensitive" checked={lobby.settings.caseInsensitive} disabled={!isHost} onChange={(checked) => onPatch({ caseInsensitive: checked }, selectedPacks)} />
        <Check label="Progressive reveal" checked={lobby.settings.progressiveReveal} disabled={!isHost} onChange={(checked) => onPatch({ progressiveReveal: checked }, selectedPacks)} />
        <Check label="Buzz rebound" checked={lobby.settings.allowBuzzRebound} disabled={!isHost} onChange={(checked) => onPatch({ allowBuzzRebound: checked }, selectedPacks)} />
        <Check label="Enable final round" checked={lobby.settings.enableFinalRound} disabled={!isHost} onChange={(checked) => onPatch({ enableFinalRound: checked }, selectedPacks)} />
      </div>
      <div className="stack compact-stack">
        <strong>Question packs</strong>
        {packs.map((pack) => {
          const checked = selectedPacks.includes(pack.id);
          return (
            <label key={pack.id} className="check-label pack-option">
              <input
                type="checkbox"
                disabled={!isHost}
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked ? [...selectedPacks, pack.id] : selectedPacks.filter((id) => id !== pack.id);
                  setSelectedPacks(next);
                  onPatch(undefined, next);
                }}
              />
              <span>{pack.name} ({pack.questionCount} questions)</span>
            </label>
          );
        })}
      </div>
      <button disabled={!isHost} onClick={onStart}>Start game</button>
    </section>
  );
}

function Check({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="check-label soft-check">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function BoardView({ lobby, playerId, onSelect }: { lobby: LobbyState; playerId: string; onSelect: (row: number, col: number) => void }) {
  const canChoose = lobby.currentChooserId === playerId && lobby.phase === 'board';
  const categories = lobby.board[0]?.map((question) => question.category) ?? [];

  return (
    <section className="panel elevated-panel stack board-panel">
      <div className="row between wrap board-topline">
        <div>
          <div className="eyebrow">Main board</div>
          <h2>Choose the next clue</h2>
          <p className="muted">{canChoose ? 'Your turn to pick.' : `${lobby.players.find((player) => player.id === lobby.currentChooserId)?.name ?? '—'} picks next.`}</p>
        </div>
      </div>
      <div className="board" style={{ gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, minmax(0, 1fr))` }}>
        {categories.map((category) => (
          <div key={category} className="board-head">{category}</div>
        ))}
        {lobby.board.map((row, rowIndex) =>
          row.map((question: BoardQuestion, colIndex: number) => (
            <button
              key={question.id}
              className={`tile ${question.revealed ? 'used' : ''}`}
              disabled={!canChoose || question.revealed}
              onClick={() => onSelect(rowIndex, colIndex)}
            >
              {question.revealed ? '—' : question.value}
            </button>
          )),
        )}
      </div>
    </section>
  );
}

function ClueView({
  lobby,
  playerId,
  answer,
  setAnswer,
  now,
  onBuzz,
  onSubmitAnswer,
}: {
  lobby: LobbyState;
  playerId: string;
  answer: string;
  setAnswer: (value: string) => void;
  now: number;
  onBuzz: () => void;
  onSubmitAnswer: () => void;
}) {
  const clue = lobby.clueState!;
  const activePlayer = clue.activeAnswerPlayerId ? lobby.players.find((p) => p.id === clue.activeAnswerPlayerId) : null;
  const amActive = clue.activeAnswerPlayerId === playerId;
  const canBuzz = clue.status === 'revealing' && clue.remainingEligiblePlayers.includes(playerId);

  const answerSecondsLeft = clue.answerWindowEndsAt ? Math.max(0, (clue.answerWindowEndsAt - now) / 1000) : 0;
  const answerPercent = clue.answerWindowEndsAt ? Math.max(0, Math.min(100, (answerSecondsLeft / lobby.settings.answerTimeSeconds) * 100)) : 0;
  const buzzSecondsLeft = clue.buzzWindowEndsAt ? Math.max(0, (clue.buzzWindowEndsAt - now) / 1000) : 0;
  const buzzPercent = clue.buzzWindowEndsAt ? Math.max(0, Math.min(100, (buzzSecondsLeft / lobby.settings.postRevealBuzzSeconds) * 100)) : 0;
  const statusLabel = buildClueStatusLabel(lobby, activePlayer?.name);

  return (
    <div className="clue-overlay">
      <section className="panel elevated-panel stack clue-popup">
        <div className="clue-header">
          <div>
            <div className="eyebrow">{clue.category}</div>
            <h2>{clue.value} point clue</h2>
          </div>
          <div className="badge subtle-badge">Chooser: {lobby.players.find((p) => p.id === clue.chooserId)?.name}</div>
        </div>

        <div className="clue-box clue-popup-box">{clue.revealedText || '...'}</div>

        <div className="show-status-band">
          <strong>{statusLabel}</strong>
          <span>{activePlayer ? `${activePlayer.name} is on the clock.` : `Eligible players: ${clue.remainingEligiblePlayers.length}`}</span>
        </div>

        {clue.status === 'paused-for-answer' && (
          <TimerBar label={activePlayer ? `${activePlayer.name} answering` : 'Answer timer'} secondsLeft={answerSecondsLeft} percent={answerPercent} variant="answer" />
        )}
        {clue.status === 'revealing' && clue.revealIndex >= clue.fullText.length && clue.buzzWindowEndsAt && (
          <TimerBar label="Final buzz window" secondsLeft={buzzSecondsLeft} percent={buzzPercent} variant="buzz" />
        )}

        <div className="clue-status-row">
          {canBuzz && <button onClick={onBuzz}>Buzz</button>}
          {clue.status === 'paused-for-answer' && activePlayer && <span className="badge answer-badge">Answering: {activePlayer.name}</span>}
          {clue.status === 'revealing' && clue.revealIndex < clue.fullText.length && <span className="badge subtle-badge">Question revealing…</span>}
          {clue.status === 'resolved' && <span className="badge subtle-badge">Hold for ruling…</span>}
        </div>

        {amActive && clue.status === 'paused-for-answer' && (
          <div className="row gap wrap clue-answer-row">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && answer.trim()) {
                  e.preventDefault();
                  onSubmitAnswer();
                }
              }}
              placeholder="Type your answer"
              maxLength={40}
              autoFocus
            />
            <button onClick={onSubmitAnswer} disabled={!answer.trim()}>Submit</button>
          </div>
        )}

        {!amActive && clue.status === 'paused-for-answer' && <p className="muted">Waiting on the active player. Everyone else stays locked until the ruling lands.</p>}
        {clue.status === 'revealing' && !amActive && <p className="muted">Buzz when ready. If someone misses, the reveal resumes after a short beat.</p>}
      </section>
    </div>
  );
}

function TimerBar({ label, secondsLeft, percent, variant }: { label: string; secondsLeft: number; percent: number; variant: 'answer' | 'buzz' }) {
  return (
    <div className={`timer-shell ${variant}`}>
      <div className="timer-meta">
        <span>{label}</span>
        <strong>{secondsLeft.toFixed(1)}s</strong>
      </div>
      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function LogList({ messages }: { messages: SystemMessage[] }) {
  const recent = messages.slice(0, 8);
  return (
    <div className="stack compact-stack log-panel">
      {recent.map((message) => (
        <div key={message.id} className={`msg ${message.type}`}>
          {message.text}
        </div>
      ))}
    </div>
  );
}

function buildClueStatusLabel(lobby: LobbyState, activeName?: string) {
  const clue = lobby.clueState;
  if (!clue) return 'Waiting for the next clue.';
  if (clue.status === 'paused-for-answer') return activeName ? `${activeName}, your answer.` : 'Answer in progress.';
  if (clue.status === 'resolved') return 'Ruling in progress.';
  if (clue.revealIndex >= clue.fullText.length) return 'Full clue revealed. Final chance to buzz.';
  return 'Question revealing. Buzz when you know it.';
}

function headlineFromLobby(lobby: LobbyState) {
  const latest = lobby.messages[0]?.text;
  if (latest) return latest;
  if (lobby.phase === 'board') return 'Waiting on the next selection.';
  if (lobby.phase === 'finished') return 'Game finished.';
  return 'Standing by.';
}

function applyScoreDelta(
  send: (event: { type: 'adjustScore'; payload: { code: string; targetPlayerId: string; delta: number } }) => void,
  code: string,
  targetPlayerId: string,
  delta: number,
  setScoreDelta: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  if (!delta) return;
  send({ type: 'adjustScore', payload: { code, targetPlayerId, delta } });
  setScoreDelta((current) => ({ ...current, [targetPlayerId]: '' }));
}

function clearFlashAfterDelay(setter: (value: ResultFlash) => void, delay = 1800) {
  window.setTimeout(() => setter(null), delay);
}

function formatPhase(phase: string) {
  return phase.replace('-', ' ');
}

function stopMusicLoop(ref: React.MutableRefObject<number | null>) {
  if (ref.current) {
    window.clearInterval(ref.current);
    ref.current = null;
  }
}

function playMusicStep(ctx: AudioContext, track: TrackDef, step: number, volume: number) {
  if (volume <= 0) return;
  if (track.kick.includes(step)) playPercussiveTone(ctx, 90, 0.16, 0.11 * volume, 'sine');
  if (track.hat.includes(step)) playNoiseHat(ctx, 0.045, 0.035 * volume);
  for (const [triggerStep, freq] of track.bass) {
    if (triggerStep === step) playPercussiveTone(ctx, freq, 0.24, 0.065 * volume, 'triangle');
  }
}

function playToneSequence(
  kind: 'buzz' | 'correct' | 'incorrect' | 'timeout' | 'adjust' | 'tick',
  audioCtxRef: React.MutableRefObject<AudioContext | null>,
  enabled: boolean,
  volume: number,
) {
  if (!enabled || volume <= 0) return;
  const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor();
  const ctx = audioCtxRef.current;
  const now = ctx.currentTime;

  const tones: Record<typeof kind, Array<[number, number, number]>> = {
    buzz: [[420, 0.09, 0.08], [540, 0.12, 0.06]],
    correct: [[540, 0.12, 0.08], [680, 0.16, 0.08], [820, 0.22, 0.07]],
    incorrect: [[320, 0.14, 0.11], [240, 0.18, 0.09]],
    timeout: [[300, 0.14, 0.09], [220, 0.18, 0.08], [170, 0.22, 0.07]],
    adjust: [[500, 0.1, 0.05], [500, 0.1, 0.05]],
    tick: [[960, 0.05, 0.06]],
  };

  let offset = 0;
  for (const [freq, duration, gainValue] of tones[kind]) {
    playPercussiveTone(ctx, freq, duration, gainValue * volume, kind === 'incorrect' || kind === 'timeout' ? 'triangle' : 'sine', now + offset);
    offset += duration + 0.03;
  }
}

function playPercussiveTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  gainValue: number,
  type: OscillatorType = 'sine',
  startAt = ctx.currentTime,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function playNoiseHat(ctx: AudioContext, duration: number, gainValue: number) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

export default App;
