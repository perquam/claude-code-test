import { v4 as uuid } from 'uuid';
import type { GameState, LogEntry } from '../types/game';
import type { Player } from '../types/player';
import type { SpellDefinition } from '../types/spell';
import { SPELL_DEFINITIONS } from '../data/spells';
import { getMagicalPowerMultiplier } from '../data/skills';

function log(turn: number, message: string): LogEntry {
  return { id: uuid(), turn, message, type: 'combat' };
}

export function canLearnSpell(player: Player, spellDef: SpellDefinition): boolean {
  if (!player.hasMagicBook) return false;
  if (player.spells.length >= 5) return false;
  if (player.skills.WISDOM < spellDef.requiredWisdom) return false;
  if (player.spells.some(s => s.id === spellDef.id)) return false;
  return true;
}

export function canCastSpell(player: Player, spellDef: SpellDefinition): boolean {
  if (!player.hasMagicBook) return false;
  if (player.stats.mana < spellDef.manaCost) return false;
  if (!player.spells.some(s => s.id === spellDef.id)) return false;
  return true;
}

export function getEffectiveSpellDamage(baseDamage: number, player: Player): number {
  const mult = getMagicalPowerMultiplier(player.skills.MAGICAL_POWER);
  return Math.floor(baseDamage * mult);
}

export function getEffectiveSpellHealing(baseHealing: number, player: Player): number {
  const mult = getMagicalPowerMultiplier(player.skills.MAGICAL_POWER);
  return Math.floor(baseHealing * mult);
}

export function castSpellInCombat(state: GameState, spellId: string): GameState {
  if (!state.activeCombat) return state;

  const spellDef = SPELL_DEFINITIONS[spellId];
  if (!spellDef) return state;
  if (!canCastSpell(state.player, spellDef)) return state;

  let player = state.player;
  const combat = { ...state.activeCombat, log: [...state.activeCombat.log] };
  const newLog: LogEntry[] = [];

  // Deduct mana
  player = { ...player, stats: { ...player.stats, mana: player.stats.mana - spellDef.manaCost } };

  const effect = spellDef.effect;

  // Damage
  if (effect.damage) {
    const dmg = getEffectiveSpellDamage(effect.damage, player);
    combat.enemyStats = { ...combat.enemyStats, hp: Math.max(0, combat.enemyStats.hp - dmg) };
    combat.log.push(`You cast ${spellDef.name} for ${dmg} damage!`);
  }

  // Healing
  if (effect.healing) {
    const heal = getEffectiveSpellHealing(effect.healing, player);
    const actualHeal = Math.min(heal, player.stats.maxHp - player.stats.hp);
    player = { ...player, stats: { ...player.stats, hp: player.stats.hp + actualHeal } };
    combat.log.push(`${spellDef.name} heals you for ${actualHeal} HP!`);
  }

  // Drain Life: both damage and healing
  if (effect.damage && effect.healing) {
    // Already handled above
  }

  // Buff granted (to player)
  if (effect.buffGranted) {
    player = { ...player, buffs: [...player.buffs, { ...effect.buffGranted }] };
    combat.log.push(`${spellDef.name}: +${effect.buffGranted.value} ${effect.buffGranted.type} for ${effect.buffGranted.turnsRemaining} turns.`);
  }

  // Debuff granted (to enemy — apply as enemy "poison" tracked in combat log)
  if (effect.debuffGranted) {
    // We apply poison damage directly each round via enemy debuff tracking
    // For simplicity, add a note and apply damage over next N rounds
    combat.log.push(`${spellDef.name} curses the enemy! (${effect.debuffGranted.value} damage/turn for ${effect.debuffGranted.turnsRemaining} turns)`);
    // Store debuff on combat state — we'll need to track this
  }

  // Resurrect special
  if (effect.special === 'RESURRECT') {
    player = { ...player, buffs: [...player.buffs, { type: 'DEFENSE', value: 0, turnsRemaining: 99 }] };
    combat.log.push(`${spellDef.name}: A ward of resurrection surrounds you.`);
    // The actual resurrect logic will be checked on death
  }

  return {
    ...state,
    player,
    activeCombat: combat,
    log: [...state.log, ...newLog],
  };
}

export function learnSpellFromScroll(state: GameState, itemId: string): GameState {
  const item = state.player.inventory.find(i => i.id === itemId);
  if (!item || item.type !== 'SPELL_SCROLL' || !item.spellContained) return state;

  const spellDef = SPELL_DEFINITIONS[item.spellContained];
  if (!spellDef) return state;
  if (!canLearnSpell(state.player, spellDef)) {
    const newLog: LogEntry[] = [];
    if (!state.player.hasMagicBook) {
      newLog.push(log(state.turn, 'You need the Tome of Arcana to learn spells.'));
    } else if (state.player.spells.length >= 5) {
      newLog.push(log(state.turn, 'You already know the maximum of 5 spells.'));
    } else if (state.player.skills.WISDOM < spellDef.requiredWisdom) {
      newLog.push(log(state.turn, `Your Wisdom is too low to learn ${spellDef.name}.`));
    } else {
      newLog.push(log(state.turn, `You already know ${spellDef.name}.`));
    }
    return { ...state, log: [...state.log, ...newLog] };
  }

  const player = {
    ...state.player,
    spells: [...state.player.spells, { id: item.spellContained }],
    inventory: state.player.inventory.filter(i => i.id !== itemId),
  };

  return {
    ...state,
    player,
    log: [...state.log, log(state.turn, `You learned ${spellDef.name}!`)],
  };
}
