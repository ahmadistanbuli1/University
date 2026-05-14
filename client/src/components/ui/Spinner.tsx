import { cn } from '../../lib/cn.js';

type SpinnerProps = { className?: string };

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600 dark:border-zinc-600 dark:border-t-indigo-400',
        className
      )}
      aria-hidden
    />
  );
}
