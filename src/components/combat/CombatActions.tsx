import type { CombatState } from '../../types/game';
import { useGame } from '../../store/useGame';
import { getPlayerAttack, getPlayerDefense } from '../../engine/combat';

export default function CombatActions({ combat }: { combat: CombatState }) {
  const { dispatch, state } = useGame();

  const hpPct = Math.max(0, (combat.enemyStats.hp / combat.enemyStats.maxHp) * 100);
  const playerAttack = getPlayerAttack(state.player);
  const playerDefense = getPlayerDefense(state.player);

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
      <div style={{ marginBottom: 12 }}>
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

      {/* Actions — 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
          Heavy Attack
        </button>
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
