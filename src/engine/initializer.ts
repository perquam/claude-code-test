import { v4 as uuid } from 'uuid';
import type { GameState } from '../types/game';
import type { Room, RoomEventTemplate } from '../types/room';
import type { Player } from '../types/player';
import type { Beast } from '../types/beast';
import { GRID_SIZE, posEqual, isValid, posKey, CARDINAL_DELTAS } from './grid';
import { generateSpawnPositions } from './spawn';
import { BEAST_BASE_STATS } from '../data/beastConfig';
import { EVENT_POOL } from '../data/events';
import { ITEM_DEFINITIONS } from '../data/items';
import type { Item, ItemType } from '../types/item';
import type { Direction, Position } from '../types/game';

function makeItem(type: ItemType): Item {
  return { ...ITEM_DEFINITIONS[type], id: uuid() };
}

function getCardinalNeighbors(pos: Position): Position[] {
  return Object.values(CARDINAL_DELTAS)
    .map(d => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(isValid);
}

function cardinalDir(from: Position, to: Position): 'N' | 'S' | 'E' | 'W' {
  if (to.row < from.row) return 'N';
  if (to.row > from.row) return 'S';
  if (to.col < from.col) return 'W';
  return 'E';
}

function oppositeDir(dir: 'N' | 'S' | 'E' | 'W'): 'N' | 'S' | 'E' | 'W' {
  return ({ N: 'S', S: 'N', E: 'W', W: 'E' } as const)[dir];
}

function pickRandomEvent(): RoomEventTemplate {
  const pool = EVENT_POOL;
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const tmpl of pool) {
    r -= tmpl.weight;
    if (r <= 0) return { ...tmpl };
  }
  return { ...pool[pool.length - 1] };
}

/** Generate a dungeon graph using Prim's randomized maze algorithm.
 *  Returns a sparse GRID_SIZE×GRID_SIZE grid; cells with hasRoom=false are voids. */
function generateDungeonGraph(): Room[][] {
  const TARGET_ROOMS = 72;

  // All cells start as void
  const grid: Room[][] = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => ({
      position: { row, col },
      hasRoom: false,
      state: 'UNDISCOVERED' as const,
      isExit: false,
      event: null,
      eventResolved: false,
      loot: [],
      connections: [] as Direction[],
    })),
  );

  // Prim's: start from center, expand until TARGET_ROOMS
  const start: Position = { row: Math.floor(GRID_SIZE / 2), col: Math.floor(GRID_SIZE / 2) };
  grid[start.row][start.col].hasRoom = true;
  const visited = new Set<string>([posKey(start)]);
  const frontier: { pos: Position; from: Position }[] = getCardinalNeighbors(start).map(n => ({ pos: n, from: start }));

  while (visited.size < TARGET_ROOMS && frontier.length > 0) {
    const idx = Math.floor(Math.random() * frontier.length);
    const { pos, from } = frontier.splice(idx, 1)[0];
    if (visited.has(posKey(pos))) continue;

    visited.add(posKey(pos));
    grid[pos.row][pos.col].hasRoom = true;

    // Connect pos ↔ from
    const dir = cardinalDir(from, pos);
    const opp = oppositeDir(dir);
    if (!grid[from.row][from.col].connections.includes(dir))
      grid[from.row][from.col].connections.push(dir);
    if (!grid[pos.row][pos.col].connections.includes(opp))
      grid[pos.row][pos.col].connections.push(opp);

    for (const n of getCardinalNeighbors(pos)) {
      if (!visited.has(posKey(n))) frontier.push({ pos: n, from: pos });
    }
  }

  // Add ~25% extra cross-connections to create loops (prevents pure tree / long dead corridors)
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const room = grid[row][col];
      if (!room.hasRoom) continue;
      for (const [dir, delta] of Object.entries(CARDINAL_DELTAS)) {
        const nPos = { row: row + delta.row, col: col + delta.col };
        if (!isValid(nPos)) continue;
        const nRoom = grid[nPos.row][nPos.col];
        if (!nRoom.hasRoom) continue;
        if (room.connections.includes(dir as Direction)) continue;
        if (Math.random() >= 0.25) continue;
        const opp = oppositeDir(dir as 'N' | 'S' | 'E' | 'W');
        room.connections.push(dir as Direction);
        nRoom.connections.push(opp);
      }
    }
  }

  return grid;
}

/** Assign events, exit marker, and key loot to actual room cells. */
function distributeEvents(grid: Room[][], exitPos: Position, keyPos: Position): void {
  const lootOptions: ItemType[] = ['GOLD', 'POTION_HEALTH_SMALL', 'WEAPON_DAGGER', 'ARMOR_LEATHER'];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const room = grid[row][col];
      if (!room.hasRoom) continue;
      const pos = { row, col };

      if (posEqual(pos, exitPos)) {
        room.isExit = true;
        continue;
      }

      const roll = Math.random();
      if (roll < 0.55) {
        room.event = pickRandomEvent();
      } else if (roll < 0.90) {
        if (posEqual(pos, keyPos)) {
          room.loot.push(makeItem('KEY'));
        } else {
          room.loot.push(makeItem(lootOptions[Math.floor(Math.random() * lootOptions.length)]));
        }
      }
    }
  }

  // Guarantee key is placed
  const keyRoom = grid[keyPos.row][keyPos.col];
  if (!keyRoom.loot.some(i => i.type === 'KEY')) {
    keyRoom.loot.push(makeItem('KEY'));
    keyRoom.event = null;
  }
}

const INTRO_EVENT: RoomEventTemplate = {
  id: 'DUNGEON_ENTRANCE',
  type: 'EMPTY',
  title: 'The Awakening',
  description:
    "You awaken in darkness. The stone is cold beneath your hands. Somewhere deep within the dungeon, something stirs — a presence that has hunted these halls for centuries. You must find the Iron Key and escape before it finds you.",
  choices: [
    {
      id: 'start_explore',
      text: 'Rise to your feet and explore',
      outcome: {
        description:
          'You push yourself upright. Torchlight flickers across ancient stone. The hunt begins.',
      },
    },
  ],
  isCombat: false,
  weight: 0,
  minLevel: 1,
  maxLevel: 99,
};

export function createInitialGameState(): GameState {
  // 1. Generate dungeon graph
  const grid = generateDungeonGraph();
  const roomPositions = grid.flat().filter(r => r.hasRoom).map(r => r.position);

  // 2. Pick spawn positions from actual rooms
  const { playerStart, beastStart, exitPosition, keyPosition } = generateSpawnPositions(roomPositions);

  // 3. Distribute events + exit + key
  distributeEvents(grid, exitPosition, keyPosition);

  // 4. Set up starting room with intro event
  const startRoom = grid[playerStart.row][playerStart.col];
  startRoom.state = 'CURRENT';
  startRoom.event = INTRO_EVENT;
  startRoom.eventResolved = false;

  const player: Player = {
    position: playerStart,
    stats: {
      hp: 30,
      maxHp: 30,
      attack: 5,
      defense: 2,
      critBonus: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 30,
    },
    inventory: [makeItem('POTION_HEALTH_SMALL')],
    equippedWeapon: null,
    equippedArmor: null,
    hasKey: false,
    buffs: [],
    abilities: [],
  };

  const beast: Beast = {
    position: beastStart,
    stats: { ...BEAST_BASE_STATS },
    isDefeated: false,
    pathToPlayer: [],
    isTracking: false,
  };

  return {
    phase: 'EVENT',
    turn: 0,
    grid,
    player,
    beast,
    exitPosition,
    log: [],
    activeEvent: {
      roomPosition: playerStart,
      template: INTRO_EVENT,
      choiceMade: false,
      outcomeText: null,
    },
    activeCombat: null,
    movedThisTurn: false,
    pendingLevelUp: false,
    phaseBeforeLevelUp: null,
  };
}
