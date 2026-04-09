export type SkillId =
  | 'WISDOM'
  | 'MYSTICISM'
  | 'OFFENSE'
  | 'DEFENSE'
  | 'STAMINA'
  | 'MAGICAL_POWER';

export type SkillTier = 0 | 1 | 2 | 3; // 0=none, 1=beginner, 2=intermediate, 3=master

export const SKILL_TIER_LABELS: Record<SkillTier, string> = {
  0: 'None',
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Master',
};

export type SkillMap = Record<SkillId, SkillTier>;
