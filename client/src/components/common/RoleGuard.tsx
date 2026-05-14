import type { ReactNode } from 'react';
import { useAppSelector } from '../../hooks/redux.js';
import type { RootState } from '../../store/index.js';

type RoleGuardProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const role = useAppSelector((s: RootState) => s.auth.user?.role);
  if (!role || !allowedRoles.includes(role)) {
    return null;
  }
  return <>{children}</>;
}
