import { useEffect } from 'react';
import { axiosInstance } from '../api/http.js';
import { useAppDispatch } from '../hooks/redux.js';
import type { AuthUser } from '../store/authSlice.js';
import { clearCredentials, setCredentials } from '../store/authSlice.js';

/** Restore session from HttpOnly auth cookie on app load. */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { data } = await axiosInstance.get<{ user: AuthUser }>('/api/auth/me');
        if (!cancelled) {
          dispatch(setCredentials({ user: data.user }));
        }
      } catch {
        if (!cancelled) {
          dispatch(clearCredentials());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
