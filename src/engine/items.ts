import { v4 as uuid } from 'uuid';
import type { GameState, LogEntry } from '../types/game';
import type { Item, ItemType } from '../types/item';
import { ITEM_DEFINITIONS, POTION_HEAL } from '../data/items';
import { checkLevelUp } from './combat';

function log(turn: number, message: string): LogEntry {
  return { id: uuid(), turn, message, type: 'item' };
}

export function makeItem(type: ItemType): Item {
  return { ...ITEM_DEFINITIONS[type], id: uuid() };
}

export function useItem(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || !item.consumable) return state;

  let player = state.player;
  const newLog: LogEntry[] = [];

  const healAmount = POTION_HEAL[item.type];
  if (healAmount !== undefined) {
    const healed = Math.min(healAmount, player.stats.maxHp - player.stats.hp);
    player = {
      ...player,
      stats: { ...player.stats, hp: player.stats.hp + healed },
      inventory: player.inventory.filter(i => i.id !== itemId),
    };
    newLog.push(log(state.turn, `You drink the ${item.name} and recover ${healed} HP.`));
  } else if (item.type === 'POTION_STRENGTH') {
    player = {
      ...player,
      buffs: [...player.buffs, { type: 'ATTACK', value: 3, turnsRemaining: 5 }],
      inventory: player.inventory.filter(i => i.id !== itemId),
    };
    newLog.push(log(state.turn, 'You drink the Potion of Strength. Your arms burn with power. (+3 ATK, 5 turns)'));
  } else if (item.type === 'POTION_IRON_SKIN') {
    player = {
      ...player,
      buffs: [...player.buffs, { type: 'DEFENSE', value: 3, turnsRemaining: 5 }],
      inventory: player.inventory.filter(i => i.id !== itemId),
    };
    newLog.push(log(state.turn, 'You drink the Potion of Iron Skin. Your skin hardens. (+3 DEF, 5 turns)'));
  } else if (item.type === 'POTION_ANTIDOTE') {
    player = {
      ...player,
      buffs: player.buffs.filter(b => b.type !== 'POISON'),
      inventory: player.inventory.filter(i => i.id !== itemId),
    };
    newLog.push(log(state.turn, 'You drink the Antidote. The poison recedes.'));
  } else {
    // Consume without effect for now (scrolls, etc.)
    player = { ...player, inventory: player.inventory.filter(i => i.id !== itemId) };
    newLog.push(log(state.turn, `You use the ${item.name}.`));
  }

  return { ...state, player, log: [...state.log, ...newLog] };
}

export function equipItem(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || item.consumable) return state;

  let player = state.player;
  const newLog: LogEntry[] = [];
  const isWeapon = item.type.startsWith('WEAPON');
  const isArmor = item.type.startsWith('ARMOR');

  if (isWeapon) {
    // Unequip current weapon back to inventory
    const prev = player.equippedWeapon;
    const inventory = prev
      ? [...player.inventory.filter(i => i.id !== itemId), prev]
      : player.inventory.filter(i => i.id !== itemId);
    player = { ...player, equippedWeapon: item, inventory };
    newLog.push(log(state.turn, `You equip the ${item.name}.`));
  } else if (isArmor) {
    const prev = player.equippedArmor;
    const inventory = prev
      ? [...player.inventory.filter(i => i.id !== itemId), prev]
      : player.inventory.filter(i => i.id !== itemId);
    player = { ...player, equippedArmor: item, inventory };
    newLog.push(log(state.turn, `You equip the ${item.name}.`));
  }

  return { ...state, player, log: [...state.log, ...newLog] };
}

export function pickupLoot(state: GameState, itemId: string): GameState {
  const currentRoom = state.grid[state.player.position.row][state.player.position.col];
  const item = currentRoom.loot.find(i => i.id === itemId);
  if (!item) return state;

  const newLog: LogEntry[] = [];
  let player = state.player;

  if (item.type === 'KEY') {
    player = { ...player, hasKey: true, inventory: [...player.inventory, item] };
    newLog.push(log(state.turn, 'You pick up the Iron Key. This must unlock the exit.'));
  } else {
    player = { ...player, inventory: [...player.inventory, item] };
    newLog.push(log(state.turn, `You pick up the ${item.name}.`));
  }

  const grid = state.grid.map(row =>
    row.map(room =>
      room.position.row === state.player.position.row &&
      room.position.col === state.player.position.col
        ? { ...room, loot: room.loot.filter(i => i.id !== itemId) }
        : room,
    ),
  );

  const levelResult = checkLevelUp(player);
  player = levelResult.player;

  return { ...state, player, grid, log: [...state.log, ...newLog] };
}
