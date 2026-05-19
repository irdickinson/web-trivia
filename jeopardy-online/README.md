# Jeopardy Online

A multiplayer Jeopardy-style trivia game with:
- no accounts
- lobby-code joining
- host-configurable rules
- progressive clue reveal
- first-buzz lockout
- typed answers with variant + typo tolerance
- optional score deductions
- host override transparency
- custom final round with wagers and 3 distinct-category questions

## Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node + Express + WebSocket
- **Shared types/utilities:** TypeScript workspace package
- **Data:** JSON question packs

## Repo layout

```text
apps/
  web/      React client
  server/   Express + ws backend
packages/
  shared/   shared TS types and answer matching helpers
data/
  question-packs/
```

## Quick start

```bash
npm install
npm run dev:server
npm run dev:web
```

Server default:
- http://localhost:3001

Web default:
- http://localhost:5173

## Notes

- Lobbies are in-memory for now.
- Question packs are loaded from `data/question-packs` on server startup.
- This is a serious MVP foundation, not a finished commercial deployment.
- The websocket game engine is authoritative on buzzer order and game state.
