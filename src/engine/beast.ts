import type { GameState } from '../types/game';
import type { BeastHint } from '../types/beast';
import type { Position } from '../types/game';
import { bfsOnGrid, getDirectionBetween, getManhattanDistance, posEqual } from './grid';

export function getBeastHint(playerPos: Position, beastPos: Position): BeastHint {
  const direction = getDirectionBetween(playerPos, beastPos);
  const distance = getManhattanDistance(playerPos, beastPos);
  const label =
    direction === 'SAME'
      ? 'The Warden is HERE'
      : `The Warden is ${distance} room${distance !== 1 ? 's' : ''} ${direction}`;
  return { direction, distance, label };
}

export function computeNextBeastPosition(
  beastPos: Position,
  playerPos: Position,
  state: GameState,
): Position {
  const path = bfsOnGrid(beastPos, playerPos, state.grid);
  // path[0] = beastPos, path[1] = first step toward player
  if (path.length >= 2) return path[1];
  return beastPos;
}

export function moveBeast(state: GameState): GameState {
  if (state.beast.isDefeated) return state;

  const nextPos = computeNextBeastPosition(state.beast.position, state.player.position, state);
  const newPath = bfsOnGrid(nextPos, state.player.position, state.grid);

  return {
    ...state,
    beast: {
      ...state.beast,
      position: nextPos,
      pathToPlayer: newPath,
    },
  };
}

export function isBeastOnPlayer(state: GameState): boolean {
  return posEqual(state.beast.position, state.player.position);
}
