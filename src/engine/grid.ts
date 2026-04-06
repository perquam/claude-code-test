import type { Position, Direction } from '../types/game';
import type { Room } from '../types/room';

export const GRID_SIZE = 14;

export const CARDINAL_DELTAS: Record<string, Position> = {
  N: { row: -1, col:  0 },
  S: { row:  1, col:  0 },
  W: { row:  0, col: -1 },
  E: { row:  0, col:  1 },
};

export function dirToPos(from: Position, dir: string): Position {
  const d = CARDINAL_DELTAS[dir];
  return { row: from.row + d.row, col: from.col + d.col };
}

export function positionToIndex(pos: Position): number {
  return pos.row * GRID_SIZE + pos.col;
}

export function indexToPosition(index: number): Position {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE };
}

export function isValid(pos: Position): boolean {
  return pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE;
}

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function getManhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function getNeighbors(pos: Position): Position[] {
  return Object.values(CARDINAL_DELTAS)
    .map(d => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(isValid);
}

export function getDirectionBetween(from: Position, to: Position): Direction {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  if (rowDiff === 0 && colDiff === 0) return 'SAME';
  const angle = (Math.atan2(colDiff, -rowDiff) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  if (normalized < 22.5 || normalized >= 337.5) return 'N';
  if (normalized < 67.5) return 'NE';
  if (normalized < 112.5) return 'E';
  if (normalized < 157.5) return 'SE';
  if (normalized < 202.5) return 'S';
  if (normalized < 247.5) return 'SW';
  if (normalized < 292.5) return 'W';
  return 'NW';
}

/** BFS on an explicit grid, following room.connections. Returns shortest path or []. */
export function bfsOnGrid(from: Position, to: Position, grid: Room[][], blocked: Position[] = []): Position[] {
  if (posEqual(from, to)) return [from];
  const blockedSet = new Set(blocked.map(posKey));
  const queue: Position[][] = [[from]];
  const visited = new Set<string>([posKey(from)]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    const room = grid[current.row][current.col];
    const neighbors = room.connections
      .map(dir => dirToPos(current, dir))
      .filter(p => isValid(p) && grid[p.row][p.col].hasRoom);

    for (const neighbor of neighbors) {
      const key = posKey(neighbor);
      if (visited.has(key) || blockedSet.has(key)) continue;
      const newPath = [...path, neighbor];
      if (posEqual(neighbor, to)) return newPath;
      visited.add(key);
      queue.push(newPath);
    }
  }
  return [];
}

/** Legacy BFS on implicit grid (all valid cardinal neighbors). */
export function bfs(from: Position, to: Position, blocked: Position[] = []): Position[] {
  if (posEqual(from, to)) return [from];
  const blockedSet = new Set(blocked.map(posKey));
  const queue: Position[][] = [[from]];
  const visited = new Set<string>([posKey(from)]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    for (const neighbor of getNeighbors(current)) {
      const key = posKey(neighbor);
      if (visited.has(key) || blockedSet.has(key)) continue;
      const newPath = [...path, neighbor];
      if (posEqual(neighbor, to)) return newPath;
      visited.add(key);
      queue.push(newPath);
    }
  }
  return [];
}

/** All positions in the grid as a flat array */
export function allPositions(): Position[] {
  const out: Position[] = [];
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      out.push({ row: r, col: c });
  return out;
}
