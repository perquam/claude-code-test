import { useGame } from '../../store/useGame';
import { SPELL_DEFINITIONS } from '../../data/spells';
import { getEffectiveSpellDamage, getEffectiveSpellHealing } from '../../engine/spells';
import { SKILL_TIER_LABELS } from '../../types/skill';

export default function MagicBook() {
  const { state, dispatch } = useGame();
  const { player } = state;

  return (
    <div style={{
      padding: '20px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{
          color: '#88aaff',
          fontFamily: 'var(--font-mono)',
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}>
          📕 Tome of Arcana
        </h2>
        <button
          onClick={() => dispatch({ type: 'CLOSE_MAGIC_BOOK' })}
          style={{
            background: 'transparent',
            color: 'var(--color-parchment-dim)',
            border: '1px solid var(--color-border)',
            borderRadius: 3,
            padding: '4px 10px',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-parchment-dim)',
        marginBottom: 12,
      }}>
        Spells Known: {player.spells.length}/5 | Wisdom: {SKILL_TIER_LABELS[player.skills.WISDOM]} | Mana: {player.stats.mana}/{player.stats.maxMana}
      </div>

      {player.spells.length === 0 ? (
        <div style={{
          color: 'var(--color-parchment-dim)',
          fontSize: 13,
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '20px 0',
        }}>
          The pages are blank. Find spell scrolls to learn new magic.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {player.spells.map(s => {
            const def = SPELL_DEFINITIONS[s.id];
            if (!def) return null;

            const effectiveDmg = def.effect.damage ? getEffectiveSpellDamage(def.effect.damage, player) : null;
            const effectiveHeal = def.effect.healing ? getEffectiveSpellHealing(def.effect.healing, player) : null;

            return (
              <div key={s.id} style={{
                background: 'var(--color-shadow)',
                border: '1px solid #3355dd',
                borderRadius: 4,
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#88aaff', fontSize: 14, fontWeight: 'bold' }}>
                    {def.icon} {def.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3355dd' }}>
                    {def.manaCost} MP
                  </span>
                </div>
                <div style={{ color: 'var(--color-parchment-dim)', fontSize: 12, marginBottom: 4 }}>
                  {def.description}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-parchment)' }}>
                  {effectiveDmg !== null && <span>Damage: {effectiveDmg} </span>}
                  {effectiveHeal !== null && <span>Healing: {effectiveHeal} </span>}
                  {def.effect.buffGranted && (
                    <span>+{def.effect.buffGranted.value} {def.effect.buffGranted.type} ({def.effect.buffGranted.turnsRemaining}t) </span>
                  )}
                  {def.effect.debuffGranted && (
                    <span>Poison: {def.effect.debuffGranted.value}/turn ({def.effect.debuffGranted.turnsRemaining}t) </span>
                  )}
                  {def.effect.special === 'RESURRECT' && <span>Auto-revive (once) </span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
