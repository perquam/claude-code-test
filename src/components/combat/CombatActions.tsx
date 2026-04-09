import { useState } from 'react';
import type { CombatState } from '../../types/game';
import { useGame } from '../../store/useGame';
import { getPlayerAttack, getPlayerDefense } from '../../engine/combat';
import { SPELL_DEFINITIONS } from '../../data/spells';
import { canCastSpell } from '../../engine/spells';
import StatBar from '../player/StatBar';

export default function CombatActions({ combat }: { combat: CombatState }) {
  const { dispatch, state } = useGame();
  const [showSpells, setShowSpells] = useState(false);

  const hpPct = Math.max(0, (combat.enemyStats.hp / combat.enemyStats.maxHp) * 100);
  const playerAttack = getPlayerAttack(state.player);
  const playerDefense = getPlayerDefense(state.player);
  const hasSpells = state.player.hasMagicBook && state.player.spells.length > 0;

  return (
    <div style={{
      background: 'var(--color-shadow)',
      border: '1px solid var(--color-blood)',
      borderRadius: 4,
      padding: '14px 16px',
    }}>
      <h3 style={{
        color: '#cc3333',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Combat — Round {combat.round}
      </h3>

      {/* Enemy HP */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: 'var(--color-parchment)' }}>{combat.enemyName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-parchment-dim)' }}>
            {combat.enemyStats.hp} / {combat.enemyStats.maxHp}
          </span>
        </div>
        <div style={{ height: 6, background: '#1a1a2e', borderRadius: 3 }}>
          <div style={{
            height: '100%',
            width: `${hpPct}%`,
            background: 'var(--color-blood)',
            borderRadius: 3,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Player HP + Mana bars */}
      <div style={{ marginBottom: 8 }}>
        <StatBar value={state.player.stats.hp} max={state.player.stats.maxHp} color="var(--color-blood)" label="HP" />
        {state.player.stats.maxMana > 0 && (
          <StatBar value={state.player.stats.mana} max={state.player.stats.maxMana} color="#3355dd" label="MP" />
        )}
      </div>

      {/* Enemy state indicator */}
      {combat.enemyCharging && (
        <div style={{
          fontSize: 12,
          color: '#ff6644',
          fontFamily: 'var(--font-mono)',
          fontWeight: 'bold',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          ⚡ CHARGING HEAVY ATTACK — Defend!
        </div>
      )}

      {/* Player state indicators */}
      <div style={{
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        marginBottom: 8,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        {combat.riposteReady && (
          <span style={{ color: '#44aaff' }}>⚔ Riposte Ready</span>
        )}
        {combat.playerHeavyPenalty && (
          <span style={{ color: '#ff8844' }}>⚠ Exposed</span>
        )}
      </div>

      {/* Stats context */}
      <div style={{
        fontSize: 11,
        color: 'var(--color-parchment-dim)',
        fontFamily: 'var(--font-mono)',
        marginBottom: 12,
      }}>
        Your ATK: {playerAttack} | Your DEF: {playerDefense} | Enemy ATK: {combat.enemyStats.attack}
        {combat.enemyBehavior !== 'basic' && (
          <span style={{ color: 'var(--color-parchment-dim)', marginLeft: 8 }}>
            [{combat.enemyBehavior === 'brute' ? 'Brute' : 'Quick'}]
          </span>
        )}
      </div>

      {/* Combat log */}
      <div style={{
        maxHeight: 80,
        overflowY: 'auto',
        marginBottom: 12,
        fontSize: 12,
        color: 'var(--color-parchment-dim)',
        lineHeight: 1.5,
      }}>
        {[...combat.log].reverse().map((line, i) => (
          <div key={i} style={{ color: i === 0 ? 'var(--color-parchment)' : undefined }}>{line}</div>
        ))}
      </div>

      {/* Spell picker overlay */}
      {showSpells && (
        <div style={{
          background: 'var(--color-void)',
          border: '1px solid #3355dd',
          borderRadius: 4,
          padding: '8px',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#88aaff',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            Cast a Spell
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {state.player.spells.map(s => {
              const def = SPELL_DEFINITIONS[s.id];
              if (!def) return null;
              const canCast = canCastSpell(state.player, def);
              return (
                <button
                  key={s.id}
                  disabled={!canCast}
                  onClick={() => {
                    dispatch({ type: 'CAST_SPELL', spellId: s.id });
                    setShowSpells(false);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: canCast ? 'var(--color-shadow-mid)' : 'var(--color-void)',
                    border: `1px solid ${canCast ? '#3355dd' : 'var(--color-border)'}`,
                    borderRadius: 3,
                    padding: '4px 8px',
                    cursor: canCast ? 'pointer' : 'not-allowed',
                    opacity: canCast ? 1 : 0.5,
                    color: 'var(--color-parchment)',
                    fontSize: 11,
                  }}
                >
                  <span>{def.icon} {def.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3355dd' }}>
                    {def.manaCost} MP
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowSpells(false)}
            style={{
              marginTop: 6,
              background: 'transparent',
              color: 'var(--color-parchment-dim)',
              border: '1px solid var(--color-border)',
              borderRadius: 3,
              padding: '3px 8px',
              fontSize: 10,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Actions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: hasSpells ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
        <button
          onClick={() => dispatch({ type: 'COMBAT_ACTION', action: 'ATTACK' })}
          style={{
            background: 'var(--color-blood)',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            padding: '8px',
            fontSize: 13,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {combat.riposteReady ? '⚔ Attack' : 'Attack'}
        </button>
        <button
          onClick={() => dispatch({ type: 'COMBAT_ACTION', action: 'HEAVY_ATTACK' })}
          style={{
            background: '#8b2500',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            padding: '8px',
            fontSize: 13,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Heavy
        </button>
        {hasSpells && (
          <button
            onClick={() => setShowSpells(!showSpells)}
            style={{
              background: '#1a3a6e',
              color: '#88aaff',
              border: '1px solid #3355dd',
              borderRadius: 3,
              padding: '8px',
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Cast
          </button>
        )}
        <button
          onClick={() => dispatch({ type: 'COMBAT_ACTION', action: 'DEFEND' })}
          style={{
            background: 'var(--color-stone-mid)',
            color: 'var(--color-parchment)',
            border: combat.enemyCharging ? '2px solid #ff6644' : '1px solid var(--color-highlight)',
            borderRadius: 3,
            padding: '8px',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: combat.enemyCharging ? 'bold' : 'normal',
          }}
        >
          {combat.enemyCharging ? '🛡 Defend!' : 'Defend'}
        </button>
        <button
          onClick={() => dispatch({ type: 'COMBAT_ACTION', action: 'FLEE' })}
          disabled={!combat.canFlee}
          style={{
            background: 'var(--color-stone-mid)',
            color: combat.canFlee ? 'var(--color-parchment)' : 'var(--color-parchment-dim)',
            border: '1px solid var(--color-highlight)',
            borderRadius: 3,
            padding: '8px',
            fontSize: 13,
            cursor: combat.canFlee ? 'pointer' : 'not-allowed',
            opacity: combat.canFlee ? 1 : 0.5,
          }}
        >
          Flee
        </button>
      </div>
    </div>
  );
}
