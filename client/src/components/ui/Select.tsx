import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-100 dark:focus:border-brand-light dark:focus:ring-brand-light/25',
        className
      )}
      {...props}
    />
  );
});
