import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';
import type { ClientEvent, ServerEvent } from '@jeopardy/shared';
import { GameStore } from './game-store.js';
import { loadQuestionPacks } from './pack-loader.js';

const PORT = Number(process.env.PORT ?? 3001);
const app = express();
app.use(cors());
app.use(express.json());

const packs = loadQuestionPacks();
const store = new GameStore(packs);

app.get('/health', (_req, res) => {
  res.json({ ok: true, packs: packs.length });
});

app.get('/packs', (_req, res) => {
  res.json(store.getPackMeta());
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (socket) => {
  const playerId = `player_${Math.random().toString(36).slice(2, 10)}`;
  store.registerConnection(playerId, socket);

  const connectedEvent: ServerEvent = { type: 'connected', payload: { playerId } };
  socket.send(JSON.stringify(connectedEvent));
  socket.send(JSON.stringify({ type: 'availablePacks', payload: store.getPackMeta() } satisfies ServerEvent));

  socket.on('message', (raw) => {
    try {
      const event = JSON.parse(raw.toString()) as ClientEvent;
      switch (event.type) {
        case 'createLobby':
          store.createLobby(event.payload.name, playerId);
          break;
        case 'joinLobby':
          store.joinLobby(event.payload.code.toUpperCase(), event.payload.name, playerId);
          break;
        case 'updateSettings':
          store.updateSettings(playerId, event.payload);
          break;
        case 'startGame':
          store.startGame(playerId);
          break;
        case 'selectQuestion':
          store.selectQuestion(playerId, event.payload.row, event.payload.col);
          break;
        case 'buzz':
          store.buzz(playerId);
          break;
        case 'submitAnswer':
          store.submitAnswer(playerId, event.payload.answer);
          break;
        case 'adjustScore':
          store.adjustScore(playerId, event.payload.targetPlayerId, event.payload.delta);
          break;
        case 'submitFinalWager':
          store.submitFinalWager(playerId, event.payload.wager);
          break;
        case 'submitFinalAnswers':
          store.submitFinalAnswers(playerId, event.payload.answers);
          break;
        case 'returnToLobby':
          store.returnToLobby(playerId);
          break;
        case 'ping':
          socket.send(JSON.stringify({ type: 'toast', payload: { message: 'pong' } } satisfies ServerEvent));
          break;
        default:
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      socket.send(JSON.stringify({ type: 'error', payload: { message } } satisfies ServerEvent));
    }
  });

  socket.on('close', () => {
    store.unregisterConnection(playerId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Jeopardy server running on http://localhost:${PORT}`);
});
