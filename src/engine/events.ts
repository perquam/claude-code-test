import { v4 as uuid } from 'uuid';
import type { GameState, LogEntry } from '../types/game';
import type { ActiveEvent } from '../types/room';
import { EVENT_POOL } from '../data/events';
import { makeItem } from './items';
import { checkLevelUp } from './combat';
import { initiateEventCombat } from './combat';

function log(_turn: number, message: string, type: LogEntry['type'] = 'narration'): LogEntry {
  return { id: uuid(), turn: _turn, message, type };
}

export function pickEvent(_turn: number, playerLevel: number) {
  const eligible = EVENT_POOL.filter(
    e => playerLevel >= e.minLevel && playerLevel <= e.maxLevel,
  );
  if (eligible.length === 0) return null;
  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const e of eligible) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return eligible[eligible.length - 1];
}

/** Called when player enters a room for the first time (or one with an unresolved event) */
export function triggerRoomEvent(state: GameState): GameState {
  const room = state.grid[state.player.position.row][state.player.position.col];
  if (!room.event || room.eventResolved) return state;

  const activeEvent: ActiveEvent = {
    roomPosition: state.player.position,
    template: room.event,
    choiceMade: false,
    outcomeText: null,
  };

  return {
    ...state,
    phase: 'EVENT',
    activeEvent,
    log: [
      ...state.log,
      log(state.turn, `— ${room.event.title} —`),
    ],
  };
}

export function resolveEventChoice(state: GameState, choiceId: string): GameState {
  if (!state.activeEvent) return state;

  const choice = state.activeEvent.template.choices.find(c => c.id === choiceId);
  if (!choice) return state;

  // Check requirements
  const req = choice.requires;
  if (req) {
    if (req.item && !state.player.inventory.some(i => i.type === req.item)) return state;
    if (req.minLevel && state.player.stats.level < req.minLevel) return state;
    if (req.minHp && state.player.stats.hp < req.minHp) return state;
  }

  const outcome = choice.outcome;
  let player = state.player;
  const newLog: LogEntry[] = [log(state.turn, outcome.description)];

  // HP delta
  if (outcome.hpDelta) {
    const newHp = Math.max(0, Math.min(player.stats.hp + outcome.hpDelta, player.stats.maxHp));
    player = { ...player, stats: { ...player.stats, hp: newHp } };
  }

  // XP delta (clamp to 0 minimum)
  if (outcome.xpDelta) {
    const newXp = Math.max(0, player.stats.xp + outcome.xpDelta);
    player = { ...player, stats: { ...player.stats, xp: newXp } };
  }

  // Items gained
  if (outcome.itemsGained) {
    for (const itemType of outcome.itemsGained) {
      const item = makeItem(itemType);
      if (itemType === 'KEY') {
        player = { ...player, hasKey: true, inventory: [...player.inventory, item] };
        newLog.push(log(state.turn, 'You now have the Iron Key.', 'item'));
      } else {
        player = { ...player, inventory: [...player.inventory, item] };
      }
    }
  }

  // Items lost (consume one of each type)
  if (outcome.itemsLost) {
    for (const itemType of outcome.itemsLost) {
      const idx = player.inventory.findIndex(i => i.type === itemType);
      if (idx !== -1) {
        const inv = [...player.inventory];
        inv.splice(idx, 1);
        player = { ...player, inventory: inv };
      }
    }
  }

  // Permanent stat modifiers
  if (outcome.statModifier) {
    const mod = outcome.statModifier;
    player = {
      ...player,
      stats: {
        ...player.stats,
        attack: player.stats.attack + (mod.attack ?? 0),
        defense: player.stats.defense + (mod.defense ?? 0),
        maxHp: player.stats.maxHp + (mod.maxHp ?? 0),
      },
    };
  }

  // Buff gained (e.g. poison from events)
  if (outcome.buffGained) {
    player = { ...player, buffs: [...player.buffs, { ...outcome.buffGained }] };
  }

  // Mark room event as resolved
  const grid = state.grid.map(row =>
    row.map(room =>
      room.position.row === state.activeEvent!.roomPosition.row &&
      room.position.col === state.activeEvent!.roomPosition.col
        ? { ...room, eventResolved: true }
        : room,
    ),
  );

  let nextState: GameState = {
    ...state,
    player,
    grid,
    activeEvent: { ...state.activeEvent, choiceMade: true, outcomeText: outcome.description },
    log: [...state.log, ...newLog],
  };

  // Check player death
  if (player.stats.hp <= 0) {
    return { ...nextState, phase: 'GAME_OVER', activeEvent: null };
  }

  // Combat trigger
  if (outcome.combatTrigger) {
    nextState = initiateEventCombat(nextState, outcome.combatTrigger);
    return nextState;
  }

  // Check level up
  const levelResult = checkLevelUp(player);
  if (levelResult.leveledUp) {
    nextState = { ...nextState, player: levelResult.player };
    if (levelResult.player.stats.level >= 2 && levelResult.player.stats.level <= 4) {
      return {
        ...nextState,
        phase: 'LEVEL_UP',
        activeEvent: null,
        pendingLevelUp: true,
        phaseBeforeLevelUp: 'EXPLORING',
      };
    }
  }

  return { ...nextState, phase: 'EXPLORING', activeEvent: null };
}
