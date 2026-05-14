import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export function Mono({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800', className)} {...props} />;
}
