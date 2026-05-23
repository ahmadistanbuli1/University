import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux.js';
import { hydrateFromStorage } from '../store/authSlice.js';

/** Re-sync auth when another tab changes localStorage (login/logout). */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'university_token' || e.key === 'university_user') {
        dispatch(hydrateFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch]);
  return null;
}
