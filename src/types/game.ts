import type { Room } from './room';
import type { Player, Stats } from './player';
import type { Beast } from './beast';
import type { ActiveEvent } from './room';

export type GamePhase =
  | 'EXPLORING'
  | 'EVENT'
  | 'COMBAT'
  | 'INVENTORY'
  | 'LEVEL_UP'
  | 'MAGIC_BOOK'
  | 'GAME_OVER'
  | 'VICTORY';

export type Position = { row: number; col: number };

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'SAME';

export interface LogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'narration' | 'combat' | 'item' | 'system';
}

export type EnemyBehavior = 'basic' | 'brute' | 'quick';

export interface CombatState {
  enemyId: string;
  enemyStats: Stats;
  enemyName: string;
  enemyBehavior: EnemyBehavior;
  playerTurn: boolean;
  round: number;
  log: string[];
  canFlee: boolean;
  playerDefending: boolean;
  playerHeavyPenalty: boolean;
  enemyCharging: boolean;
  riposteReady: boolean;
  secondWindUsed: boolean; // tracks if Second Wind was already used this combat
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  grid: Room[][];
  player: Player;
  beast: Beast;
  exitPosition: Position;
  log: LogEntry[];
  activeEvent: ActiveEvent | null;
  activeCombat: CombatState | null;
  movedThisTurn: boolean;
  pendingLevelUp: boolean;
  phaseBeforeLevelUp: GamePhase | null;
}
