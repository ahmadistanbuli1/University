import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type AlertProps = HTMLAttributes<HTMLParagraphElement> & {
  variant: 'error' | 'success' | 'info';
};

const styles: Record<AlertProps['variant'], string> = {
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-100',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100',
  info: 'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100',
};

export function Alert({ variant, className, ...props }: AlertProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : undefined}
      className={cn('rounded-xl border px-3 py-2 text-sm', styles[variant], className)}
      {...props}
    />
  );
}
