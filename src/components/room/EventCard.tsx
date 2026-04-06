import { useState, useEffect, useRef } from 'react';
import type { ActiveEvent } from '../../types/room';
import type { Player } from '../../types/player';
import { useGame } from '../../store/useGame';
import typwriterSrc from '../../assets/typewriter.mp3';

interface Props {
  event: ActiveEvent;
  player: Player;
}

// Single audio element — only one sound can ever play at a time
let typewriterAudio: HTMLAudioElement | null = null;

function startSound() {
  if (!typewriterAudio) {
    typewriterAudio = new Audio(typwriterSrc);
    typewriterAudio.loop = true;
    typewriterAudio.volume = 0.3;
  }
  typewriterAudio.currentTime = 0;
  typewriterAudio.play().catch(() => {});
}

function stopSound() {
  if (typewriterAudio) {
    typewriterAudio.pause();
    typewriterAudio.currentTime = 0;
  }
}

/** Split text into tokens: each word and each whitespace chunk */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === ' ' || text[i] === '\n') {
      let j = i;
      while (j < text.length && (text[j] === ' ' || text[j] === '\n')) j++;
      tokens.push(text.slice(i, j));
      i = j;
    } else {
      let j = i;
      while (j < text.length && text[j] !== ' ' && text[j] !== '\n') j++;
      tokens.push(text.slice(i, j));
      i = j;
    }
  }
  return tokens;
}

export default function EventCard({ event, player }: Props) {
  const { dispatch } = useGame();
  const { template } = event;
  const [displayedText, setDisplayedText] = useState('');
  const cancelRef = useRef(false);

  useEffect(() => {
    setDisplayedText('');
    cancelRef.current = false;
    const tokens = tokenize(template.description);

    let cancelled = false;
    async function typeText() {
      startSound();
      let built = '';
      for (const token of tokens) {
        if (cancelled) break;
        const isSpace = token[0] === ' ' || token[0] === '\n';
        if (isSpace) {
          // Append whitespace instantly
          built += token;
          setDisplayedText(built);
        } else {
          // Type each character of the word fast (25ms per char)
          for (let c = 0; c < token.length; c++) {
            if (cancelled) break;
            built += token[c];
            setDisplayedText(built);
            await new Promise(r => setTimeout(r, 25));
          }
          // Random pause after word (200–500ms)
          if (!cancelled) {
            await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
          }
        }
      }
      if (!cancelled) stopSound();
    }

    typeText();
    return () => {
      cancelled = true;
      cancelRef.current = true;
      stopSound();
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
