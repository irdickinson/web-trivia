import { DEFAULT_SETTINGS, matchAnswer, type AnswerReviewPayload, type BoardQuestion, type ClueState, type FinalQuestion, type FinalRoundState, type LobbyState, type Player, type PublicLobbyState, type QuestionPack, type ServerEvent, type SystemMessage } from '@jeopardy/shared';

export interface ConnectionLike {
  send: (data: string) => void;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function code(): string {
  return Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class GameStore {
  private lobbies = new Map<string, LobbyState>();
  private connections = new Map<string, ConnectionLike>();
  private playerToLobby = new Map<string, string>();
  private revealIntervals = new Map<string, NodeJS.Timeout>();
  private answerTimeouts = new Map<string, NodeJS.Timeout>();
  private postRevealTimeouts = new Map<string, NodeJS.Timeout>();
  private transitionTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(private readonly packs: QuestionPack[]) {}

  registerConnection(playerId: string, connection: ConnectionLike): void {
    this.connections.set(playerId, connection);
  }

  unregisterConnection(playerId: string): void {
    this.connections.delete(playerId);
    const lobbyCode = this.playerToLobby.get(playerId);
    if (!lobbyCode) return;
    const lobby = this.lobbies.get(lobbyCode);
    if (!lobby) return;
    const player = lobby.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = false;
      this.broadcastLobby(lobbyCode);
    }
  }

  getPackMeta() {
    return this.packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      categoryCount: pack.categories.length,
      questionCount: pack.questions.length,
    }));
  }

  createLobby(name: string, playerId: string): LobbyState {
    const lobbyCode = this.uniqueCode();
    const host: Player = {
      id: playerId,
      name: name.trim(),
      role: 'host',
      score: 0,
      joinedAt: Date.now(),
      connected: true,
    };

    const packIds = this.packs.slice(0, 1).map((pack) => pack.id);
    const lobby: LobbyState = {
      code: lobbyCode,
      phase: 'lobby',
      hostId: playerId,
      players: [host],
      settings: clone(DEFAULT_SETTINGS),
      selectedPackIds: packIds,
      board: [],
      currentChooserId: playerId,
      defaultChooserRotationIndex: 0,
      messages: [],
    };

    this.lobbies.set(lobbyCode, lobby);
    this.playerToLobby.set(playerId, lobbyCode);
    this.broadcastLobby(lobbyCode);
    return lobby;
  }

  joinLobby(lobbyCode: string, name: string, playerId: string): LobbyState {
    const lobby = this.mustLobby(lobbyCode);
    if (lobby.phase !== 'lobby') {
      throw new Error('Game already started.');
    }
    if (lobby.players.length >= lobby.settings.maxPlayers) {
      throw new Error('Lobby is full.');
    }
    if (lobby.players.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error('Name already taken in this lobby.');
    }
    const player: Player = {
      id: playerId,
      name: name.trim(),
      role: 'player',
      score: 0,
      joinedAt: Date.now(),
      connected: true,
    };
    lobby.players.push(player);
    this.playerToLobby.set(playerId, lobbyCode);
    if (!lobby.currentChooserId) {
      lobby.currentChooserId = lobby.hostId;
    }
    this.pushMessage(lobby, `${player.name} joined the lobby.`, 'info');
    this.broadcastLobby(lobbyCode);
    return lobby;
  }

  updateSettings(playerId: string, patch: { settings?: Partial<LobbyState['settings']>; selectedPackIds?: string[] }): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.hostId !== playerId) {
      throw new Error('Only the host can update settings.');
    }
    if (lobby.phase !== 'lobby') {
      throw new Error('Settings can only be changed before the game starts.');
    }
    if (patch.settings) {
      lobby.settings = {
        ...lobby.settings,
        ...patch.settings,
      };
    }
    if (patch.selectedPackIds && patch.selectedPackIds.length > 0) {
      lobby.selectedPackIds = patch.selectedPackIds;
    }
    this.broadcastLobby(lobby.code);
  }

  startGame(playerId: string): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.hostId !== playerId) {
      throw new Error('Only the host can start the game.');
    }
    if (lobby.players.length < 1) {
      throw new Error('Need at least one player.');
    }

    lobby.board = this.buildBoard(lobby);
    lobby.phase = 'board';
    lobby.currentChooserId = lobby.hostId;
    lobby.defaultChooserRotationIndex = 0;
    this.pushMessage(lobby, 'Game started.', 'info');
    this.broadcastLobby(lobby.code);
  }

  selectQuestion(playerId: string, row: number, col: number): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.phase !== 'board') throw new Error('Not on board phase.');
    if (lobby.currentChooserId !== playerId) throw new Error('Not your pick.');

    const question = lobby.board[row]?.[col];
    if (!question) throw new Error('Question not found.');
    if (question.revealed) throw new Error('Question already used.');

    question.revealed = true;
    lobby.phase = 'clue';
    lobby.clueState = {
      questionId: question.id,
      category: question.category,
      value: question.value,
      fullText: question.clue,
      revealedText: lobby.settings.progressiveReveal ? '' : question.clue,
      revealIndex: lobby.settings.progressiveReveal ? 0 : question.clue.length,
      status: lobby.settings.progressiveReveal ? 'revealing' : 'revealing',
      chooserId: playerId,
      submittedAnswers: {},
      remainingEligiblePlayers: lobby.players.map((p) => p.id),
      correctAnswers: question.acceptedAnswers,
      answerWindowEndsAt: undefined,
      buzzWindowEndsAt: undefined,
    };

    this.pushMessage(lobby, `${this.playerName(lobby, playerId)} selected ${question.category} for ${question.value}.`, 'info');
    this.broadcastLobby(lobby.code);

    if (lobby.settings.progressiveReveal) {
      this.startRevealTimer(lobby.code);
    }
  }

  buzz(playerId: string): void {
    const lobby = this.findLobbyByPlayer(playerId);
    const clue = lobby.clueState;
    if (!clue || lobby.phase !== 'clue') throw new Error('No active clue.');
    if (clue.status !== 'revealing') throw new Error('Buzzing is not open right now.');
    if (!clue.remainingEligiblePlayers.includes(playerId)) throw new Error('You are no longer eligible to answer this clue.');

    clue.activeAnswerPlayerId = playerId;
    clue.status = 'paused-for-answer';
    clue.answerWindowEndsAt = Date.now() + (lobby.settings.answerTimeSeconds * 1000);
    clue.buzzWindowEndsAt = undefined;
    this.stopRevealTimer(lobby.code);
    this.clearPostRevealTimeout(lobby.code);
    this.clearTransitionTimeout(lobby.code);
    this.startAnswerTimer(lobby.code, playerId);
    this.broadcastLobby(lobby.code);
  }

  submitAnswer(playerId: string, answer: string): void {
    const lobby = this.findLobbyByPlayer(playerId);
    const clue = lobby.clueState;
    if (!clue || clue.activeAnswerPlayerId !== playerId) {
      throw new Error('It is not your answer window.');
    }

    clue.submittedAnswers[playerId] = answer;
    this.clearAnswerTimer(lobby.code);

    const review = this.reviewAnswer(lobby, playerId, answer);

    if (review.matched) {
      this.resolveCorrectAnswer(lobby, playerId);
    } else {
      this.resolveWrongAnswer(lobby, playerId);
    }
  }

  adjustScore(playerId: string, targetPlayerId: string, delta: number): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.hostId !== playerId) {
      throw new Error('Only the host can adjust scores.');
    }
    const player = this.mustPlayer(lobby, targetPlayerId);
    player.score += delta;
    if (!lobby.settings.allowNegativeScores && player.score < 0) {
      player.score = 0;
    }
    const sign = delta >= 0 ? '+' : '';
    this.pushMessage(lobby, `Host adjusted ${player.name}'s score by ${sign}${delta}.`, 'override');
    this.broadcastLobby(lobby.code);
  }

  submitFinalWager(playerId: string, wager: number): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.phase !== 'final-wager' || !lobby.finalRound) throw new Error('Not in final wager phase.');
    const player = this.mustPlayer(lobby, playerId);
    if (wager < 0 || wager > Math.max(player.score, 0)) {
      throw new Error('Invalid wager.');
    }
    lobby.finalRound.playerEntries[playerId] = {
      wager,
      answers: {},
      correctCount: 0,
      doubled: false,
    };

    if (Object.keys(lobby.finalRound.playerEntries).length === lobby.players.length) {
      lobby.phase = 'final-answer';
      this.pushMessage(lobby, 'All wagers locked. Final questions are live.', 'info');
    }
    this.broadcastLobby(lobby.code);
  }

  submitFinalAnswers(playerId: string, answers: Record<string, string>): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.phase !== 'final-answer' || !lobby.finalRound) throw new Error('Not in final answer phase.');
    const entry = lobby.finalRound.playerEntries[playerId];
    if (!entry) throw new Error('Submit your wager first.');
    entry.answers = answers;

    const allSubmitted = lobby.players.every((player) => {
      const playerEntry = lobby.finalRound?.playerEntries[player.id];
      return playerEntry && Object.keys(playerEntry.answers).length === lobby.finalRound!.questions.length;
    });

    if (allSubmitted) {
      this.scoreFinalRound(lobby);
    }
    this.broadcastLobby(lobby.code);
  }

  private scoreFinalRound(lobby: LobbyState): void {
    const round = lobby.finalRound!;
    let highest = 0;

    for (const player of lobby.players) {
      const entry = round.playerEntries[player.id];
      let correct = 0;
      for (const question of round.questions) {
        const answer = entry.answers[question.id] ?? '';
        const result = matchAnswer(answer, question.acceptedAnswers, {
          typoTolerance: lobby.settings.typoTolerance,
          variantMatching: lobby.settings.variantMatching,
          caseInsensitive: lobby.settings.caseInsensitive,
        });
        if (result.matched) correct += 1;
      }
      entry.correctCount = correct;
      if (correct > highest) highest = correct;
    }

    for (const player of lobby.players) {
      const entry = round.playerEntries[player.id];
      if (entry.correctCount === highest) {
        player.score += entry.wager;
        entry.doubled = true;
      }
    }

    lobby.phase = 'final-results';
    this.pushMessage(lobby, 'Final round scored.', 'info');
  }

  private resolveCorrectAnswer(lobby: LobbyState, playerId: string, viaOverride = false): void {
    const clue = lobby.clueState;
    if (!clue) return;
    const player = this.mustPlayer(lobby, playerId);
    player.score += clue.value;
    clue.status = 'resolved';
    clue.activeAnswerPlayerId = undefined;
    clue.answerWindowEndsAt = undefined;
    clue.buzzWindowEndsAt = undefined;
    this.currentQuestion(lobby)!.answeredCorrectlyBy = playerId;

    this.setChooserAfterCorrect(lobby, playerId);
    if (viaOverride) {
      this.pushMessage(lobby, `Host overrode ruling: ${player.name} marked correct.`, 'override');
    } else {
      this.pushMessage(lobby, `${player.name} answered correctly.`, 'info');
    }
    this.broadcastLobby(lobby.code);
    this.scheduleTransition(lobby.code, () => this.finishClueOrAdvance(lobby), 2200);
  }

  private resolveWrongAnswer(lobby: LobbyState, playerId: string, viaOverride = false): void {
    const clue = lobby.clueState;
    if (!clue) return;
    const player = this.mustPlayer(lobby, playerId);
    if (lobby.settings.deductOnWrongAnswer) {
      player.score -= clue.value;
      if (!lobby.settings.allowNegativeScores && player.score < 0) {
        player.score = 0;
      }
    }
    clue.remainingEligiblePlayers = clue.remainingEligiblePlayers.filter((id) => id !== playerId);
    clue.activeAnswerPlayerId = undefined;
    clue.answerWindowEndsAt = undefined;
    clue.buzzWindowEndsAt = undefined;

    if (viaOverride) {
      this.pushMessage(lobby, `Host overrode ruling: ${player.name} marked incorrect.`, 'override');
    } else {
      this.pushMessage(lobby, `${player.name} answered incorrectly.`, 'warning');
    }

    clue.status = 'resolved';
    this.broadcastLobby(lobby.code);

    if (!lobby.settings.allowBuzzRebound || clue.remainingEligiblePlayers.length === 0) {
      this.scheduleTransition(lobby.code, () => this.finishClueOrAdvance(lobby), 1800);
      return;
    }

    this.scheduleTransition(lobby.code, () => {
      if (!lobby.clueState) return;
      clue.status = 'revealing';
      if (clue.revealIndex >= clue.fullText.length) {
        this.startPostRevealTimeout(lobby);
        this.broadcastLobby(lobby.code);
        return;
      }
      this.startRevealTimer(lobby.code);
      this.broadcastLobby(lobby.code);
    }, 1500);
  }

  private finishClueOrAdvance(lobby: LobbyState): void {
    this.stopRevealTimer(lobby.code);
    this.clearAnswerTimer(lobby.code);
    this.clearPostRevealTimeout(lobby.code);
    this.clearTransitionTimeout(lobby.code);

    lobby.phase = this.boardFinished(lobby) && lobby.settings.enableFinalRound ? 'final-wager' : 'board';

    if (lobby.phase === 'final-wager') {
      lobby.finalRound = this.createFinalRound(lobby);
      this.pushMessage(lobby, 'Main board complete. Final round wagering begins.', 'info');
    } else if (this.boardFinished(lobby)) {
      lobby.phase = 'finished';
      this.pushMessage(lobby, 'Game finished.', 'info');
    }

    lobby.clueState = undefined;
    this.broadcastLobby(lobby.code);
  }

  private createFinalRound(lobby: LobbyState): FinalRoundState {
    const selectedPacks = this.resolveSelectedPacks(lobby);
    const eligible = selectedPacks.flatMap((pack) => pack.questions.filter((q) => q.isFinalEligible));
    const byCategory = new Map<string, typeof eligible>();
    for (const q of eligible) {
      const list = byCategory.get(q.category) ?? [];
      list.push(q);
      byCategory.set(q.category, list);
    }

    const categories = Array.from(byCategory.keys()).sort(() => Math.random() - 0.5).slice(0, lobby.settings.finalQuestionCount);
    const questions: FinalQuestion[] = categories.map((category) => {
      const pool = byCategory.get(category)!;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      return { ...picked };
    });

    return {
      questions,
      playerEntries: {},
      revealIndex: 0,
    };
  }

  private setChooserAfterCorrect(lobby: LobbyState, playerId: string): void {
    lobby.currentChooserId = playerId;
  }

  private boardFinished(lobby: LobbyState): boolean {
    return lobby.board.every((row) => row.every((question) => question.revealed));
  }

  private currentQuestion(lobby: LobbyState): BoardQuestion | undefined {
    const clue = lobby.clueState;
    if (!clue) return undefined;
    return lobby.board.flat().find((question) => question.id === clue.questionId);
  }

  private reviewAnswer(lobby: LobbyState, playerId: string, answer: string): AnswerReviewPayload {
    const clue = lobby.clueState!;
    const player = this.mustPlayer(lobby, playerId);
    const result = matchAnswer(answer, clue.correctAnswers, {
      typoTolerance: lobby.settings.typoTolerance,
      variantMatching: lobby.settings.variantMatching,
      caseInsensitive: lobby.settings.caseInsensitive,
    });

    return {
      code: lobby.code,
      playerId,
      playerName: player.name,
      submittedAnswer: answer,
      matched: result.matched,
      acceptedAnswers: clue.correctAnswers,
    };
  }

  private buildBoard(lobby: LobbyState): BoardQuestion[][] {
    const selectedPacks = this.resolveSelectedPacks(lobby);
    const allQuestions = selectedPacks.flatMap((pack) => pack.questions);
    const categoryNames = Array.from(new Set(allQuestions.map((q) => q.category)));
    const pickedCategories = categoryNames.slice(0, lobby.settings.categoryCount);

    const rowCount = lobby.settings.questionCountPerCategory;
    return Array.from({ length: rowCount }, (_, row) =>
      pickedCategories.map((category, col) => {
        const pool = allQuestions
          .filter((q) => q.category === category)
          .sort((a, b) => a.difficulty - b.difficulty);
        const source = pool[row] ?? pool[pool.length - 1];
        return {
          ...source,
          row,
          col,
          value: lobby.settings.pointValues[row] ?? (row + 1) * 100,
          revealed: false,
        };
      }),
    );
  }

  private resolveSelectedPacks(lobby: LobbyState): QuestionPack[] {
    const chosen = this.packs.filter((pack) => lobby.selectedPackIds.includes(pack.id));
    return chosen.length > 0 ? chosen : this.packs;
  }

  returnToLobby(playerId: string): void {
    const lobby = this.findLobbyByPlayer(playerId);
    if (lobby.hostId !== playerId) throw new Error('Only the host can return everyone to the lobby.');
    this.stopRevealTimer(lobby.code);
    this.clearAnswerTimer(lobby.code);
    this.clearPostRevealTimeout(lobby.code);
    this.clearTransitionTimeout(lobby.code);
    lobby.phase = 'lobby';
    lobby.board = [];
    lobby.finalRound = undefined;
    lobby.clueState = undefined;
    lobby.currentChooserId = lobby.hostId;
    lobby.defaultChooserRotationIndex = 0;
    this.pushMessage(lobby, 'Host returned the game to the lobby.', 'warning');
    this.broadcastLobby(lobby.code);
  }

  private startRevealTimer(lobbyCode: string): void {
    this.stopRevealTimer(lobbyCode);
    const lobby = this.mustLobby(lobbyCode);
    const clue = lobby.clueState;
    if (!clue) return;

    const tick = () => {
      if (!lobby.clueState || lobby.clueState.status !== 'revealing') {
        this.stopRevealTimer(lobbyCode);
        return;
      }
      const full = lobby.clueState.fullText;
      if (lobby.clueState.revealIndex >= full.length) {
        lobby.clueState.revealedText = full;
        lobby.clueState.buzzWindowEndsAt = Date.now() + (lobby.settings.postRevealBuzzSeconds * 1000);
        this.clearPostRevealTimeout(lobbyCode);
        this.startPostRevealTimeout(lobby);
        this.broadcastLobby(lobbyCode);
        this.stopRevealTimer(lobbyCode);
        return;
      }
      lobby.clueState.revealIndex += 1;
      lobby.clueState.revealedText = full.slice(0, lobby.clueState.revealIndex);
      this.broadcastLobby(lobbyCode);
    };

    this.revealIntervals.set(lobbyCode, setInterval(tick, lobby.settings.revealSpeedMs));
  }

  private finishClueNoCorrect(lobby: LobbyState): void {
    this.stopRevealTimer(lobby.code);
    if (lobby.clueState) {
      lobby.clueState.status = 'resolved';
    }
    this.advanceDefaultRotation(lobby);
    this.pushMessage(lobby, 'No one answered correctly. Turn returns to default pick order.', 'warning');
    this.broadcastLobby(lobby.code);
    this.scheduleTransition(lobby.code, () => this.finishClueOrAdvance(lobby), 1800);
  }

  private advanceDefaultRotation(lobby: LobbyState): void {
    if (lobby.players.length === 0) return;
    lobby.defaultChooserRotationIndex = (lobby.defaultChooserRotationIndex + 1) % lobby.players.length;
    lobby.currentChooserId = lobby.players[lobby.defaultChooserRotationIndex]?.id;
  }

  private startAnswerTimer(lobbyCode: string, playerId: string): void {
    this.clearAnswerTimer(lobbyCode);
    const lobby = this.mustLobby(lobbyCode);
    const timeout = setTimeout(() => {
      if (!lobby.clueState || lobby.clueState.activeAnswerPlayerId !== playerId) return;
      this.resolveWrongAnswer(lobby, playerId);
    }, lobby.settings.answerTimeSeconds * 1000);
    this.answerTimeouts.set(lobbyCode, timeout);
  }


  private startPostRevealTimeout(lobby: LobbyState): void {
    this.clearPostRevealTimeout(lobby.code);
    this.clearTransitionTimeout(lobby.code);
    const clue = lobby.clueState;
    if (!clue || clue.status !== 'revealing') return;
    clue.buzzWindowEndsAt = Date.now() + (lobby.settings.postRevealBuzzSeconds * 1000);
    const timeout = setTimeout(() => {
      if (!lobby.clueState || lobby.clueState.status !== 'revealing') return;
      this.finishClueNoCorrect(lobby);
    }, lobby.settings.postRevealBuzzSeconds * 1000);
    this.postRevealTimeouts.set(lobby.code, timeout);
  }


  private scheduleTransition(lobbyCode: string, callback: () => void, delayMs: number): void {
    this.clearTransitionTimeout(lobbyCode);
    const timeout = setTimeout(() => {
      this.transitionTimeouts.delete(lobbyCode);
      callback();
    }, delayMs);
    this.transitionTimeouts.set(lobbyCode, timeout);
  }

  private clearTransitionTimeout(lobbyCode: string): void {
    const timeout = this.transitionTimeouts.get(lobbyCode);
    if (timeout) {
      clearTimeout(timeout);
      this.transitionTimeouts.delete(lobbyCode);
    }
  }

  private clearPostRevealTimeout(lobbyCode: string): void {
    const timeout = this.postRevealTimeouts.get(lobbyCode);
    if (timeout) {
      clearTimeout(timeout);
      this.postRevealTimeouts.delete(lobbyCode);
    }
    const lobby = this.lobbies.get(lobbyCode);
    if (lobby?.clueState) {
      lobby.clueState.buzzWindowEndsAt = undefined;
    }
  }

  private clearAnswerTimer(lobbyCode: string): void {
    const timeout = this.answerTimeouts.get(lobbyCode);
    if (timeout) {
      clearTimeout(timeout);
      this.answerTimeouts.delete(lobbyCode);
    }
  }

  private stopRevealTimer(lobbyCode: string): void {
    const interval = this.revealIntervals.get(lobbyCode);
    if (interval) {
      clearInterval(interval);
      this.revealIntervals.delete(lobbyCode);
    }
  }

  private uniqueCode(): string {
    let next = code();
    while (this.lobbies.has(next)) {
      next = code();
    }
    return next;
  }

  private broadcastLobby(lobbyCode: string): void {
    const lobby = this.mustLobby(lobbyCode);
    for (const player of lobby.players) {
      this.sendToPlayer(player.id, { type: 'lobbyState', payload: this.toPublicState(lobby, player.id) });
    }
  }

  private toPublicState(lobby: LobbyState, playerId: string): PublicLobbyState {
    return {
      ...clone(lobby),
      you: playerId,
    };
  }

  private pushMessage(lobby: LobbyState, text: string, type: SystemMessage['type']): void {
    lobby.messages.unshift({ id: id('msg'), text, type, createdAt: Date.now() });
    lobby.messages = lobby.messages.slice(0, 50);
  }

  private sendToPlayer(playerId: string, event: ServerEvent): void {
    const connection = this.connections.get(playerId);
    if (!connection) return;
    connection.send(JSON.stringify(event));
  }

  private mustLobby(lobbyCode: string): LobbyState {
    const lobby = this.lobbies.get(lobbyCode);
    if (!lobby) throw new Error('Lobby not found.');
    return lobby;
  }

  private findLobbyByPlayer(playerId: string): LobbyState {
    const lobbyCode = this.playerToLobby.get(playerId);
    if (!lobbyCode) throw new Error('Player is not in a lobby.');
    return this.mustLobby(lobbyCode);
  }

  private mustPlayer(lobby: LobbyState, playerId: string): Player {
    const player = lobby.players.find((item) => item.id === playerId);
    if (!player) throw new Error('Player not found.');
    return player;
  }

  private playerName(lobby: LobbyState, playerId: string): string {
    return this.mustPlayer(lobby, playerId).name;
  }
}
