import type { SkillId, SkillTier, SkillMap } from '../types/skill';

export function createInitialSkills(): SkillMap {
  return {
    WISDOM: 0,
    MYSTICISM: 0,
    OFFENSE: 0,
    DEFENSE: 0,
    STAMINA: 0,
    MAGICAL_POWER: 0,
  };
}

export function upgradeSkill(skills: SkillMap, skillId: SkillId): SkillMap {
  const current = skills[skillId];
  if (current >= 3) return skills;
  return { ...skills, [skillId]: (current + 1) as SkillTier };
}

export function canUpgradeSkill(skills: SkillMap, skillId: SkillId): boolean {
  return skills[skillId] < 3;
}
