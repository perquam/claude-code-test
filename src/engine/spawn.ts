import type { Position } from '../types/game';
import { getManhattanDistance, posEqual } from './grid';

interface SpawnPositions {
  playerStart: Position;
  beastStart: Position;
  exitPosition: Position;
  keyPosition: Position;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSpawnPositions(roomPositions: Position[]): SpawnPositions {
  const all = roomPositions;
  const MAX_ATTEMPTS = 400;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const exit = randomFrom(all);
    const keyPool = all.filter(p => getManhattanDistance(p, exit) >= 5 && !posEqual(p, exit));
    if (keyPool.length === 0) continue;
    const key = randomFrom(keyPool);

    const beastPool = all.filter(
      p => getManhattanDistance(p, exit) >= 4 && !posEqual(p, exit) && !posEqual(p, key),
    );
    if (beastPool.length === 0) continue;
    const beast = randomFrom(beastPool);

    const playerPool = all.filter(
      p =>
        getManhattanDistance(p, exit) >= 6 &&
        getManhattanDistance(p, beast) >= 7 &&   // warden starts well away from player
        !posEqual(p, exit) &&
        !posEqual(p, key) &&
        !posEqual(p, beast),
    );
    if (playerPool.length === 0) continue;
    const player = randomFrom(playerPool);

    return { playerStart: player, beastStart: beast, exitPosition: exit, keyPosition: key };
  }

  // Fallback: spread across actual room list
  const q = Math.floor(all.length / 4);
  return {
    playerStart: all[0],
    beastStart: all[all.length - 1],
    exitPosition: all[q * 3],
    keyPosition: all[q],
  };
}
