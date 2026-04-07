import { useGame } from '../../store/useGame';
import { SKILL_OPTIONS } from '../../data/skills';

export default function LevelUpScreen() {
  const { state, dispatch } = useGame();
  const level = state.player.stats.level;
  const options = SKILL_OPTIONS[level];

  if (!options) return null;

  return (
    <div style={{
      padding: '20px 16px',
      textAlign: 'center',
    }}>
      <h2 style={{
        color: 'var(--color-torch)',
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 2,
      }}>
        Level Up!
      </h2>
      <div style={{
        color: 'var(--color-parchment-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        marginBottom: 20,
      }}>
        You reached level {level}. Choose a skill:
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {options.map(skill => (
          <button
            key={skill.id}
            onClick={() => dispatch({ type: 'LEVEL_UP_CHOICE', skillId: skill.id })}
            style={{
              flex: 1,
              maxWidth: 220,
              background: 'var(--color-shadow)',
              border: '1px solid var(--color-highlight)',
              borderRadius: 6,
              padding: '16px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-torch)';
              e.currentTarget.style.background = 'rgba(255, 200, 60, 0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-highlight)';
              e.currentTarget.style.background = 'var(--color-shadow)';
            }}
          >
            <div style={{
              color: 'var(--color-torch)',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 8,
            }}>
              {skill.name}
            </div>
            <div style={{
              color: 'var(--color-parchment)',
              fontSize: 12,
              lineHeight: 1.5,
              marginBottom: 10,
            }}>
              {skill.description}
            </div>
            <div style={{
              color: 'var(--color-parchment-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}>
              {Object.entries(skill.statChanges)
                .filter(([, v]) => v !== 0 && v !== undefined)
                .map(([k, v]) => {
                  const label = k === 'maxHp' ? 'HP' : k === 'critBonus' ? 'CRIT' : k.toUpperCase();
                  return `+${v} ${label}`;
                })
                .join('  ')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
