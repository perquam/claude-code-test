import { useState } from 'react';
import { useGame } from '../../store/useGame';
import StatBar from './StatBar';
import ItemList from '../room/ItemList';
import { getPlayerAttack, getPlayerDefense } from '../../engine/combat';
import { SKILL_DEFINITIONS, ALL_SKILL_IDS, getOffenseBonus, getDefenseBonus, getMagicalPowerMultiplier } from '../../data/skills';
import { SKILL_TIER_LABELS } from '../../types/skill';

export default function PlayerStats() {
  const { state } = useGame();
  const { player } = state;
  const { stats } = player;
  const [tab, setTab] = useState<'stats' | 'skills'>('stats');

  const effectiveAttack = getPlayerAttack(player);
  const effectiveDefense = getPlayerDefense(player);

  const equippedIds: string[] = [];
  if (player.equippedWeapon) equippedIds.push(player.equippedWeapon.id);
  if (player.equippedArmor) equippedIds.push(player.equippedArmor.id);

  // Filter out KEY and GOLD from inventory display
  const displayInventory = player.inventory.filter(i => i.type !== 'KEY' && i.type !== 'GOLD');
  const allItems = [
    ...(player.equippedWeapon ? [player.equippedWeapon] : []),
    ...(player.equippedArmor ? [player.equippedArmor] : []),
    ...displayInventory,
  ];

  const inventoryCount = displayInventory.length;

  return (
    <div style={{
      borderTop: '1px solid var(--color-border)',
      padding: '10px 16px',
      background: 'var(--color-void)',
      maxHeight: 320,
      overflowY: 'auto',
    }}>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {(['stats', 'skills'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              background: tab === t ? 'var(--color-shadow-mid)' : 'transparent',
              border: `1px solid ${tab === t ? 'var(--color-highlight)' : 'var(--color-border)'}`,
              borderRadius: 4,
              color: tab === t ? 'var(--color-torch)' : 'var(--color-parchment-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              padding: '3px 0',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <>
          {/* Core stats */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <StatBar value={stats.hp} max={stats.maxHp} color="var(--color-blood)" label="HP" />
              <StatBar value={stats.mana} max={stats.maxMana} color="#3355dd" label="MP" />
              <StatBar value={stats.xp} max={stats.xpToNextLevel} color="var(--color-xp)" label="XP" />
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-parchment-dim)',
              lineHeight: 1.8,
            }}>
              <div>Lv <span style={{ color: 'var(--color-torch)' }}>{stats.level}</span></div>
              <div>ATK <span style={{ color: 'var(--color-parchment)' }}>{effectiveAttack}</span></div>
              <div>DEF <span style={{ color: 'var(--color-parchment)' }}>{effectiveDefense}</span></div>
              <div style={{ color: '#f0d060' }}>Gold: {stats.gold}</div>
            </div>
          </div>

          {/* Equipped summary */}
          <div style={{
            fontSize: 11,
            color: 'var(--color-parchment-dim)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 4,
          }}>
            <span>Weapon: </span>
            <span style={{ color: 'var(--color-parchment)' }}>
              {player.equippedWeapon ? `${player.equippedWeapon.icon} ${player.equippedWeapon.name}` : '—'}
            </span>
            {'  '}
            <span>Armor: </span>
            <span style={{ color: 'var(--color-parchment)' }}>
              {player.equippedArmor ? `${player.equippedArmor.icon} ${player.equippedArmor.name}` : '—'}
            </span>
            {player.hasKey && (
              <span style={{ color: 'var(--color-key)', marginLeft: 10 }}>🗝️ Key</span>
            )}
            {player.hasMagicBook && (
              <span style={{ color: '#0070dd', marginLeft: 10 }}>📕 Tome</span>
            )}
          </div>

          {/* Active buffs */}
          {player.buffs.length > 0 && (
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              marginBottom: 6,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              {player.buffs.map((b, i) => (
                <span key={i} style={{
                  color: b.type === 'POISON' ? '#88cc44' : b.type === 'ATTACK' ? '#ff8844' : '#4488ff',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '1px 5px',
                  borderRadius: 3,
                }}>
                  {b.type === 'POISON' ? '☠' : b.type === 'ATTACK' ? '⚔' : '🛡'}{' '}
                  {b.type === 'POISON' ? `-${b.value} HP` : `+${b.value} ${b.type === 'ATTACK' ? 'ATK' : 'DEF'}`}
                  : {b.turnsRemaining}t
                </span>
              ))}
            </div>
          )}

          {/* Spells summary */}
          {player.spells.length > 0 && (
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: '#88aaff',
              marginBottom: 6,
            }}>
              Spells ({player.spells.length}/5): {player.spells.map(s => s.id.replace(/_/g, ' ').toLowerCase()).join(', ')}
            </div>
          )}

          {/* Inventory */}
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-parchment-dim)',
            marginBottom: 4,
          }}>
            Inventory ({inventoryCount}/10)
          </div>
          {allItems.length > 0 && (
            <ItemList
              items={allItems}
              mode="inventory"
              equippedIds={equippedIds}
            />
          )}
        </>
      )}

      {tab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {ALL_SKILL_IDS.map(skillId => {
            const info = SKILL_DEFINITIONS[skillId];
            const tier = player.skills[skillId];
            return (
              <div key={skillId} style={{
                background: 'var(--color-shadow)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                padding: '6px 8px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: tier > 0 ? 'var(--color-torch)' : 'var(--color-parchment-dim)',
                }}>
                  {info.icon} {info.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: tier > 0 ? 'var(--color-parchment)' : 'var(--color-parchment-dim)',
                }}>
                  {SKILL_TIER_LABELS[tier]}
                </div>
                <div style={{
                  fontSize: 9,
                  color: 'var(--color-parchment-dim)',
                  marginTop: 2,
                }}>
                  {info.tierDescriptions[tier]}
                </div>
              </div>
            );
          })}

          {/* Derived bonuses */}
          <div style={{
            gridColumn: 'span 2',
            background: 'var(--color-shadow)',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            padding: '6px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-parchment-dim)',
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
          }}>
            <span>Offense +{getOffenseBonus(player.skills.OFFENSE)}</span>
            <span>Defense +{getDefenseBonus(player.skills.DEFENSE)}</span>
            <span>Spell x{getMagicalPowerMultiplier(player.skills.MAGICAL_POWER)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
