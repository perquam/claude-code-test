import DungeonMap from '../map/DungeonMap';
import RoomPanel from '../room/RoomPanel';
import PlayerStats from '../player/PlayerStats';
import TurnIndicator from '../ui/TurnIndicator';
import Modal from '../ui/Modal';
import { useGame } from '../../store/useGame';

export default function GameLayout() {
  const { state, restart } = useGame();
  const isOver = state.phase === 'GAME_OVER' || state.phase === 'VICTORY';

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      gridTemplateColumns: '1fr 1.3fr',
      height: '100vh',
      gap: 0,
      background: 'var(--color-void)',
    }}>
      {/* Top bar spanning both columns */}
      <div style={{ gridColumn: '1 / -1' }}>
        <TurnIndicator />
      </div>

      {/* Left panel: map + player stats below */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        borderRight: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        <DungeonMap />
        <PlayerStats />
      </div>

      {/* Right panel — RoomPanel is a direct grid item, gets full cell height */}
      <RoomPanel />

      {isOver && <Modal onRestart={restart} />}
    </div>
  );
}
