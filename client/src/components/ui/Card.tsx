import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-none',
        className
      )}
      {...props}
    />
  );
}
