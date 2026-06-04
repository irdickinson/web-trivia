# Web Trivia

**▶ Play it live: https://web-trivia-next.web.app**

A real-time multiplayer trivia game in the style of Jeopardy. Hosts create a room, players join with a 6-character code, and everyone competes live across several game modes. A wager-based Final Round closes out the game.

## Game modes

| Mode | How it works |
|---|---|
| **Classic** | Everyone sees the clue and types an answer at the same time; every correct answer scores. |
| **Jeopardy** | Buzz in before anyone else to claim the clue, then answer solo. Wrong answers can rebound to the remaining players. |
| **Multiple Choice** | Choose from four options; everyone answers at once. |
| **Speed** | First player to type a correct answer wins the clue. |

Typed-answer modes use fuzzy matching in `src/lib/fuzzy.ts` — case-insensitive, typo-tolerant, and accepting of partial names (e.g. "Roosevelt" matches "Theodore Roosevelt").

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript 5.8 + Vite 6 |
| Styling | Tailwind CSS v4 (layout only) + a custom CSS design system in `src/index.css` |
| Routing | React Router v7 |
| Real-time / DB | Firebase Firestore |
| Auth | Firebase Auth (email/password + anonymous guest mode) |

There is no backend server. All game state lives in a single Firestore room document at `rooms/{code}`; the **host's client** drives every timer-based transition and writes the result, while other clients render the shared state and submit their own actions. Atomic operations (first-buzz-wins, room joins) use Firestore transactions.

## Local development

### Prerequisites

- Node.js 18+
- Java 11+ (required by the Firebase emulators)
- Firebase CLI: `npm install -g firebase-tools`

### Running locally

```bash
npm install

# Terminal 1 — Firebase emulators (Auth + Firestore)
firebase emulators:start

# Terminal 2 — Vite dev server
npm run dev
```

In development (`import.meta.env.DEV`) the app points itself at the local emulators automatically — no Firebase project or credentials are required.

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| Emulator UI | http://localhost:4000 |
| Auth emulator | 127.0.0.1:9099 |
| Firestore emulator | 127.0.0.1:8180 |

### Dev admin account

A **[DEV] Fill admin credentials** button appears on the sign-in modal in development. It fills `admin@webtrivia.dev` / `Admin1234!`. Create the account once via the Create Account flow (or the Emulator UI at http://localhost:4000/auth); it persists for future dev sessions while the emulator data is retained.

## Project structure

```
src/
  App.tsx                  Router + SiteLayout shell + auth-modal provider
  index.css                Full design system (tokens, layout, components)

  context/
    AuthContext.tsx        Firebase auth state + sign-in/up/guest helpers
    AuthModalContext.tsx    Auth modal open/tab state

  pages/
    Home.tsx               Landing hero (guest/sign-in) and signed-in dashboard
    Lobby.tsx              Create / join a room + game settings
    Room.tsx               Waiting room -> game -> finished
    UpgradeAccount.tsx     Guest -> email account upgrade

  components/
    auth/                  AuthModal, RequireAuth route guard
    layout/SiteHeader.tsx  Sticky navbar
    game/                  JeopardyGame (orchestrator), BoardView, ClueView,
                           OutcomeCard, FinalRound, GameFinished
    room/                  RoomCode, PlayerList
    ui/                    BackdropOrb, LoadingScreen

  lib/
    firebase.ts            App init + emulator wiring
    rooms.ts               createRoom / joinRoom / leaveRoom + DEFAULT_SETTINGS
    game.ts                All game-state mutations (selectClue, buzz,
                           submitAnswer, resolveClassicClue, final round, ...)
    audio.ts               Web Audio API procedural music + SFX
    fuzzy.ts               Answer evaluation

  hooks/
    useRoom.ts             Firestore room listener
    useGameClock.ts        Shared deadline countdown clock
    useAudio.ts            Music/SFX controls

  types/                   game.ts, question.ts
  data/
    authoring.ts           definePack() authoring helper
    packs/                 Question packs + registry (index.ts, classic.ts, ...)
```

Questions ship as **packs** under `src/data/packs/`. Each pack is authored with `definePack()` (`src/data/authoring.ts`) as categories of clues ordered easiest → hardest; ids, difficulty, and dollar values are derived from position. Hosts can select one or more packs per room, and boards are built deterministically from a seed (`src/lib/rng.ts`) so the same seed + packs always produce the same board. Adding a pack is copying a file in `src/data/packs/` and registering it in `index.ts`; `classic.ts` is the annotated template.

## Deployment

Hosted on **Firebase Hosting** (free Spark plan) at https://web-trivia-next.web.app. Production builds read `VITE_FIREBASE_*` env vars and talk to the live Firebase project; in dev the app auto-targets the local emulators instead. Deploy with `npm run build` then `firebase deploy`.

## Design

Dark, warm "dusty-dusk" theme over a fixed landscape backdrop, with Fraunces as the site-wide serif. Visual styling lives in `src/index.css` outside any `@layer` so it takes precedence over Tailwind; Tailwind is used only for layout utilities. Avoid Tailwind colour/background utilities in components — use the CSS variables and classes defined in `index.css`.
