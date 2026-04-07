import { v4 as uuid } from 'uuid';
import type { GameState, CombatState, LogEntry } from '../types/game';
import type { Player, Stats } from '../types/player';
import { ENEMY_TEMPLATES } from '../data/events';
import type { EnemyTemplate } from '../data/events';
import { BEAST_XP_REWARD } from '../data/beastConfig';
import type { Item } from '../types/item';
import { ITEM_DEFINITIONS } from '../data/items';
import { findFleeDestination } from './grid';
import { applyFogTransition } from './fog';

function clampHp(stats: Stats): Stats {
  return { ...stats, hp: Math.max(0, Math.min(stats.hp, stats.maxHp)) };
}

function makeLogEntry(turn: number, message: string): LogEntry {
  return { id: uuid(), turn, message, type: 'combat' };
}

export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  critChance = 0,
): { damage: number; isCrit: boolean } {
  const isCrit = Math.random() < critChance;
  const base = Math.max(1, attackerAttack - defenderDefense);
  return { damage: isCrit ? Math.floor(base * 1.8) : base, isCrit };
}

export function getPlayerAttack(player: Player): number {
  const weaponBonus =
    player.equippedWeapon && 'attackBonus' in (player.equippedWeapon.stats ?? {})
      ? (player.equippedWeapon.stats as { attackBonus: number }).attackBonus
      : 0;
  const buffBonus = player.buffs
    .filter(b => b.type === 'ATTACK')
    .reduce((sum, b) => sum + b.value, 0);
  return player.stats.attack + weaponBonus + buffBonus;
}

export function getPlayerDefense(player: Player): number {
  const armorBonus =
    player.equippedArmor && 'defenseBonus' in (player.equippedArmor.stats ?? {})
      ? (player.equippedArmor.stats as { defenseBonus: number }).defenseBonus
      : 0;
  const buffBonus = player.buffs
    .filter(b => b.type === 'DEFENSE')
    .reduce((sum, b) => sum + b.value, 0);
  return player.stats.defense + armorBonus + buffBonus;
}

export function getPlayerCritChance(player: Player): number {
  const weaponCrit =
    player.equippedWeapon?.stats && 'critChance' in player.equippedWeapon.stats
      ? (player.equippedWeapon.stats as { critChance: number }).critChance
      : 0;
  return weaponCrit + player.stats.critBonus;
}

export function checkLevelUp(player: Player): { player: Player; leveledUp: boolean } {
  if (player.stats.xp < player.stats.xpToNextLevel) return { player, leveledUp: false };
  const newLevel = player.stats.level + 1;
  // Base stat gains (smaller now since skills add power)
  const hpGain = 5;
  const attackGain = 1;
  const defenseGain = 1;
  return {
    player: {
      ...player,
      stats: {
        ...player.stats,
        level: newLevel,
        xp: player.stats.xp - player.stats.xpToNextLevel,
        xpToNextLevel: Math.floor(player.stats.xpToNextLevel * 1.5),
        maxHp: player.stats.maxHp + hpGain,
        hp: player.stats.hp + hpGain,
        attack: player.stats.attack + attackGain,
        defense: player.stats.defense + defenseGain,
      },
    },
    leveledUp: true,
  };
}

export function initiateBeastCombat(state: GameState): GameState {
  const combat: CombatState = {
    enemyId: 'beast',
    enemyStats: { ...state.beast.stats },
    enemyName: 'The Warden',
    enemyBehavior: 'brute',
    playerTurn: true,
    round: 1,
    log: ['The Warden lunges at you from the shadows!'],
    canFlee: true,
    playerDefending: false,
    playerHeavyPenalty: false,
    enemyCharging: false,
    riposteReady: false,
    secondWindUsed: false,
  };
  return {
    ...state,
    phase: 'COMBAT',
    activeCombat: combat,
    log: [
      ...state.log,
      makeLogEntry(state.turn, 'The Warden catches you! Fight for your life!'),
    ],
  };
}

export function initiateEventCombat(state: GameState, enemyId: string): GameState {
  const template = ENEMY_TEMPLATES[enemyId];
  if (!template) return state;
  const combat: CombatState = {
    enemyId,
    enemyStats: {
      hp: template.hp,
      maxHp: template.maxHp,
      attack: template.attack,
      defense: template.defense,
      critBonus: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 9999,
    },
    enemyName: template.name,
    enemyBehavior: template.behavior,
    playerTurn: true,
    round: 1,
    log: [`${template.name} attacks!`],
    canFlee: template.canFlee,
    playerDefending: false,
    playerHeavyPenalty: false,
    enemyCharging: false,
    riposteReady: false,
    secondWindUsed: false,
  };
  return { ...state, phase: 'COMBAT', activeCombat: combat };
}

function resolveEnemyTurn(
  combat: CombatState,
  player: Player,
): { combat: CombatState; player: Player } {
  const behavior = combat.enemyBehavior;

  // If enemy was charging, deliver the heavy hit
  if (combat.enemyCharging) {
    const chargeMult = 2.0;
    const baseDmg = Math.max(1, combat.enemyStats.attack - getPlayerDefense(player));
    let damage = Math.floor(baseDmg * chargeMult);

    if (combat.playerDefending) {
      // Defend counters charge — massive reduction
      const blockPct = player.abilities.includes('IRON_WILL') ? 0.85 : 0.7;
      damage = Math.floor(damage * (1 - blockPct));
      combat.log.push(`You brace and absorb the charged blow! (-${damage} HP)`);
    } else {
      combat.log.push(`The ${combat.enemyName} unleashes a devastating blow for ${damage} damage!`);
    }

    player = { ...player, stats: clampHp({ ...player.stats, hp: player.stats.hp - damage }) };
    combat = { ...combat, enemyCharging: false };
    return { combat, player };
  }

  // Brute: chance to charge
  if (behavior === 'brute' && Math.random() < 0.4) {
    combat = { ...combat, enemyCharging: true };
    combat.log.push(`${combat.enemyName} begins charging a heavy attack!`);
    return { combat, player };
  }

  // Quick: attacks twice at 60% damage
  if (behavior === 'quick') {
    for (let i = 0; i < 2; i++) {
      let { damage } = calculateDamage(combat.enemyStats.attack, getPlayerDefense(player));
      damage = Math.floor(damage * 0.6);
      if (combat.playerDefending) {
        const blockPct = player.abilities.includes('IRON_WILL') ? 0.75 : 0.6;
        damage = Math.floor(damage * (1 - blockPct));
      }
      if (combat.playerHeavyPenalty) {
        damage = Math.floor(damage * 1.3);
      }
      player = { ...player, stats: clampHp({ ...player.stats, hp: player.stats.hp - damage }) };
      combat.log.push(`${combat.enemyName} strikes swiftly for ${damage} damage.`);
    }
    return { combat, player };
  }

  // Basic: single attack
  let { damage } = calculateDamage(combat.enemyStats.attack, getPlayerDefense(player));
  if (combat.playerDefending) {
    const blockPct = player.abilities.includes('IRON_WILL') ? 0.75 : 0.6;
    damage = Math.floor(damage * (1 - blockPct));
  }
  if (combat.playerHeavyPenalty) {
    damage = Math.floor(damage * 1.3);
  }
  player = { ...player, stats: clampHp({ ...player.stats, hp: player.stats.hp - damage }) };
  combat.log.push(`${combat.enemyName} hits you for ${damage} damage.`);
  return { combat, player };
}

function checkSecondWind(player: Player, combat: CombatState): { player: Player; combat: CombatState } {
  if (
    !combat.secondWindUsed &&
    player.abilities.includes('SECOND_WIND') &&
    player.stats.hp > 0 &&
    player.stats.hp <= player.stats.maxHp * 0.25
  ) {
    const heal = Math.floor(player.stats.maxHp * 0.2);
    player = { ...player, stats: { ...player.stats, hp: Math.min(player.stats.maxHp, player.stats.hp + heal) } };
    combat = { ...combat, secondWindUsed: true, log: [...combat.log, `Second Wind activates! You recover ${heal} HP!`] };
  }
  return { player, combat };
}

export type CombatAction = 'ATTACK' | 'FLEE' | 'HEAVY_ATTACK' | 'DEFEND';

export function resolveCombatRound(
  state: GameState,
  action: CombatAction,
): GameState {
  if (!state.activeCombat) return state;
  let combat = { ...state.activeCombat, log: [...state.activeCombat.log] };
  let player = state.player;
  let beast = state.beast;
  const newLog: LogEntry[] = [];

  // Reset per-round flags
  combat.playerDefending = false;
  combat.playerHeavyPenalty = state.activeCombat.playerHeavyPenalty; // carry over from last round

  if (action === 'FLEE') {
    if (!combat.canFlee) {
      combat.log.push('You cannot flee from this fight!');
      return { ...state, activeCombat: combat };
    }
    const fleeSuccess = Math.random() < 0.5;
    if (fleeSuccess) {
      newLog.push(makeLogEntry(state.turn, 'You managed to flee!'));
      // Reposition player away from beast on flee
      if (combat.enemyId === 'beast') {
        const newPos = findFleeDestination(state.grid, player.position, beast.position, 3);
        const grid = applyFogTransition(state.grid, player.position, newPos);
        return {
          ...state,
          phase: 'EXPLORING',
          activeCombat: null,
          player: { ...player, position: newPos },
          grid,
          log: [...state.log, ...newLog],
        };
      }
      return {
        ...state,
        phase: 'EXPLORING',
        activeCombat: null,
        player,
        log: [...state.log, ...newLog],
      };
    } else {
      combat.log.push('You failed to flee!');
      const { damage } = calculateDamage(combat.enemyStats.attack, getPlayerDefense(player));
      player = { ...player, stats: clampHp({ ...player.stats, hp: player.stats.hp - damage }) };
      combat.log.push(`${combat.enemyName} strikes you for ${damage} damage.`);
    }
  } else if (action === 'DEFEND') {
    combat.playerDefending = true;
    combat.playerHeavyPenalty = false; // defending clears heavy penalty
    combat.log.push('You raise your guard.');

    // Enemy turn
    const result = resolveEnemyTurn(combat, player);
    combat = result.combat;
    player = result.player;

    // Set riposte for next round
    combat.riposteReady = true;
    combat.round += 1;
    combat.playerTurn = true;
  } else if (action === 'HEAVY_ATTACK') {
    let mult = 1.5;
    // Riposte bonus
    if (combat.riposteReady) {
      const riposteMult = player.abilities.includes('RIPOSTE_MASTER') ? 2.0 : 1.5;
      mult *= riposteMult;
      combat.log.push('Riposte!');
      combat.riposteReady = false;
    }

    const { damage: pDmg, isCrit } = calculateDamage(
      getPlayerAttack(player),
      combat.enemyStats.defense,
      getPlayerCritChance(player),
    );
    let finalDmg = Math.floor(pDmg * mult);
    // Executioner bonus
    if (player.abilities.includes('EXECUTIONER') && combat.enemyStats.hp <= combat.enemyStats.maxHp * 0.3) {
      finalDmg = Math.floor(finalDmg * 2);
      combat.log.push('Executioner!');
    }
    // Stun chance from Power Strike
    const stunned = player.abilities.includes('POWER_STRIKE') && Math.random() < 0.2;

    const critText = isCrit ? ' (Critical!)' : '';
    combat.enemyStats = { ...combat.enemyStats, hp: Math.max(0, combat.enemyStats.hp - finalDmg) };
    combat.log.push(`You swing with all your might for ${finalDmg} damage${critText}!`);

    if (combat.enemyStats.hp <= 0) {
      return resolveEnemyDeath(state, combat, player, beast, newLog);
    }

    // Set heavy penalty for next enemy attack
    combat.playerHeavyPenalty = true;
    combat.riposteReady = false;

    if (stunned) {
      combat.log.push(`${combat.enemyName} is stunned!`);
    } else {
      const result = resolveEnemyTurn(combat, player);
      combat = result.combat;
      player = result.player;
    }

    combat.round += 1;
    combat.playerTurn = true;
  } else {
    // ATTACK
    let mult = 1.0;
    // Riposte bonus
    if (combat.riposteReady) {
      const riposteMult = player.abilities.includes('RIPOSTE_MASTER') ? 2.0 : 1.5;
      mult *= riposteMult;
      combat.log.push('Riposte!');
      combat.riposteReady = false;
    }

    const { damage: pDmg, isCrit } = calculateDamage(
      getPlayerAttack(player),
      combat.enemyStats.defense,
      getPlayerCritChance(player),
    );
    let finalDmg = Math.floor(pDmg * mult);
    // Executioner bonus
    if (player.abilities.includes('EXECUTIONER') && combat.enemyStats.hp <= combat.enemyStats.maxHp * 0.3) {
      finalDmg = Math.floor(finalDmg * 2);
      combat.log.push('Executioner!');
    }

    const critText = isCrit ? ' (Critical!)' : '';
    combat.enemyStats = { ...combat.enemyStats, hp: Math.max(0, combat.enemyStats.hp - finalDmg) };
    combat.log.push(`You deal ${finalDmg} damage${critText}.`);

    if (combat.enemyStats.hp <= 0) {
      return resolveEnemyDeath(state, combat, player, beast, newLog);
    }

    // Enemy counter-attacks
    combat.playerHeavyPenalty = false;
    const result = resolveEnemyTurn(combat, player);
    combat = result.combat;
    player = result.player;

    combat.round += 1;
    combat.playerTurn = true;
  }

  // Check Second Wind
  const sw = checkSecondWind(player, combat);
  player = sw.player;
  combat = sw.combat;

  if (player.stats.hp <= 0) {
    newLog.push(makeLogEntry(state.turn, 'You have been slain. The dungeon claims another soul.'));
    return {
      ...state,
      phase: 'GAME_OVER',
      activeCombat: null,
      player,
      beast,
      log: [...state.log, ...newLog],
    };
  }

  return {
    ...state,
    activeCombat: combat,
    player,
    beast,
    log: [...state.log, ...newLog],
  };
}

function resolveEnemyDeath(
  state: GameState,
  combat: CombatState,
  player: Player,
  beast: typeof state.beast,
  newLog: LogEntry[],
): GameState {
  const isBeast = combat.enemyId === 'beast';
  const xpGain = isBeast
    ? BEAST_XP_REWARD
    : (ENEMY_TEMPLATES[combat.enemyId]?.xpReward ?? 20);

  player = { ...player, stats: { ...player.stats, xp: player.stats.xp + xpGain } };

  // Drop loot for non-beast enemies
  let loot: Item[] = [];
  if (!isBeast) {
    const template: EnemyTemplate | undefined = ENEMY_TEMPLATES[combat.enemyId];
    if (template) {
      loot = template.lootTable
        .filter(entry => Math.random() < entry.chance)
        .map(entry => ({
          ...ITEM_DEFINITIONS[entry.itemType as keyof typeof ITEM_DEFINITIONS],
          id: uuid(),
        }));
    }
  }

  const grid = state.grid.map(row =>
    row.map(room =>
      room.position.row === state.player.position.row &&
      room.position.col === state.player.position.col
        ? { ...room, loot: [...room.loot, ...loot] }
        : room,
    ),
  );

  if (isBeast) {
    beast = { ...beast, isDefeated: true };
    newLog.push(makeLogEntry(state.turn, 'The Warden falls. The dungeon shudders. You have won.'));
    return {
      ...state,
      phase: 'VICTORY',
      activeCombat: null,
      player,
      beast,
      grid,
      log: [...state.log, ...newLog],
    };
  }

  newLog.push(makeLogEntry(state.turn, `${combat.enemyName} is defeated! (+${xpGain} XP)`));

  // Check level up
  const levelResult = checkLevelUp(player);
  if (levelResult.leveledUp && levelResult.player.stats.level >= 2 && levelResult.player.stats.level <= 4) {
    return {
      ...state,
      phase: 'LEVEL_UP',
      activeCombat: null,
      player: levelResult.player,
      grid,
      log: [...state.log, ...newLog],
      pendingLevelUp: true,
      phaseBeforeLevelUp: 'EXPLORING',
    };
  }

  return {
    ...state,
    phase: 'EXPLORING',
    activeCombat: null,
    player: levelResult.player,
    grid,
    log: [...state.log, ...newLog],
  };
}
