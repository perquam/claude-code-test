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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '12px 16px',
      overflow: 'hidden',
      height: '100%',
    }}>
      {/* Room label */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-parchment-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 6,
      }}>
        {roomLabel}
        {currentRoom.isExit && (
          <span style={{ color: 'var(--color-exit)', marginLeft: 8 }}>⬡ EXIT</span>
        )}
      </div>

      {/* Active event — fills remaining height, log hidden while event is active */}
      {phase === 'EVENT' && state.activeEvent && (
        <EventCard
          event={state.activeEvent}
          player={state.player}
          roomImage={currentRoom.isExit ? ROOM_IMAGES.EXIT : ROOM_IMAGES[state.activeEvent.template.type]}
        />
      )}

      {/* Active combat */}
      {phase === 'COMBAT' && activeCombat && (
        <CombatActions combat={activeCombat} />
      )}

      {/* Exit button */}
      {phase === 'EXPLORING' && canUseExit && (
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
          }}
        >
          Use Exit — Escape the Dungeon
        </button>
      )}
      {phase === 'EXPLORING' && currentRoom.isExit && !state.player.hasKey && (
        <p style={{ color: 'var(--color-parchment-dim)', fontSize: 13, fontStyle: 'italic' }}>
          The door is sealed. You need the Iron Key.
        </p>
      )}

      {/* Loot in room */}
      {currentRoom.loot.length > 0 && phase === 'EXPLORING' && (
        <ItemList items={currentRoom.loot} mode="pickup" />
      )}

      {/* Log — only shown when not in an active event */}
      {phase !== 'EVENT' && <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: 0,
      }}>
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
      </div>}
    </div>
  );
}
