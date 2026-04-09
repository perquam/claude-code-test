export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export const RARITY_COLORS: Record<ItemRarity, string> = {
  COMMON: '#9d9d9d',
  UNCOMMON: '#1eff00',
  RARE: '#0070dd',
  LEGENDARY: '#ff8000',
};
