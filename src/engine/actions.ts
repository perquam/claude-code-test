import { v4 as uuid } from 'uuid';
import type { GameState, LogEntry } from '../types/game';
import type { Position } from '../types/game';
import type { Player } from '../types/player';
import { isValid, posEqual } from './grid';
import { applyFogTransition } from './fog';
import { moveBeast, isBeastOnPlayer } from './beast';
import { initiateBeastCombat, resolveCombatRound } from './combat';
import type { CombatAction } from './combat';
import { resolveEventChoice, triggerRoomEvent } from './events';
import { useItem, equipItem, pickupLoot } from './items';
import { SKILL_OPTIONS } from '../data/skills';

export type PlayerAction =
  | { type: 'MOVE'; direction: 'N' | 'S' | 'E' | 'W' }
  | { type: 'CHOOSE_EVENT'; choiceId: string }
  | { type: 'COMBAT_ACTION'; action: CombatAction }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'EQUIP_ITEM'; itemId: string }
  | { type: 'PICKUP_LOOT'; itemId: string }
  | { type: 'USE_EXIT' }
  | { type: 'END_TURN' }
  | { type: 'LEVEL_UP_CHOICE'; skillId: string }
  | { type: 'RESTART' };

function sysLog(turn: number, message: string): LogEntry {
  return { id: uuid(), turn, message, type: 'system' };
}

const DIRECTION_DELTA: Record<string, Position> = {
  N: { row: -1, col: 0 },
  S: { row: 1, col: 0 },
  W: { row: 0, col: -1 },
  E: { row: 0, col: 1 },
};

function tickBuffs(player: Player): Player {
  const buffs = player.buffs
    .map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 }))
    .filter(b => b.turnsRemaining > 0);

  // Poison damage
  let hp = player.stats.hp;
  for (const b of player.buffs) {
    if (b.type === 'POISON') {
      hp = Math.max(0, hp - b.value);
    }
  }

  return { ...player, buffs, stats: { ...player.stats, hp } };
}

function applyCursedBladeDrain(player: Player): Player {
  if (
    player.equippedWeapon &&
    player.equippedWeapon.stats &&
    'hpDrainPerTurn' in player.equippedWeapon.stats &&
    (player.equippedWeapon.stats as { hpDrainPerTurn?: number }).hpDrainPerTurn
  ) {
    const drain = (player.equippedWeapon.stats as { hpDrainPerTurn: number }).hpDrainPerTurn;
    return {
      ...player,
      stats: { ...player.stats, hp: Math.max(1, player.stats.hp - drain) },
    };
  }
  return player;
}

function advanceTurn(state: GameState): GameState {
  // Beast moves one step
  let next = moveBeast(state);
  next = { ...next, turn: next.turn + 1 };

  // Tick buffs and cursed blade
  let player = tickBuffs(next.player);
  player = applyCursedBladeDrain(player);
  next = { ...next, player };

  // Beast catches player → combat
  if (isBeastOnPlayer(next) && !next.beast.isDefeated && next.phase === 'EXPLORING') {
    next = initiateBeastCombat(next);
  }

  // Keep log trimmed to last 50 entries
  if (next.log.length > 50) {
    next = { ...next, log: next.log.slice(next.log.length - 50) };
  }

  return next;
}

export function processPlayerAction(state: GameState, action: PlayerAction): GameState {
  // Terminal states — only RESTART is valid
  if (state.phase === 'GAME_OVER' || state.phase === 'VICTORY') {
    if (action.type === 'RESTART') {
      // Handled externally — return state unchanged (reinit happens in store)
      return state;
    }
    return state;
  }

  switch (action.type) {
    case 'MOVE': {
      if (state.phase !== 'EXPLORING') return state;
      if (state.movedThisTurn) return state; // one move per turn
      const currentRoom = state.grid[state.player.position.row][state.player.position.col];
      if (!currentRoom.connections.includes(action.direction)) return state; // wall
      const delta = DIRECTION_DELTA[action.direction];
      const newPos: Position = {
        row: state.player.position.row + delta.row,
        col: state.player.position.col + delta.col,
      };
      if (!isValid(newPos)) return state;

      const oldPos = state.player.position;
      let next: GameState = {
        ...state,
        movedThisTurn: true,
        player: { ...state.player, position: newPos },
        grid: applyFogTransition(state.grid, oldPos, newPos),
      };

      // Trigger room event if unresolved
      const newRoom = next.grid[newPos.row][newPos.col];
      if (newRoom.event && !newRoom.eventResolved) {
        next = triggerRoomEvent(next);
        return next;
      }

      return next;
    }

    case 'CHOOSE_EVENT': {
      if (state.phase !== 'EVENT' || !state.activeEvent) return state;
      const next = resolveEventChoice(state, action.choiceId);
      return next;
    }

    case 'COMBAT_ACTION': {
      if (state.phase !== 'COMBAT' || !state.activeCombat) return state;
      const next = resolveCombatRound(state, action.action);
      return next;
    }

    case 'USE_ITEM': {
      // Free action — no beast move consumed
      return useItem(state, action.itemId);
    }

    case 'EQUIP_ITEM': {
      // Free action
      return equipItem(state, action.itemId);
    }

    case 'PICKUP_LOOT': {
      if (state.phase !== 'EXPLORING') return state;
      const next = pickupLoot(state, action.itemId);
      return next;
    }

    case 'END_TURN': {
      if (state.phase !== 'EXPLORING') return state;
      let next = advanceTurn(state);
      next = { ...next, movedThisTurn: false };
      return next;
    }

    case 'LEVEL_UP_CHOICE': {
      if (state.phase !== 'LEVEL_UP') return state;
      const level = state.player.stats.level;
      const options = SKILL_OPTIONS[level];
      if (!options) return state;
      const skill = options.find(s => s.id === action.skillId);
      if (!skill) return state;

      let player = state.player;
      player = {
        ...player,
        abilities: [...player.abilities, skill.id],
        stats: {
          ...player.stats,
          attack: player.stats.attack + (skill.statChanges.attack ?? 0),
          defense: player.stats.defense + (skill.statChanges.defense ?? 0),
          maxHp: player.stats.maxHp + (skill.statChanges.maxHp ?? 0),
          hp: player.stats.hp + (skill.statChanges.maxHp ?? 0),
          critBonus: player.stats.critBonus + (skill.statChanges.critBonus ?? 0),
        },
      };

      return {
        ...state,
        player,
        phase: state.phaseBeforeLevelUp ?? 'EXPLORING',
        pendingLevelUp: false,
        phaseBeforeLevelUp: null,
        log: [...state.log, sysLog(state.turn, `You learned ${skill.name}!`)],
      };
    }

    case 'USE_EXIT': {
      if (state.phase !== 'EXPLORING') return state;
      const { position } = state.player;
      if (!posEqual(position, state.exitPosition)) {
        return {
          ...state,
          log: [...state.log, sysLog(state.turn, 'You are not at the exit.')],
        };
      }
      if (!state.player.hasKey) {
        return {
          ...state,
          log: [...state.log, sysLog(state.turn, 'The door is sealed. You need the Iron Key.')],
        };
      }
      return {
        ...state,
        phase: 'VICTORY',
        log: [
          ...state.log,
          sysLog(state.turn, 'You unlock the door and step into blinding daylight. You are free.'),
        ],
      };
    }

    default:
      return state;
  }
}
