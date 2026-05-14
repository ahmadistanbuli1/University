import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/25',
        className
      )}
      {...props}
    />
  );
});
