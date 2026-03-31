# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

After every significant change (new feature, bug fix, refactor, config update, etc.):

1. Stage the relevant files (be specific, avoid `git add -A` or `git add .`)
2. Write a descriptive commit message:
   - Subject line: short imperative summary (e.g. "Add user auth middleware")
   - Body: explain *what* changed and *why* (not just how)
   - Include `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
3. Push to `origin master` immediately after committing

Do this automatically without waiting to be asked, unless a change is clearly incomplete or part of a larger in-progress task.

## Commands

```bash
npm run dev      # Start dev server (Vite HMR)
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test runner is configured yet.

## Architecture

Turn-based dungeon game: React + TypeScript + Vite. No backend — all state is client-side.

### State and Engine

All game logic lives in `src/engine/` as **pure functions** — `(state, action) → newState`. No React imports, no side effects. The engine is fully decoupled from rendering.

The master reducer is `src/engine/actions.ts → processPlayerAction(state, action)`. Every player interaction flows through it:
1. Validate action for current phase
2. Apply player action
3. Check win/lose
4. Advance turn (beast moves) if the action is turn-consuming
5. Re-check win/lose

**Turn-consuming actions** (trigger beast move): `MOVE`, `COMBAT_ACTION`, `PICKUP_LOOT`, `USE_EXIT`
**Free actions** (no beast move): `USE_ITEM`, `EQUIP_ITEM`, `CHOOSE_EVENT`

### Game State

`GameState` in `src/types/game.ts` is the single source of truth — plain JSON, serializable (designed for future WebSocket multiplayer). It holds:
- `phase: GamePhase` — `EXPLORING | EVENT | COMBAT | INVENTORY | GAME_OVER | VICTORY`
- `grid: Room[][]` — 8×8 row-major array, each room carries its fog state (`UNDISCOVERED | VISITED | CURRENT`)
- `player`, `beast`, `exitPosition`, `log`, `activeEvent`, `activeCombat`

### React Layer

- `src/store/GameContext.tsx` — `GameProvider` wraps the app; holds `GameState` in `useState`, exposes `dispatch` and `restart`
- `src/store/useGame.ts` — convenience hook; also computes `currentRoom`, `beastHint`, `canUseExit` as derived values (never stored in state)
- `src/App.tsx` — mounts `GameProvider` and `KeyboardController` (WASD/arrow key handler)

### Key Subsystems

| File | Responsibility |
|------|---------------|
| `engine/grid.ts` | BFS pathfinding, position math, `GRID_SIZE = 8` |
| `engine/spawn.ts` | Placement with min-distance constraints (player far from exit and beast) |
| `engine/beast.ts` | BFS move + `getBeastHint()` (direction + Manhattan distance, never exact position) |
| `engine/combat.ts` | Round-based combat, level-up, damage formula |
| `engine/events.ts` | Weighted random event selection, outcome application |
| `engine/fog.ts` | Room state transitions on player move |
| `data/events.ts` | All 15 event definitions + enemy templates (`CULTIST`, `SPAWN`) |
| `data/items.ts` | All item definitions and potion heal amounts |

### Win / Lose

- **Win**: Beast defeated (requires leveling — beast starts at level 5, player at level 1) OR player reaches exit with the Iron Key
- **Lose**: Player HP reaches 0

### Optional: Pixel Art Image Generation

A local Python server in `python/` generates room images via HuggingFace fal-ai.
See `python/README.md` for setup. Start it alongside the dev server:

```bash
cd python && uvicorn image_server:app --port 5001
```

The React side lives entirely in `src/services/imageGen.ts` + a `useEffect` in
`src/components/room/EventCard.tsx`. If the server is not running, nothing breaks.

**To remove:** delete `python/`, `src/services/imageGen.ts`, and revert `EventCard.tsx`.

### String Quoting Note

Use **double quotes** for all narrative text strings in `src/data/events.ts`. Single-quoted strings break if they contain apostrophes (e.g. `"don't"` not `'don\'t'`).
