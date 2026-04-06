import React from 'react';
import type { Room } from '../../types/room';
import type { Direction } from '../../types/game';
import '../../styles/map.css';

const EVENT_ICONS: Record<string, string> = {
  MERCHANT: '🛒',
  TRAP: '⚠',
  SHRINE: '✦',
  WOUNDED_TRAVELER: '⚕',
  MONSTER: '☠',
  TREASURE: '◈',
  LORE: '📜',
  EMPTY: '',
};

const WALL_COLOR = '#1e1e32';
const OPEN_COLOR = 'transparent';

function connectionBorders(connections: Direction[]) {
  const has = new Set(connections);
  return {
    borderTop: `2px solid ${has.has('N') ? OPEN_COLOR : WALL_COLOR}`,
    borderBottom: `2px solid ${has.has('S') ? OPEN_COLOR : WALL_COLOR}`,
    borderLeft: `2px solid ${has.has('W') ? OPEN_COLOR : WALL_COLOR}`,
    borderRight: `2px solid ${has.has('E') ? OPEN_COLOR : WALL_COLOR}`,
  };
}

interface RoomCellProps {
  room: Room;
  isPlayerHere: boolean;
  isExit: boolean;
  isBeastHere: boolean;
}

const RoomCell = React.memo(function RoomCell({ room, isPlayerHere, isExit, isBeastHere }: RoomCellProps) {
  if (!room.hasRoom) {
    return <div className="room-cell void" />;
  }

  const { state } = room;
  const showDetails = state === 'VISITED' || state === 'CURRENT';

  const eventIcon = room.event && !room.eventResolved
    ? (EVENT_ICONS[room.event.type] ?? '')
    : '';

  const hasLoot = room.loot.length > 0;

  // Show connection borders on visited/current rooms so the player can see passages
  const borderStyle = showDetails ? connectionBorders(room.connections) : undefined;

  return (
    <div
      className={`room-cell${isExit ? ' is-exit' : ''}`}
      data-state={state}
      style={borderStyle}
      title={state === 'UNDISCOVERED' ? '???' : room.isExit ? 'EXIT' : room.event?.title ?? 'Empty room'}
    >
      {showDetails && (
        <>
          {isExit && <span className="room-icon" style={{ color: 'var(--color-exit)' }}>⬡</span>}
          {!isExit && eventIcon && <span className="room-icon">{eventIcon}</span>}
          {!isExit && !eventIcon && hasLoot && (
            <span className="room-icon" style={{ color: 'var(--color-key)', fontSize: 11 }}>·</span>
          )}
        </>
      )}
      {isPlayerHere && (
        <span className="player-marker">@</span>
      )}
      {isBeastHere && !isPlayerHere && (
        <span className="player-marker" style={{ color: 'var(--color-blood)', fontSize: 12 }}>☠</span>
      )}
    </div>
  );
});

export default RoomCell;
