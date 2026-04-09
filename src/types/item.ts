import type { ItemRarity } from './rarity';
import type { SkillId, SkillTier } from './skill';
import type { SpellId } from './spell';

export type ItemType =
  | 'WEAPON_DAGGER'
  | 'WEAPON_SWORD'
  | 'WEAPON_AXE'
  | 'WEAPON_CURSED_BLADE'
  | 'WEAPON_ARCANE_WAND'
  | 'WEAPON_SOULREAPER'
  | 'ARMOR_LEATHER'
  | 'ARMOR_CHAINMAIL'
  | 'ARMOR_PLATE'
  | 'ARMOR_ARCHMAGE_ROBE'
  | 'POTION_HEALTH_SMALL'
  | 'POTION_HEALTH_LARGE'
  | 'POTION_STRENGTH'
  | 'POTION_IRON_SKIN'
  | 'POTION_ANTIDOTE'
  | 'POTION_MANA'
  | 'KEY'
  | 'GOLD'
  | 'RELIC'
  | 'SCROLL_IDENTIFY'
  | 'TRAP_DISARM_KIT'
  | 'MAGIC_BOOK'
  | 'SPELL_SCROLL'
  | 'CROWN_OF_KINGS';

export interface WeaponStats {
  attackBonus: number;
  critChance: number; // 0.0–1.0
  hpDrainPerTurn?: number; // cursed weapons drain HP each turn
}

export interface ArmorStats {
  defenseBonus: number;
  damageReduction: number; // flat reduction per hit
}

export interface LegendaryBonus {
  skillGrant?: { skill: SkillId; tier: SkillTier };
}

export interface Item {
  id: string; // UUID instance
  type: ItemType;
  name: string;
  icon: string; // emoji icon for display
  description: string;
  stats?: WeaponStats | ArmorStats;
  consumable: boolean;
  value: number; // gold value for merchant events
  rarity: ItemRarity;
  legendaryBonus?: LegendaryBonus;
  spellContained?: SpellId; // for SPELL_SCROLL items
}
