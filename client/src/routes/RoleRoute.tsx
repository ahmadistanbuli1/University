import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux.js';
import type { RootState } from '../store/index.js';
import { defaultRouteForRole } from '../lib/defaultRouteForRole.js';

type RoleRouteProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const role = useAppSelector((s: RootState) => s.auth.user?.role);
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to={defaultRouteForRole(role)} replace />;
  }
  return <>{children}</>;
}
