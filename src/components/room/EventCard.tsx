import { useState, useEffect } from 'react';
import type { ActiveEvent } from '../../types/room';
import type { Player } from '../../types/player';
import { useGame } from '../../store/useGame';
import typwriterSrc from '../../assets/typewriter.mp3';

interface Props {
  event: ActiveEvent;
  player: Player;
}

// --- Typewriter sound: single looping playback, not per-character ---
let twCtx: AudioContext | null = null;
let twBuffer: AudioBuffer | null = null;
let activeSource: AudioBufferSourceNode | null = null;

async function loadTypewriterSound() {
  if (twBuffer) return;
  try {
    twCtx = new AudioContext();
    const res = await fetch(typwriterSrc);
    const buf = await res.arrayBuffer();
    twBuffer = await twCtx.decodeAudioData(buf);
  } catch { /* audio unavailable */ }
}
loadTypewriterSound();

function startTypewriterLoop() {
  if (!twCtx || !twBuffer) return;
  stopTypewriterLoop();
  try {
    if (twCtx.state === 'suspended') twCtx.resume();
    const source = twCtx.createBufferSource();
    source.buffer = twBuffer;
    source.loop = true;
    const gain = twCtx.createGain();
    gain.gain.value = 0.3;
    source.connect(gain);
    gain.connect(twCtx.destination);
    source.start();
    activeSource = source;
  } catch { /* ignore */ }
}

function stopTypewriterLoop() {
  if (activeSource) {
    try { activeSource.stop(); } catch { /* already stopped */ }
    activeSource = null;
  }
}

export default function EventCard({ event, player }: Props) {
  const { dispatch } = useGame();
  const { template } = event;
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    startTypewriterLoop();
    const interval = setInterval(() => {
      i++;
      setDisplayedText(template.description.slice(0, i));
      if (i >= template.description.length) {
        clearInterval(interval);
        stopTypewriterLoop();
      }
    }, 38);
    return () => {
      clearInterval(interval);
      stopTypewriterLoop();
    };
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
    <div style={{ padding: '14px 16px' }}>
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
                cursor: enabled ? 'pointer' : 'not-allowed',
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
