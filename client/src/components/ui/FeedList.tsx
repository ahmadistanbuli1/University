import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

export function FeedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        'm-0 list-none divide-y divide-slate-200 rounded-2xl border border-slate-200/90 bg-white p-0 shadow-sm',
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
      <div className="mb-1 text-base font-bold text-slate-900">{title}</div>
      {meta ? <div className="mb-2 text-xs text-slate-500">{meta}</div> : null}
      {children ? <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{children}</div> : null}
    </li>
  );
}
