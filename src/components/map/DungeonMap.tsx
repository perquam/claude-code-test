import React from 'react';
import { useGame } from '../../store/useGame';
import { GRID_SIZE } from '../../engine/grid';
import type { Room } from '../../types/room';
import '../../styles/map.css';

const DISPLAY_SIZE = GRID_SIZE * 2 - 1; // 27 for a 14×14 dungeon

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

/** A room cell (even row, even col in the display grid) */
const RoomCell = React.memo(function RoomCell({
  room,
  isPlayerHere,
  isExit,
  isBeastHere,
}: {
  room: Room;
  isPlayerHere: boolean;
  isExit: boolean;
  isBeastHere: boolean;
}) {
  if (!room.hasRoom) return <div className="map-cell void" />;

  const { state } = room;
  const showDetails = state === 'VISITED' || state === 'CURRENT';
  const eventIcon =
    room.event && !room.eventResolved ? (EVENT_ICONS[room.event.type] ?? '') : '';
  const hasLoot = room.loot.length > 0;

  return (
    <div
      className={`map-cell room${isExit ? ' is-exit' : ''}`}
      data-state={state}
      title={
        state === 'UNDISCOVERED'
          ? '???'
          : room.isExit
          ? 'EXIT'
          : room.event?.title ?? 'Empty room'
      }
    >
      {isPlayerHere && <span className="player-marker">@</span>}
      {isBeastHere && !isPlayerHere && (
        <span className="player-marker" style={{ color: 'var(--color-blood)' }}>
          ☠
        </span>
      )}
      {!isPlayerHere && !isBeastHere && showDetails && (
        <>
          {isExit && (
            <span className="room-icon" style={{ color: 'var(--color-exit)' }}>
              ⬡
            </span>
          )}
          {!isExit && eventIcon && <span className="room-icon">{eventIcon}</span>}
          {!isExit && !eventIcon && hasLoot && (
            <span
              className="room-icon"
              style={{ color: 'var(--color-key)', fontSize: 11 }}
            >
              ·
            </span>
          )}
        </>
      )}
    </div>
  );
});

/** Determine the visibility of a corridor between two rooms */
function corridorState(a: Room, b: Room): 'visible' | 'hidden' {
  if (!a.hasRoom || !b.hasRoom) return 'hidden';
  // Show corridor if either room has been seen
  const aSeen = a.state === 'VISITED' || a.state === 'CURRENT';
  const bSeen = b.state === 'VISITED' || b.state === 'CURRENT';
  return aSeen || bSeen ? 'visible' : 'hidden';
}

/** Check if room A connects to room B via the given direction */
function isConnected(room: Room, dir: 'N' | 'S' | 'E' | 'W'): boolean {
  return room.connections.includes(dir);
}

export default function DungeonMap() {
  const { state, beastHint } = useGame();
  const { grid, player, exitPosition } = state;

  const cells: React.ReactNode[] = [];

  for (let dr = 0; dr < DISPLAY_SIZE; dr++) {
    for (let dc = 0; dc < DISPLAY_SIZE; dc++) {
      const isRoomRow = dr % 2 === 0;
      const isRoomCol = dc % 2 === 0;
      const key = `${dr}-${dc}`;

      if (isRoomRow && isRoomCol) {
        // Room cell
        const r = dr / 2;
        const c = dc / 2;
        const room = grid[r][c];
        cells.push(
          <RoomCell
            key={key}
            room={room}
            isPlayerHere={r === player.position.row && c === player.position.col}
            isExit={r === exitPosition.row && c === exitPosition.col}
            isBeastHere={
              !state.beast.isDefeated &&
              r === state.beast.position.row &&
              c === state.beast.position.col
            }
          />,
        );
      } else if (isRoomRow && !isRoomCol) {
        // Horizontal corridor (between room at col (dc-1)/2 and (dc+1)/2)
        const r = dr / 2;
        const cLeft = (dc - 1) / 2;
        const cRight = (dc + 1) / 2;
        const roomLeft = grid[r][cLeft];
        const roomRight = grid[r][cRight];
        const connected = roomLeft.hasRoom && isConnected(roomLeft, 'E');
        const vis = corridorState(roomLeft, roomRight);
        cells.push(
          <div
            key={key}
            className={`map-cell corridor h ${connected && vis === 'visible' ? 'open' : 'wall'}`}
          />,
        );
      } else if (!isRoomRow && isRoomCol) {
        // Vertical corridor (between room at row (dr-1)/2 and (dr+1)/2)
        const rTop = (dr - 1) / 2;
        const c = dc / 2;
        const roomTop = grid[rTop][c];
        const roomBottom = grid[rTop + 1][c];
        const connected = roomTop.hasRoom && isConnected(roomTop, 'S');
        const vis = corridorState(roomTop, roomBottom);
        cells.push(
          <div
            key={key}
            className={`map-cell corridor v ${connected && vis === 'visible' ? 'open' : 'wall'}`}
          />,
        );
      } else {
        // Corner (odd,odd) — always void
        cells.push(<div key={key} className="map-cell corner" />);
      }
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <div
        className="dungeon-map"
        style={{
          gridTemplateColumns: `repeat(${DISPLAY_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${DISPLAY_SIZE}, 1fr)`,
        }}
      >
        {cells}
      </div>
      {beastHint && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: 'var(--color-blood)',
            fontFamily: 'var(--font-mono)',
            paddingLeft: 12,
          }}
        >
          The Warden stirs {beastHint.direction} ({beastHint.distance} rooms away)
        </div>
      )}
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: 'var(--color-parchment-dim)',
          fontFamily: 'var(--font-mono)',
          paddingLeft: 12,
        }}
      >
        WASD / Arrow keys to move
      </div>
    </div>
  );
}
