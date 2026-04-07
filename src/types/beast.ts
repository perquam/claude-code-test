import type { Position, Direction } from './game';
import type { Stats } from './player';

export interface Beast {
  position: Position;
  stats: Stats;
  isDefeated: boolean;
  pathToPlayer: Position[];
  isTracking: boolean;
}

export interface BeastHint {
  direction: Direction;
  distance: number; // Manhattan distance
  label: string;
}
