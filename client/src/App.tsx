import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthBootstrap } from './components/AuthBootstrap.js';
import { ThemeBootstrap } from './components/ThemeBootstrap.js';
import { useAppSelector } from './hooks/redux.js';
import { AppRouter } from './routes/AppRouter.js';

function AppToaster() {
  const mode = useAppSelector((s) => s.theme.mode);
  return <Toaster richColors theme={mode === 'dark' ? 'dark' : 'light'} position="top-center" closeButton />;
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeBootstrap />
      <AuthBootstrap />
      <AppRouter />
      <AppToaster />
    </BrowserRouter>
  );
}
