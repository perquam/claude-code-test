import { useMemo } from 'react';
import { useGameContext } from './GameContext';
import { getBeastHint } from '../engine/beast';
import type { BeastHint } from '../types/beast';
import type { Room } from '../types/room';

export function useGame() {
  const { state, dispatch, restart } = useGameContext();

  const currentRoom: Room = state.grid[state.player.position.row][state.player.position.col];

  const beastHint: BeastHint | null = useMemo(
    () => getBeastHint(state.player.position, state.beast.position, state.beast.isTracking),
    [state.player.position, state.beast.position, state.beast.isTracking],
  );

  const canUseExit = useMemo(
    () =>
      state.player.hasKey &&
      state.player.position.row === state.exitPosition.row &&
      state.player.position.col === state.exitPosition.col,
    [state.player.hasKey, state.player.position, state.exitPosition],
  );

  return { state, dispatch, restart, currentRoom, beastHint, canUseExit };
}
