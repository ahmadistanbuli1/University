import { useLayoutEffect } from 'react';
import { useAppSelector } from '../hooks/redux.js';

/** Keeps `document.documentElement` in sync with Redux theme (Tailwind `dark:`). */
export function ThemeBootstrap() {
  const mode = useAppSelector((s) => s.theme.mode);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return null;
}
