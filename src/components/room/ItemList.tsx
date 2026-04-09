import { useState } from 'react';
import type { Item } from '../../types/item';
import { RARITY_COLORS } from '../../types/rarity';
import { useGame } from '../../store/useGame';
import { SPELL_DEFINITIONS } from '../../data/spells';

interface Props {
  items: Item[];
  mode: 'pickup' | 'inventory';
  equippedIds?: string[];
}

export default function ItemList({ items, mode, equippedIds = [] }: Props) {
  const { dispatch, state } = useGame();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div style={{
      background: 'var(--color-shadow)',
      border: '1px solid var(--color-border)',
      borderRadius: 4,
      padding: '10px 12px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-parchment-dim)',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        {mode === 'pickup' ? 'Items on the ground' : 'Inventory'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => {
          const isEquipped = equippedIds.includes(item.id);
          const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.COMMON;
          const isHovered = hoveredId === item.id;
          const isSpellScroll = item.type === 'SPELL_SCROLL' && item.spellContained;

          return (
            <div
              key={item.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                ...(isEquipped ? {
                  background: 'rgba(255, 200, 60, 0.08)',
                  border: '1px solid rgba(255, 200, 60, 0.3)',
                  borderRadius: 3,
                  padding: '2px 6px',
                  margin: '-2px -6px',
                } : {}),
              }}>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ fontSize: 14, marginRight: 4 }}>{item.icon}</span>
                  <span style={{ color: rarityColor, fontSize: 13 }}>
                    {item.name}
                  </span>
                  {isEquipped && (
                    <span style={{
                      marginLeft: 6,
                      fontSize: 9,
                      color: 'var(--color-torch)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}>
                      [E]
                    </span>
                  )}
                  {item.rarity === 'LEGENDARY' && (
                    <span style={{
                      marginLeft: 6,
                      fontSize: 9,
                      color: '#ff8000',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      ★
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {mode === 'pickup' && (
                    <button
                      onClick={() => dispatch({ type: 'PICKUP_LOOT', itemId: item.id })}
                      style={{
                        background: 'var(--color-stone-mid)',
                        color: 'var(--color-parchment)',
                        border: '1px solid var(--color-highlight)',
                        borderRadius: 3,
                        padding: '3px 8px',
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      Pick up
                    </button>
                  )}
                  {mode === 'inventory' && (
                    <>
                      {isSpellScroll && state.player.hasMagicBook && (
                        <button
                          onClick={() => dispatch({ type: 'LEARN_SPELL', itemId: item.id })}
                          style={{
                            background: '#1a3a6e',
                            color: '#88aaff',
                            border: '1px solid #3355dd',
                            borderRadius: 3,
                            padding: '3px 8px',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Learn
                        </button>
                      )}
                      {item.consumable && !isEquipped && !isSpellScroll && (
                        <button
                          onClick={() => dispatch({ type: 'USE_ITEM', itemId: item.id })}
                          style={{
                            background: 'var(--color-stone-mid)',
                            color: 'var(--color-parchment)',
                            border: '1px solid var(--color-highlight)',
                            borderRadius: 3,
                            padding: '3px 8px',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Use
                        </button>
                      )}
                      {!item.consumable && !isEquipped && (item.type.startsWith('WEAPON') || item.type.startsWith('ARMOR')) && (
                        <button
                          onClick={() => dispatch({ type: 'EQUIP_ITEM', itemId: item.id })}
                          style={{
                            background: 'var(--color-stone-mid)',
                            color: 'var(--color-parchment)',
                            border: '1px solid var(--color-highlight)',
                            borderRadius: 3,
                            padding: '3px 8px',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Equip
                        </button>
                      )}
                      {!isEquipped && item.type !== 'KEY' && (
                        <button
                          onClick={() => dispatch({ type: 'DISCARD_ITEM', itemId: item.id })}
                          style={{
                            background: 'transparent',
                            color: 'var(--color-parchment-dim)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 3,
                            padding: '3px 6px',
                            fontSize: 10,
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--color-void)',
                  border: `1px solid ${rarityColor}`,
                  borderRadius: 4,
                  padding: '8px 10px',
                  zIndex: 10,
                  fontSize: 11,
                  marginBottom: 4,
                }}>
                  <div style={{ color: rarityColor, fontWeight: 'bold', marginBottom: 4 }}>
                    {item.name}
                    <span style={{ marginLeft: 8, fontSize: 9, textTransform: 'uppercase' }}>
                      {item.rarity}
                    </span>
                  </div>
                  <div style={{ color: 'var(--color-parchment-dim)', marginBottom: 4, lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                  {item.stats && 'attackBonus' in item.stats && (
                    <div style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                      +{(item.stats as { attackBonus: number }).attackBonus} ATK |{' '}
                      {Math.round((item.stats as { critChance: number }).critChance * 100)}% Crit
                    </div>
                  )}
                  {item.stats && 'defenseBonus' in item.stats && (
                    <div style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                      +{(item.stats as { defenseBonus: number }).defenseBonus} DEF |{' '}
                      {(item.stats as { damageReduction: number }).damageReduction} flat reduction
                    </div>
                  )}
                  {item.legendaryBonus?.skillGrant && (
                    <div style={{ color: '#ff8000', fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 2 }}>
                      Grants: {item.legendaryBonus.skillGrant.skill} (tier {item.legendaryBonus.skillGrant.tier})
                    </div>
                  )}
                  {isSpellScroll && item.spellContained && SPELL_DEFINITIONS[item.spellContained] && (
                    <div style={{ color: '#88aaff', fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 2 }}>
                      Spell: {SPELL_DEFINITIONS[item.spellContained].name} ({SPELL_DEFINITIONS[item.spellContained].manaCost} MP)
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
