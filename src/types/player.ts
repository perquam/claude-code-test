import type { Item } from './item';
import type { Position } from './game';

export interface Buff {
  type: 'ATTACK' | 'DEFENSE' | 'POISON';
  value: number;
  turnsRemaining: number;
}

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  critBonus: number; // additive crit chance from level-up skills
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Player {
  position: Position;
  stats: Stats;
  inventory: Item[];
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  hasKey: boolean;
  buffs: Buff[];
  abilities: string[]; // unlocked skill IDs
}
