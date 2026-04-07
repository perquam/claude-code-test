import type { Position, Direction } from './game';
import type { Item, ItemType } from './item';

export type RoomState = 'UNDISCOVERED' | 'VISITED' | 'CURRENT';

export type EventType =
  | 'MERCHANT'
  | 'TRAP'
  | 'SHRINE'
  | 'WOUNDED_TRAVELER'
  | 'MONSTER'
  | 'TREASURE'
  | 'EMPTY'
  | 'LORE'
  | 'MORAL_DILEMMA';

export interface EventOutcome {
  description: string;
  hpDelta?: number;
  xpDelta?: number;
  itemsGained?: ItemType[];
  itemsLost?: ItemType[];
  statModifier?: { attack?: number; defense?: number; maxHp?: number };
  combatTrigger?: string; // monster ID if this choice starts combat
  buffGained?: { type: 'ATTACK' | 'DEFENSE' | 'POISON'; value: number; turnsRemaining: number };
}

export interface EventChoice {
  id: string;
  text: string;
  outcome: EventOutcome;
  requires?: { item?: ItemType; minLevel?: number; minHp?: number };
}

export interface RoomEventTemplate {
  id: string;
  type: EventType;
  title: string;
  description: string;
  choices: EventChoice[];
  isCombat: boolean;
  weight: number;
  minLevel: number;
  maxLevel: number;
}

export interface ActiveEvent {
  roomPosition: Position;
  template: RoomEventTemplate;
  choiceMade: boolean;
  outcomeText: string | null;
}

export interface Room {
  position: Position;
  hasRoom: boolean;        // false = void/wall cell (not part of dungeon)
  state: RoomState;
  isExit: boolean;
  event: RoomEventTemplate | null;
  eventResolved: boolean;
  loot: Item[];
  connections: Direction[]; // functional exits (N/S/E/W only)
}
