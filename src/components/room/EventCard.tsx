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
let soundShouldPlay = false;

function ensureAudio() {
  if (!typewriterAudio) {
    typewriterAudio = new Audio(typwriterSrc);
    typewriterAudio.loop = true;
    typewriterAudio.volume = 0.3;
  }
}

function startSound() {
  ensureAudio();
  soundShouldPlay = true;
  typewriterAudio!.currentTime = 0;
  typewriterAudio!.play().catch(() => {
    // Browser blocked autoplay — we'll resume on first user gesture
  });
}

function stopSound() {
  soundShouldPlay = false;
  if (typewriterAudio) {
    typewriterAudio.pause();
    typewriterAudio.currentTime = 0;
  }
}

// Resume audio on first user interaction if it was blocked by autoplay policy
function onFirstInteraction() {
  if (soundShouldPlay && typewriterAudio?.paused) {
    typewriterAudio.play().catch(() => {});
  }
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
}
document.addEventListener('click', onFirstInteraction);
document.addEventListener('keydown', onFirstInteraction);

/** Split text into words (keeping trailing space with each word) */
function splitWords(text: string): string[] {
  const words: string[] = [];
  const re = /\S+\s*/g;
  let m;
  while ((m = re.exec(text)) !== null) words.push(m[0]);
  return words;
}

export default function EventCard({ event, player }: Props) {
  const { dispatch } = useGame();
  const { template } = event;
  const [displayedText, setDisplayedText] = useState('');
  const cancelRef = useRef(false);

  useEffect(() => {
    setDisplayedText('');
    cancelRef.current = false;
    const words = splitWords(template.description);

    let cancelled = false;
    async function typeText() {
      startSound();
      let built = '';
      let i = 0;
      while (i < words.length && !cancelled) {
        // Grab 1–4 words at once
        const chunk = 1 + Math.floor(Math.random() * 4);
        const end = Math.min(i + chunk, words.length);
        for (let w = i; w < end; w++) built += words[w];
        i = end;
        setDisplayedText(built);
        if (i < words.length && !cancelled) {
          await new Promise(r => setTimeout(r, 120 + Math.random() * 280));
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
    if (req.minWisdom !== undefined && player.skills.WISDOM < req.minWisdom) return false;
    if (req.hasMagicBook && !player.hasMagicBook) return false;
    if (req.minGold !== undefined && player.stats.gold < req.minGold) return false;
    return true;
  }

  function getRequirementHint(choice: typeof template.choices[number]): string | null {
    const req = choice.requires;
    if (!req) return null;
    if (req.item && !player.inventory.some(i => i.type === req.item))
      return `requires ${req.item.replace(/_/g, ' ').toLowerCase()}`;
    if (req.minGold !== undefined && player.stats.gold < req.minGold)
      return `requires ${req.minGold} gold`;
    if (req.minWisdom !== undefined && player.skills.WISDOM < req.minWisdom)
      return `requires higher Wisdom`;
    if (req.hasMagicBook && !player.hasMagicBook)
      return `requires Tome of Arcana`;
    if (req.minHp && player.stats.hp < req.minHp)
      return `requires ${req.minHp} HP`;
    return null;
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
              {!enabled && getRequirementHint(choice) && (
                <span style={{ color: 'var(--color-blood)', marginLeft: 6, fontSize: 11 }}>
                  ({getRequirementHint(choice)})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
