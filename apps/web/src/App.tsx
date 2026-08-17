import { useEffect } from 'react';
import { useGame } from './store/gameStore';
import { Splash, Title, Auth, CreateTeam } from './pages/Entry';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const bootstrap = useGame((s) => s.bootstrap);

  useEffect(() => {
    const t = setTimeout(() => {
      useGame.getState().screen === 'splash' && setScreen('title');
    }, 1600);
    bootstrap().catch(console.error);
    return () => clearTimeout(t);
  }, [bootstrap, setScreen]);

  if (screen === 'splash') return <Splash />;
  if (screen === 'title') return <Title />;
  if (screen === 'auth') return <Auth />;
  if (screen === 'create-team') return <CreateTeam />;
  return <Dashboard />;
}
