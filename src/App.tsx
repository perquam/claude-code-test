import { GameProvider } from './store/GameContext';
import GameLayout from './components/layout/GameLayout';

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
