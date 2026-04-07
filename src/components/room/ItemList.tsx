import type { Item } from '../../types/item';
import { useGame } from '../../store/useGame';

interface Props {
  items: Item[];
  mode: 'pickup' | 'inventory';
  equippedIds?: string[];
}

export default function ItemList({ items, mode, equippedIds = [] }: Props) {
  const { dispatch } = useGame();

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
          return (
            <div key={item.id} style={{
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
              <div>
                <span style={{ fontSize: 14, marginRight: 4 }}>{item.icon}</span>
                <span style={{ color: isEquipped ? 'var(--color-torch)' : 'var(--color-parchment)', fontSize: 13 }}>
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
                <span style={{
                  marginLeft: 8,
                  color: 'var(--color-parchment-dim)',
                  fontSize: 11,
                }}>
                  {item.description}
                </span>
              </div>
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
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  Pick up
                </button>
              )}
              {mode === 'inventory' && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {item.consumable && !isEquipped && (
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
