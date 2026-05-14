import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

export function ActionStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-w-40 flex-col gap-2', className)}>{children}</div>;
}

export function ActionRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>;
}
