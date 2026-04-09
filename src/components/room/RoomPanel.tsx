import { useGame } from '../../store/useGame';
import EventCard from './EventCard';
import CombatActions from '../combat/CombatActions';
import LevelUpScreen from '../player/LevelUpScreen';
import MagicBook from '../player/MagicBook';
import ItemList from './ItemList';
import { ROOM_IMAGES } from '../../assets/rooms';
import type { Room } from '../../types/room';

const ROOM_TYPE_LABELS: Record<string, string> = {
  MERCHANT: 'Trading Post',
  TRAP: 'Danger',
  SHRINE: 'Shrine',
  WOUNDED_TRAVELER: 'Encounter',
  MONSTER: 'Combat',
  TREASURE: 'Discovery',
  LORE: 'Discovery',
  EMPTY: 'Empty Chamber',
  MORAL_DILEMMA: 'Moral Choice',
  WIZARD: 'Arcane Chamber',
};

function getRoomImage(room: Room): string {
  if (room.isExit) return ROOM_IMAGES.EXIT;
  if (room.event) return ROOM_IMAGES[room.event.type] ?? ROOM_IMAGES.EMPTY;
  return ROOM_IMAGES.EMPTY;
}

export default function RoomPanel() {
  const { state, currentRoom, canUseExit, dispatch } = useGame();
  const { phase, log, activeCombat } = state;

  const roomLabel = currentRoom.isExit
    ? 'Exit'
    : currentRoom.event && !currentRoom.eventResolved
    ? (ROOM_TYPE_LABELS[currentRoom.event.type] ?? 'Room')
    : 'Chamber';

  // Image ALWAYS visible based on current room — never disappears
  const roomImage = getRoomImage(currentRoom);

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '70% 1fr',
      overflow: 'hidden',
    }}>
      {/* Top 70%: Room image — always visible, full image shown */}
      <div style={{
        background: '#08080f',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src={roomImage}
          alt={roomLabel}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
      </div>

      {/* Bottom 30%: Scrollable content — plot, choices, combat, log */}
      <div style={{ overflowY: 'auto' }}>
        {phase === 'EVENT' && state.activeEvent && (
          <EventCard event={state.activeEvent} player={state.player} />
        )}

        {phase === 'COMBAT' && activeCombat && (
          <div style={{ padding: '12px 16px' }}>
            <CombatActions combat={activeCombat} />
          </div>
        )}

        {phase === 'LEVEL_UP' && (
          <LevelUpScreen />
        )}

        {phase === 'MAGIC_BOOK' && (
          <MagicBook />
        )}

        {phase === 'EXPLORING' && canUseExit && (
          <div style={{ padding: '12px 16px' }}>
            <button
              onClick={() => dispatch({ type: 'USE_EXIT' })}
              style={{
                background: 'var(--color-exit)',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                padding: '10px 16px',
                fontWeight: 'bold',
                fontSize: 14,
                width: '100%',
                cursor: 'pointer',
              }}
            >
              Use Exit — Escape the Dungeon
            </button>
          </div>
        )}

        {phase === 'EXPLORING' && currentRoom.isExit && !state.player.hasKey && (
          <p style={{ color: 'var(--color-parchment-dim)', fontSize: 13, fontStyle: 'italic', padding: '0 16px' }}>
            The door is sealed. You need the Iron Key.
          </p>
        )}

        {phase === 'EXPLORING' && state.player.hasMagicBook && (
          <div style={{ padding: '0 16px 8px' }}>
            <button
              onClick={() => dispatch({ type: 'OPEN_MAGIC_BOOK' })}
              style={{
                background: '#1a3a6e',
                color: '#88aaff',
                border: '1px solid #3355dd',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              📕 Open Tome of Arcana ({state.player.spells.length}/5 spells)
            </button>
          </div>
        )}

        {currentRoom.loot.length > 0 && phase === 'EXPLORING' && (
          <div style={{ padding: '0 16px 12px' }}>
            <ItemList items={currentRoom.loot} mode="pickup" />
          </div>
        )}

        {/* Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 16px' }}>
          {[...log].reverse().map(entry => (
            <div key={entry.id} style={{
              fontSize: 13,
              color: entry.type === 'combat'
                ? 'var(--color-blood)'
                : entry.type === 'item'
                ? 'var(--color-key)'
                : entry.type === 'system'
                ? 'var(--color-parchment-dim)'
                : 'var(--color-parchment)',
              lineHeight: 1.5,
            }}>
              {entry.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
