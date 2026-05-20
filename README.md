# Web Trivia

A real-time multiplayer trivia game. Hosts create rooms, players join by code, and everyone competes across multiple game modes.

## Game Modes

| Mode | How it works |
|---|---|
| **Classic** | Everyone sees the question and types an answer before the timer expires |
| **Speed** | Race to be the first player to type the correct answer |
| **Multiple Choice** | Pick from four options before the timer expires |
| **Fastest Finger** | Buzz in first to claim the right to answer; wrong answers pass to remaining players |

Typed-answer modes use fuzzy matching — case-insensitive, typo-tolerant, and partial names (e.g. "Napoleon") are accepted.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Real-time / DB | Firebase Firestore |
| Auth | Firebase Auth (email/password + anonymous guest mode) |
| Server logic | Firebase Cloud Functions |
| Hosting | Firebase Hosting |

## Local Development

### Prerequisites

- Node.js 18+
- Java 11+ (required by Firebase emulators)
- Firebase CLI: `npm install -g firebase-tools`

### Running locally

```bash
# Install dependencies
npm install

# Terminal 1 — Firebase emulators (Auth + Firestore + Functions)
firebase emulators:start

# Terminal 2 — Vite dev server
npm run dev
```

The app automatically connects to local emulators in development mode. No Firebase project or credentials are needed for local development.

### Dev admin account

A quick-fill button labeled **[DEV] Fill admin credentials** appears on the sign-in modal in development mode. Use it to log in as the admin account without typing:

| Field | Value |
|---|---|
| Email | `admin@webtrivia.dev` |
| Password | `Admin1234!` |

**First-time setup:** create this account once via the "Create Account" flow (or the Firebase Emulator UI at http://localhost:4000/auth), then it can be used for all future dev sessions.

### Environment variables

Credentials are only needed when deploying to production. Copy the example file and fill in your Firebase project values:

```bash
cp .env.example .env.local
```

## Project Structure

```
src/
  components/
    auth/     Route guards (RequireAuth, RedirectIfAuth)
    ui/       Reusable primitives — Button, Input, Card, LoadingScreen
  context/
    AuthContext.tsx   Auth state + sign-in / sign-up / upgrade methods
  hooks/        Game and utility hooks (added as features are built)
  lib/
    firebase.ts   Firebase init; connects to emulators automatically in dev
  pages/        One file per route
  types/
    game.ts       Room, Player, GameSettings, CurrentQuestion
    question.ts   TypedQuestion, MultipleChoiceQuestion, QuestionSet
  utils/
    authErrors.ts   Firebase error codes → readable messages
    sanitize.ts     Input sanitization for user-supplied content
```
