import { useGame } from '../../store/useGame';

const PHASE_LABELS: Record<string, string> = {
  EXPLORING: 'Exploring',
  EVENT: 'Event',
  COMBAT: 'Combat',
  INVENTORY: 'Inventory',
  LEVEL_UP: 'Level Up!',
  GAME_OVER: 'Defeated',
  VICTORY: 'Escaped',
};

export default function TurnIndicator() {
  const { state } = useGame();
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 16px',
      background: 'var(--color-shadow)',
      borderBottom: '1px solid var(--color-border)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--color-parchment-dim)',
    }}>
      <span style={{ color: 'var(--color-torch)', fontWeight: 'bold', letterSpacing: '0.08em' }}>
        THE DUNGEON
      </span>
      <span>
        Turn{' '}
        <span style={{ color: 'var(--color-parchment)' }}>{state.turn}</span>
      </span>
      <span style={{
        color: state.phase === 'COMBAT'
          ? 'var(--color-blood)'
          : state.phase === 'VICTORY'
          ? 'var(--color-exit)'
          : 'var(--color-parchment-dim)',
      }}>
        {PHASE_LABELS[state.phase] ?? state.phase}
      </span>
    </div>
  );
}
