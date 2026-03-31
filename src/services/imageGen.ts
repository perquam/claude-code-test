import type { EventType } from '../types/room';

const SERVER = 'http://localhost:5001';
const cache = new Map<string, string>();

const TYPE_PREFIX: Record<EventType, string> = {
  MERCHANT: 'market stall trader dungeon',
  TRAP: 'trap mechanism stone floor dungeon',
  SHRINE: 'mystical shrine glowing runes dungeon',
  WOUNDED_TRAVELER: 'wounded traveler NPC dungeon corridor',
  MONSTER: 'monster encounter dungeon',
  TREASURE: 'treasure chest gold dungeon',
  LORE: 'ancient mural stone wall dungeon',
  EMPTY: 'empty stone chamber dungeon corridor',
};

const SUFFIX = 'pixel art, 2D game sprite, 16-bit style, dungeon fantasy';

export async function generateRoomImage(
  cacheKey: string,
  type: EventType,
  title: string,
  description: string,
): Promise<string | null> {
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const prompt = `${TYPE_PREFIX[type]}, ${title}, ${description}, ${SUFFIX}`;

  try {
    const res = await fetch(`${SERVER}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return null;
    const { image } = await res.json();
    cache.set(cacheKey, image);
    return image;
  } catch {
    return null;
  }
}
