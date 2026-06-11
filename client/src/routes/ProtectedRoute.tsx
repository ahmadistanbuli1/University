import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/ui/LoadingState.js';
import { useAppSelector } from '../hooks/redux.js';

export function ProtectedRoute() {
  const status = useAppSelector((s) => s.auth.status);
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  if (status === 'unknown') {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
