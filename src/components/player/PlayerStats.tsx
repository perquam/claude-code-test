import { useGame } from '../../store/useGame';
import StatBar from './StatBar';
import ItemList from '../room/ItemList';
import { getPlayerAttack, getPlayerDefense } from '../../engine/combat';

export default function PlayerStats() {
  const { state } = useGame();
  const { player } = state;
  const { stats } = player;

  const effectiveAttack = getPlayerAttack(player);
  const effectiveDefense = getPlayerDefense(player);

  const equippedIds: string[] = [];
  if (player.equippedWeapon) equippedIds.push(player.equippedWeapon.id);
  if (player.equippedArmor) equippedIds.push(player.equippedArmor.id);

  // Combine equipped items + inventory for unified display
  const allItems = [
    ...(player.equippedWeapon ? [player.equippedWeapon] : []),
    ...(player.equippedArmor ? [player.equippedArmor] : []),
    ...player.inventory.filter(i => i.type !== 'KEY'),
  ];

  return (
    <div style={{
      borderTop: '1px solid var(--color-border)',
      padding: '10px 16px',
      background: 'var(--color-void)',
      maxHeight: 260,
      overflowY: 'auto',
    }}>
      {/* Core stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <StatBar value={stats.hp} max={stats.maxHp} color="var(--color-blood)" label="HP" />
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

      {/* Abilities */}
      {player.abilities.length > 0 && (
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-torch)',
          marginBottom: 6,
        }}>
          Skills: {player.abilities.map(a => a.replace(/_/g, ' ').toLowerCase()).join(', ')}
        </div>
      )}

      {/* Inventory */}
      {allItems.length > 0 && (
        <ItemList
          items={allItems}
          mode="inventory"
          equippedIds={equippedIds}
        />
      )}
    </div>
  );
}
