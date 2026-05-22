import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

export function FeedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        'm-0 list-none divide-y divide-zinc-200/90 rounded-2xl border border-zinc-200/90 bg-white/90 p-0 shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900/70',
        className
      )}
    >
      {children}
    </ul>
  );
}

type FeedListItemProps = {
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function FeedListItem({ title, meta, children, className }: FeedListItemProps) {
  return (
    <li className={cn('px-4 py-4', className)}>
      <div className="mb-1 text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</div>
      {meta ? <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{meta}</div> : null}
      {children ? (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {children}
        </div>
      ) : null}
    </li>
  );
}
