export type ItemType =
  | 'WEAPON_DAGGER'
  | 'WEAPON_SWORD'
  | 'WEAPON_AXE'
  | 'WEAPON_CURSED_BLADE'
  | 'ARMOR_LEATHER'
  | 'ARMOR_CHAINMAIL'
  | 'ARMOR_PLATE'
  | 'POTION_HEALTH_SMALL'
  | 'POTION_HEALTH_LARGE'
  | 'POTION_STRENGTH'
  | 'POTION_IRON_SKIN'
  | 'POTION_ANTIDOTE'
  | 'KEY'
  | 'GOLD'
  | 'RELIC'
  | 'SCROLL_IDENTIFY'
  | 'TRAP_DISARM_KIT';

export interface WeaponStats {
  attackBonus: number;
  critChance: number; // 0.0–1.0
  hpDrainPerTurn?: number; // cursed weapons drain HP each turn
}

export interface ArmorStats {
  defenseBonus: number;
  damageReduction: number; // flat reduction per hit
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
}
