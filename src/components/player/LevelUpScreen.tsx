import { useGame } from '../../store/useGame';
import { SKILL_DEFINITIONS, ALL_SKILL_IDS } from '../../data/skills';
import { canUpgradeSkill } from '../../engine/skills';
import { SKILL_TIER_LABELS } from '../../types/skill';
import type { SkillTier } from '../../types/skill';

export default function LevelUpScreen() {
  const { state, dispatch } = useGame();
  const level = state.player.stats.level;
  const skills = state.player.skills;

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
        You reached level {level}. Choose a skill to upgrade:
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}>
        {ALL_SKILL_IDS.map(skillId => {
          const info = SKILL_DEFINITIONS[skillId];
          const currentTier = skills[skillId];
          const canUpgrade = canUpgradeSkill(skills, skillId);
          const nextTier = (currentTier + 1) as SkillTier;

          return (
            <button
              key={skillId}
              disabled={!canUpgrade}
              onClick={() => dispatch({ type: 'LEVEL_UP_CHOICE', skillId })}
              style={{
                background: canUpgrade ? 'var(--color-shadow)' : 'var(--color-void)',
                border: `1px solid ${canUpgrade ? 'var(--color-highlight)' : 'var(--color-border)'}`,
                borderRadius: 6,
                padding: '12px 10px',
                cursor: canUpgrade ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                opacity: canUpgrade ? 1 : 0.5,
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                if (canUpgrade) {
                  e.currentTarget.style.borderColor = 'var(--color-torch)';
                  e.currentTarget.style.background = 'rgba(255, 200, 60, 0.06)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = canUpgrade ? 'var(--color-highlight)' : 'var(--color-border)';
                e.currentTarget.style.background = canUpgrade ? 'var(--color-shadow)' : 'var(--color-void)';
              }}
            >
              <div style={{
                fontSize: 20,
                marginBottom: 4,
              }}>
                {info.icon}
              </div>
              <div style={{
                color: 'var(--color-torch)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 4,
              }}>
                {info.name}
              </div>
              <div style={{
                color: 'var(--color-parchment-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                marginBottom: 6,
              }}>
                {SKILL_TIER_LABELS[currentTier]}
                {canUpgrade && ` → ${SKILL_TIER_LABELS[nextTier]}`}
              </div>
              <div style={{
                color: 'var(--color-parchment)',
                fontSize: 10,
                lineHeight: 1.4,
              }}>
                {canUpgrade ? info.tierDescriptions[nextTier] : 'MASTERED'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
