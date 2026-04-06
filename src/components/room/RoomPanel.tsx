import { useGame } from '../../store/useGame';
import EventCard from './EventCard';
import CombatActions from '../combat/CombatActions';
import ItemList from './ItemList';
import { ROOM_IMAGES } from '../../assets/rooms';

const ROOM_TYPE_LABELS: Record<string, string> = {
  MERCHANT: 'Trading Post',
  TRAP: 'Danger',
  SHRINE: 'Shrine',
  WOUNDED_TRAVELER: 'Encounter',
  MONSTER: 'Combat',
  TREASURE: 'Discovery',
  LORE: 'Discovery',
  EMPTY: 'Empty Chamber',
};

export default function RoomPanel() {
  const { state, currentRoom, canUseExit, dispatch } = useGame();
  const { phase, log, activeCombat } = state;

  const roomLabel = currentRoom.isExit
    ? 'Exit'
    : currentRoom.event && !currentRoom.eventResolved
    ? (ROOM_TYPE_LABELS[currentRoom.event.type] ?? 'Room')
    : 'Chamber';

  const roomImage = phase === 'EVENT' && state.activeEvent
    ? (currentRoom.isExit ? ROOM_IMAGES.EXIT : ROOM_IMAGES[state.activeEvent.template.type])
    : undefined;

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: roomImage ? 'auto 200px 1fr' : 'auto 1fr',
      overflow: 'hidden',
    }}>
      {/* Row 1: Room label */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-parchment-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderBottom: '1px solid var(--color-border)',
        padding: '10px 16px 8px',
      }}>
        {roomLabel}
        {currentRoom.isExit && (
          <span style={{ color: 'var(--color-exit)', marginLeft: 8 }}>⬡ EXIT</span>
        )}
      </div>

      {/* Row 2: Room image — exactly 200px, dark bg for transparent areas */}
      {roomImage && (
        <div style={{ background: '#08080f', borderBottom: '1px solid var(--color-border)' }}>
          <img
            src={roomImage}
            alt={roomLabel}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              imageRendering: 'pixelated',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Row 3: Scrollable content — plot, choices, combat, log */}
      <div style={{ overflowY: 'auto' }}>
        {phase === 'EVENT' && state.activeEvent && (
          <EventCard event={state.activeEvent} player={state.player} />
        )}

        {phase === 'COMBAT' && activeCombat && (
          <div style={{ padding: '12px 16px' }}>
            <CombatActions combat={activeCombat} />
          </div>
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
