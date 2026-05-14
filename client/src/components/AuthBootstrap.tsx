import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux.js';
import { hydrateFromStorage } from '../store/authSlice.js';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);
  return null;
}
