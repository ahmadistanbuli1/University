import { type LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn('text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400', className)} {...props} />;
}
