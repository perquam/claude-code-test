import { useState, useEffect } from 'react';
import type { ActiveEvent } from '../../types/room';
import type { Player } from '../../types/player';
import { useGame } from '../../store/useGame';
import { generateRoomImage } from '../../services/imageGen';

interface Props {
  event: ActiveEvent;
  player: Player;
}

export default function EventCard({ event, player }: Props) {
  const { dispatch } = useGame();
  const { template } = event;
  const [roomImage, setRoomImage] = useState<string | null>(null);

  useEffect(() => {
    const key = `${event.roomPosition.row},${event.roomPosition.col}`;
    generateRoomImage(key, template.type, template.title, template.description)
      .then(setRoomImage);
  }, [event.roomPosition.row, event.roomPosition.col]);

  function canChoose(choice: typeof template.choices[number]) {
    const req = choice.requires;
    if (!req) return true;
    if (req.item && !player.inventory.some(i => i.type === req.item)) return false;
    if (req.minLevel && player.stats.level < req.minLevel) return false;
    if (req.minHp && player.stats.hp < req.minHp) return false;
    return true;
  }

  return (
    <div style={{
      background: 'var(--color-shadow)',
      border: '1px solid var(--color-highlight)',
      borderRadius: 4,
      padding: '14px 16px',
    }}>
      {roomImage && (
        <img
          src={roomImage}
          alt={template.title}
          style={{ width: '100%', borderRadius: 3, marginBottom: 12, imageRendering: 'pixelated' }}
        />
      )}
      <h3 style={{
        color: 'var(--color-torch)',
        fontSize: 14,
        marginBottom: 10,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {template.title}
      </h3>
      <p style={{ color: 'var(--color-parchment)', lineHeight: 1.6, marginBottom: 14, fontSize: 14 }}>
        {template.description}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {template.choices.map(choice => {
          const enabled = canChoose(choice);
          return (
            <button
              key={choice.id}
              disabled={!enabled}
              onClick={() => dispatch({ type: 'CHOOSE_EVENT', choiceId: choice.id })}
              style={{
                background: enabled ? 'var(--color-stone-mid)' : 'var(--color-shadow-mid)',
                color: enabled ? 'var(--color-parchment)' : 'var(--color-parchment-dim)',
                border: `1px solid ${enabled ? 'var(--color-highlight)' : 'var(--color-border)'}`,
                borderRadius: 3,
                padding: '8px 12px',
                textAlign: 'left',
                fontSize: 13,
                transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (enabled) (e.currentTarget as HTMLElement).style.background = 'var(--color-highlight)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = enabled ? 'var(--color-stone-mid)' : 'var(--color-shadow-mid)'; }}
            >
              {choice.text}
              {choice.requires?.item && !enabled && (
                <span style={{ color: 'var(--color-blood)', marginLeft: 6, fontSize: 11 }}>
                  (requires {choice.requires.item.replace(/_/g, ' ').toLowerCase()})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
