import type { Item } from './item';
import type { Position } from './game';
import type { SkillMap } from './skill';
import type { LearnedSpell } from './spell';

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
  mana: number;
  maxMana: number;
  gold: number;
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
  skills: SkillMap;
  spells: LearnedSpell[];
  hasMagicBook: boolean;
  staminaCooldown: number; // turns until double-move available (0 = ready)
}
