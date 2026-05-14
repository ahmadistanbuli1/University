import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:ring-indigo-400/25',
  secondary:
    'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 ring-1 ring-transparent dark:text-zinc-300 dark:hover:bg-white/10',
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
        'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-indigo-400',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
