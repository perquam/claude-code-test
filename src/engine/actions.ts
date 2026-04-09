import { v4 as uuid } from 'uuid';
import type { GameState, LogEntry } from '../types/game';
import type { Position } from '../types/game';
import type { Player } from '../types/player';
import type { SkillId } from '../types/skill';
import { isValid, posEqual } from './grid';
import { applyFogTransition } from './fog';
import { moveBeast, isBeastOnPlayer } from './beast';
import { initiateBeastCombat, resolveCombatRound } from './combat';
import type { CombatAction } from './combat';
import { resolveEventChoice, triggerRoomEvent } from './events';
import { useItem, equipItem, pickupLoot } from './items';
import { upgradeSkill, canUpgradeSkill } from './skills';
import { castSpellInCombat, learnSpellFromScroll } from './spells';
import { getMysticismRegen } from '../data/skills';
import { SKILL_DEFINITIONS } from '../data/skills';

export type PlayerAction =
  | { type: 'MOVE'; direction: 'N' | 'S' | 'E' | 'W' }
  | { type: 'CHOOSE_EVENT'; choiceId: string }
  | { type: 'COMBAT_ACTION'; action: CombatAction }
  | { type: 'CAST_SPELL'; spellId: string }
  | { type: 'LEARN_SPELL'; itemId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'EQUIP_ITEM'; itemId: string }
  | { type: 'PICKUP_LOOT'; itemId: string }
  | { type: 'DISCARD_ITEM'; itemId: string }
  | { type: 'USE_EXIT' }
  | { type: 'END_TURN' }
  | { type: 'LEVEL_UP_CHOICE'; skillId: string }
  | { type: 'OPEN_MAGIC_BOOK' }
  | { type: 'CLOSE_MAGIC_BOOK' }
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

function applyMysticismRegen(player: Player): Player {
  const regen = getMysticismRegen(player.skills.MYSTICISM);
  if (regen <= 0) return player;
  const newMana = Math.min(player.stats.maxMana, player.stats.mana + regen);
  return { ...player, stats: { ...player.stats, mana: newMana } };
}

function tickStaminaCooldown(player: Player): Player {
  if (player.staminaCooldown <= 0) return player;
  return { ...player, staminaCooldown: player.staminaCooldown - 1 };
}

function advanceTurn(state: GameState): GameState {
  // Beast moves one step
  let next = moveBeast(state);
  next = { ...next, turn: next.turn + 1 };

  // Tick buffs, cursed blade, mysticism regen, stamina cooldown
  let player = tickBuffs(next.player);
  player = applyCursedBladeDrain(player);
  player = applyMysticismRegen(player);
  player = tickStaminaCooldown(player);
  next = { ...next, player };

  // Beast catches player -> combat
  if (isBeastOnPlayer(next) && !next.beast.isDefeated && next.phase === 'EXPLORING') {
    next = initiateBeastCombat(next);
  }

  // Keep log trimmed to last 50 entries
  if (next.log.length > 50) {
    next = { ...next, log: next.log.slice(next.log.length - 50) };
  }

  return next;
}

const MAX_INVENTORY = 10;

export function processPlayerAction(state: GameState, action: PlayerAction): GameState {
  // Terminal states — only RESTART is valid
  if (state.phase === 'GAME_OVER' || state.phase === 'VICTORY') {
    if (action.type === 'RESTART') {
      return state;
    }
    return state;
  }

  switch (action.type) {
    case 'MOVE': {
      if (state.phase !== 'EXPLORING') return state;
      if (state.movedThisTurn) return state;
      const currentRoom = state.grid[state.player.position.row][state.player.position.col];
      if (!currentRoom.connections.includes(action.direction)) return state;
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
      return resolveEventChoice(state, action.choiceId);
    }

    case 'COMBAT_ACTION': {
      if (state.phase !== 'COMBAT' || !state.activeCombat) return state;
      return resolveCombatRound(state, action.action);
    }

    case 'CAST_SPELL': {
      if (state.phase !== 'COMBAT' || !state.activeCombat) return state;
      let next = castSpellInCombat(state, action.spellId);
      // After casting, enemy gets a turn (spell is turn-consuming)
      if (next.activeCombat && next.activeCombat.enemyStats.hp > 0 && next.player.stats.hp > 0) {
        // Route through combat round with a no-op to trigger enemy turn
        // Actually, let's just advance the round in the spell handler
        next = {
          ...next,
          activeCombat: {
            ...next.activeCombat!,
            round: next.activeCombat!.round + 1,
            playerTurn: true,
          },
        };
      }
      // Check if enemy died from spell
      if (next.activeCombat && next.activeCombat.enemyStats.hp <= 0) {
        return resolveCombatRound(next, 'ATTACK'); // Will trigger enemy death path
      }
      return next;
    }

    case 'LEARN_SPELL': {
      return learnSpellFromScroll(state, action.itemId);
    }

    case 'USE_ITEM': {
      return useItem(state, action.itemId);
    }

    case 'EQUIP_ITEM': {
      return equipItem(state, action.itemId);
    }

    case 'PICKUP_LOOT': {
      if (state.phase !== 'EXPLORING') return state;
      // Check inventory limit
      const currentRoom = state.grid[state.player.position.row][state.player.position.col];
      const item = currentRoom.loot.find(i => i.id === action.itemId);
      if (!item) return state;
      // Gold goes to stats, not inventory
      if (item.type === 'GOLD') {
        return pickupLoot(state, action.itemId);
      }
      // Magic book sets flag
      if (item.type === 'MAGIC_BOOK') {
        return pickupLoot(state, action.itemId);
      }
      // Key doesn't count toward inventory limit
      if (item.type === 'KEY') {
        return pickupLoot(state, action.itemId);
      }
      if (state.player.inventory.filter(i => i.type !== 'KEY').length >= MAX_INVENTORY) {
        return {
          ...state,
          log: [...state.log, sysLog(state.turn, 'Inventory full! Discard an item first.')],
        };
      }
      return pickupLoot(state, action.itemId);
    }

    case 'DISCARD_ITEM': {
      const item = state.player.inventory.find(i => i.id === action.itemId);
      if (!item) return state;
      if (item.type === 'KEY') return state; // Cannot discard key
      const player = {
        ...state.player,
        inventory: state.player.inventory.filter(i => i.id !== action.itemId),
      };
      return {
        ...state,
        player,
        log: [...state.log, sysLog(state.turn, `You discard the ${item.name}.`)],
      };
    }

    case 'END_TURN': {
      if (state.phase !== 'EXPLORING') return state;
      let next = advanceTurn(state);
      next = { ...next, movedThisTurn: false };
      return next;
    }

    case 'LEVEL_UP_CHOICE': {
      if (state.phase !== 'LEVEL_UP') return state;
      const skillId = action.skillId as SkillId;
      if (!canUpgradeSkill(state.player.skills, skillId)) return state;

      const newSkills = upgradeSkill(state.player.skills, skillId);
      const skillInfo = SKILL_DEFINITIONS[skillId];
      const player = {
        ...state.player,
        skills: newSkills,
      };

      return {
        ...state,
        player,
        phase: state.phaseBeforeLevelUp ?? 'EXPLORING',
        pendingLevelUp: false,
        phaseBeforeLevelUp: null,
        log: [...state.log, sysLog(state.turn, `${skillInfo.name} upgraded!`)],
      };
    }

    case 'OPEN_MAGIC_BOOK': {
      if (!state.player.hasMagicBook) return state;
      if (state.phase !== 'EXPLORING') return state;
      return { ...state, phase: 'MAGIC_BOOK' };
    }

    case 'CLOSE_MAGIC_BOOK': {
      if (state.phase !== 'MAGIC_BOOK') return state;
      return { ...state, phase: 'EXPLORING' };
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
