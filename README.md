# Escape Room Software

A React + Socket.IO application for running an escape room timer and hint system with two views:
- `Controller` view for game masters
- `Player` view for participants

## What It Does

- Runs a shared countdown timer (default: 60 minutes)
- Lets the controller start, pause, and reset the game
- Lets the controller send hints to all connected player screens
- Loads prewritten hints from `public/hints.json`
- Syncs timer/hint state to newly connected clients through the Socket.IO server

## Tech Stack

- Frontend: React (Create React App), TypeScript/TSX, React Router
- Realtime transport: Socket.IO client/server
- Backend runtime: Node.js + Express + Socket.IO

## Project Structure

- `src/App.tsx` route setup (`/controller`, `/player`)
- `src/Controller.tsx` game master controls
- `src/PlayerView.tsx` player-facing timer and hint display
- `public/hints.json` predefined hints
- `server.js` Socket.IO server (port `3001`)

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Install

```bash
npm install
```

## Run Locally

You need two terminals.

1. Start the React frontend (port `3000`):

```bash
npm start
```

2. Start the Socket.IO server (port `3001`):

```bash
node server.js
```

Then open:
- Controller: `http://localhost:3000/controller`
- Player screen: `http://localhost:3000/player`

## Controller Shortcuts

In `Controller` view:

- `Ctrl + Shift + S`: Start timer
- `Ctrl + Shift + P`: Pause timer
- `Ctrl + Shift + R`: Reset timer + clear hint
- `Ctrl + Shift + H`: Show currently selected hint
- `Ctrl + Shift + C`: Clear hint

## Hint Configuration

Hints are loaded from `public/hints.json`.

Current format:

```json
[
  {
    "id": 1,
    "title": "First hint",
    "text": "Hint message"
  }
]
```

Controller renders each hint as `"<title>: <text>"` in the dropdown.

## Notes

- `server.js` now handles `startGame`, `pauseGame`, and `resetGame` events.
- The player view follows server timer updates (no local countdown loop), so pause stays in sync across screens.

## Build

```bash
npm run build
```

## Test

```bash
npm test
```
