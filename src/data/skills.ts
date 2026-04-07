export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  statChanges: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    critBonus?: number;
  };
}

// Skills offered at each level milestone (pick 1 of 2)
export const SKILL_OPTIONS: Record<number, [SkillDefinition, SkillDefinition]> = {
  2: [
    {
      id: 'POWER_STRIKE',
      name: 'Power Strike',
      description: 'Heavy Attack has a 20% chance to stun the enemy, skipping their turn.',
      statChanges: { attack: 1 },
    },
    {
      id: 'IRON_WILL',
      name: 'Iron Will',
      description: 'Defend now blocks 75% of incoming damage instead of 60%.',
      statChanges: { defense: 1 },
    },
  ],
  3: [
    {
      id: 'RIPOSTE_MASTER',
      name: 'Riposte Master',
      description: 'Your riposte after defending deals double damage instead of 1.5x.',
      statChanges: { attack: 1 },
    },
    {
      id: 'SECOND_WIND',
      name: 'Second Wind',
      description: 'Once per combat, auto-heal 20% of your max HP when dropping below 25%.',
      statChanges: { maxHp: 5 },
    },
  ],
  4: [
    {
      id: 'EXECUTIONER',
      name: 'Executioner',
      description: 'Deal double damage to enemies below 30% HP.',
      statChanges: { attack: 2 },
    },
    {
      id: 'FORTRESS',
      name: 'Fortress',
      description: 'Permanent +3 DEF. You become nearly immovable.',
      statChanges: { defense: 3 },
    },
  ],
};
