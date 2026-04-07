import type { GameState } from '../types/game';
import type { BeastHint } from '../types/beast';
import type { Position } from '../types/game';
import type { Room } from '../types/room';
import { bfsOnGrid, getDirectionBetween, getManhattanDistance, posEqual, dirToPos, isValid } from './grid';

export function getBeastHint(playerPos: Position, beastPos: Position, isTracking: boolean): BeastHint | null {
  if (!isTracking) return null;
  const direction = getDirectionBetween(playerPos, beastPos);
  const distance = getManhattanDistance(playerPos, beastPos);
  const label =
    direction === 'SAME'
      ? 'The Warden is HERE'
      : `The Warden hunts you from the ${direction} (${distance} room${distance !== 1 ? 's' : ''})`;
  return { direction, distance, label };
}

export function computeTrackingChance(distance: number): number {
  if (distance <= 1) return 0.9;
  if (distance >= 7) return 0.1;
  // Linear interpolation from d=2 (0.8) to d=7 (0.1)
  return 0.8 - (distance - 2) * 0.14;
}

export function computeRandomBeastMove(beastPos: Position, grid: Room[][]): Position {
  const room = grid[beastPos.row][beastPos.col];
  const validMoves = room.connections
    .map(dir => dirToPos(beastPos, dir))
    .filter(p => isValid(p) && grid[p.row][p.col].hasRoom);
  if (validMoves.length === 0) return beastPos;
  return validMoves[Math.floor(Math.random() * validMoves.length)];
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

  const distance = getManhattanDistance(state.beast.position, state.player.position);
  const trackChance = computeTrackingChance(distance);
  const isTracking = Math.random() < trackChance;

  const nextPos = isTracking
    ? computeNextBeastPosition(state.beast.position, state.player.position, state)
    : computeRandomBeastMove(state.beast.position, state.grid);

  const newPath = isTracking
    ? bfsOnGrid(nextPos, state.player.position, state.grid)
    : [];

  return {
    ...state,
    beast: {
      ...state.beast,
      position: nextPos,
      pathToPlayer: newPath,
      isTracking,
    },
  };
}

export function isBeastOnPlayer(state: GameState): boolean {
  return posEqual(state.beast.position, state.player.position);
}
