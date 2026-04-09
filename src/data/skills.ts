import type { SkillId, SkillTier } from '../types/skill';

export interface SkillInfo {
  id: SkillId;
  name: string;
  icon: string;
  description: string;
  tierDescriptions: Record<SkillTier, string>;
}

export const SKILL_DEFINITIONS: Record<SkillId, SkillInfo> = {
  WISDOM: {
    id: 'WISDOM',
    name: 'Wisdom',
    icon: '\u{1F4D6}',
    description: 'Allows learning harder spells.',
    tierDescriptions: {
      0: 'Cannot learn spells.',
      1: 'Can learn beginner spells.',
      2: 'Can learn intermediate spells.',
      3: 'Can learn master spells.',
    },
  },
  MYSTICISM: {
    id: 'MYSTICISM',
    name: 'Mysticism',
    icon: '\u{1F52E}',
    description: 'Regenerates mana each turn.',
    tierDescriptions: {
      0: 'No mana regeneration.',
      1: '+1 mana per turn.',
      2: '+2 mana per turn.',
      3: '+4 mana per turn.',
    },
  },
  OFFENSE: {
    id: 'OFFENSE',
    name: 'Offense',
    icon: '\u{2694}\u{FE0F}',
    description: 'Permanent attack bonus.',
    tierDescriptions: { 0: '+0 ATK', 1: '+2 ATK', 2: '+4 ATK', 3: '+7 ATK' },
  },
  DEFENSE: {
    id: 'DEFENSE',
    name: 'Defense',
    icon: '\u{1F6E1}\u{FE0F}',
    description: 'Permanent defense bonus.',
    tierDescriptions: { 0: '+0 DEF', 1: '+2 DEF', 2: '+4 DEF', 3: '+7 DEF' },
  },
  STAMINA: {
    id: 'STAMINA',
    name: 'Stamina',
    icon: '\u{1F3C3}',
    description: 'Move 2 rooms in one turn (cooldown-based).',
    tierDescriptions: {
      0: 'No double move.',
      1: 'Double move, 15-turn cooldown.',
      2: 'Double move, 10-turn cooldown.',
      3: 'Double move, 6-turn cooldown.',
    },
  },
  MAGICAL_POWER: {
    id: 'MAGICAL_POWER',
    name: 'Magical Power',
    icon: '\u{2728}',
    description: 'Spells hit harder.',
    tierDescriptions: {
      0: 'No spell bonus.',
      1: '+25% spell power.',
      2: '+50% spell power.',
      3: '+100% spell power.',
    },
  },
};

export const ALL_SKILL_IDS: SkillId[] = [
  'WISDOM', 'MYSTICISM', 'OFFENSE', 'DEFENSE', 'STAMINA', 'MAGICAL_POWER',
];

export function getOffenseBonus(tier: SkillTier): number {
  return [0, 2, 4, 7][tier];
}

export function getDefenseBonus(tier: SkillTier): number {
  return [0, 2, 4, 7][tier];
}

export function getMysticismRegen(tier: SkillTier): number {
  return [0, 1, 2, 4][tier];
}

export function getStaminaCooldown(tier: SkillTier): number {
  return [0, 15, 10, 6][tier];
}

export function getMagicalPowerMultiplier(tier: SkillTier): number {
  return [1.0, 1.25, 1.5, 2.0][tier];
}
