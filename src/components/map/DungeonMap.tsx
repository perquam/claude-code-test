import { useGame } from '../../store/useGame';
import RoomCell from './RoomCell';
import BeastHint from './BeastHint';
import '../../styles/map.css';

export default function DungeonMap() {
  const { state, beastHint } = useGame();
  const { grid, player, exitPosition } = state;

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <div className="dungeon-map">
        {grid.flat().map(room => (
          <RoomCell
            key={`${room.position.row}-${room.position.col}`}
            room={room}
            isPlayerHere={
              room.position.row === player.position.row &&
              room.position.col === player.position.col
            }
            isExit={
              room.position.row === exitPosition.row &&
              room.position.col === exitPosition.col
            }
            isBeastHere={
              !state.beast.isDefeated &&
              room.position.row === state.beast.position.row &&
              room.position.col === state.beast.position.col
            }
          />
        ))}
      </div>
      <BeastHint hint={beastHint} />
      <div style={{
        marginTop: 8,
        fontSize: 11,
        color: 'var(--color-parchment-dim)',
        fontFamily: 'var(--font-mono)',
        paddingLeft: 12,
      }}>
        WASD / Arrow keys to move
      </div>
    </div>
  );
}
