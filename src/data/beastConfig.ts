import type { Stats } from '../types/player';

export const BEAST_BASE_STATS: Stats = {
  hp: 80,
  maxHp: 80,
  attack: 18,
  defense: 8,
  critBonus: 0,
  level: 5,
  xp: 0,
  xpToNextLevel: 9999, // beast doesn't level up
};

// The beast is defeatable only when player reaches level >= this
export const BEAST_MIN_PLAYER_LEVEL_TO_FIGHT = 3;

// XP reward for defeating the beast
export const BEAST_XP_REWARD = 100;
