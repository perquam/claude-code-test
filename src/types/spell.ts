import type { SkillTier } from './skill';

export type SpellId = string;

export type SpellTarget = 'ENEMY' | 'SELF';

export interface SpellEffect {
  target: SpellTarget;
  damage?: number;
  healing?: number;
  buffGranted?: { type: 'ATTACK' | 'DEFENSE'; value: number; turnsRemaining: number };
  debuffGranted?: { type: 'POISON'; value: number; turnsRemaining: number };
  special?: 'RESURRECT'; // auto-revive buff
}

export interface SpellDefinition {
  id: SpellId;
  name: string;
  icon: string;
  description: string;
  manaCost: number;
  requiredWisdom: SkillTier;
  effect: SpellEffect;
}

export interface LearnedSpell {
  id: SpellId;
}
