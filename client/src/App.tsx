import { BrowserRouter } from 'react-router-dom';
import { MotionToaster } from './components/motion/MotionToaster.js';
import { AppBootSplash } from './components/AppBootSplash.js';
import { AuthBootstrap } from './components/AuthBootstrap.js';
import { ThemeBootstrap } from './components/ThemeBootstrap.js';
import { useAppSelector } from './hooks/redux.js';
import { AppRouter } from './routes/AppRouter.js';

function AppToaster() {
  const mode = useAppSelector((s) => s.theme.mode);
  return <MotionToaster theme={mode === 'dark' ? 'dark' : 'light'} />;
}

export function App() {
  return (
    <BrowserRouter>
      <AppBootSplash />
      <ThemeBootstrap />
      <AuthBootstrap />
      <AppRouter />
      <AppToaster />
    </BrowserRouter>
  );
}
