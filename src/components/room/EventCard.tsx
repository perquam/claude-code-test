import { useState, useEffect } from 'react';
import type { ActiveEvent } from '../../types/room';
import type { Player } from '../../types/player';
import { useGame } from '../../store/useGame';

interface Props {
  event: ActiveEvent;
  player: Player;
  roomImage?: string;
}

// Reuse a single AudioContext across all clicks
let audioCtx: AudioContext | null = null;

function playClick() {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
    }
    const ctx = audioCtx;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.018), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch { /* audio not available */ }
}

export default function EventCard({ event, player, roomImage }: Props) {
  const { dispatch } = useGame();
  const { template } = event;
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect with mechanical click sounds
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(template.description.slice(0, i));
      playClick();
      if (i >= template.description.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, [template.description]);

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
          style={{
            width: '100%',
            maxHeight: 140,
            objectFit: 'cover',
            objectPosition: 'center top',
            borderRadius: 3,
            marginBottom: 12,
            imageRendering: 'pixelated',
          }}
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
        {displayedText}
        {displayedText.length < template.description.length && (
          <span style={{ opacity: 0.6 }}>▌</span>
        )}
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
