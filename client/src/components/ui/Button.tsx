import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

const variants = {
  primary:
    'bg-gradient-to-r from-brand to-brand-light text-white shadow-md shadow-brand/20 ring-1 ring-inset ring-white/10 hover:from-brand-dark hover:to-brand dark:from-brand dark:to-brand-light dark:hover:from-brand-light dark:hover:to-brand-secondary/90',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] ring-1 ring-inset ring-[var(--color-border)] hover:bg-zinc-50 dark:bg-[var(--color-surface-dark)] dark:text-[var(--color-text-primary-dark)] dark:ring-[var(--color-border-dark)] dark:hover:bg-zinc-800/80',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] ring-1 ring-transparent hover:bg-black/[0.04] dark:text-[var(--color-text-secondary-dark)] dark:hover:bg-white/10',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-500 dark:hover:bg-red-400',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-xl',
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-brand-light',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
