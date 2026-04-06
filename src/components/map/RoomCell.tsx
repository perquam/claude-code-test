import React from 'react';
import type { Room } from '../../types/room';
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

  return (
    <div
      className={`room-cell${isExit ? ' is-exit' : ''}`}
      data-state={state}
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
