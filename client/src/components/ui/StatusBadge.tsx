import { cn } from '../../lib/cn.js';

const tones: Record<string, string> = {
  PENDING:
    'bg-amber-100 text-amber-900 ring-1 ring-amber-500/15 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/25',
  APPROVED:
    'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-400/25',
  REJECTED: 'bg-red-100 text-red-900 ring-1 ring-red-600/15 dark:bg-red-500/15 dark:text-red-100 dark:ring-red-400/25',
  PROCESSED: 'bg-sky-100 text-sky-900 ring-1 ring-sky-600/15 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-400/25',
  AFFAIRS_APPROVED:
    'bg-brand/10 text-brand-dark ring-1 ring-brand/15 dark:bg-brand/15 dark:text-brand-light dark:ring-brand-light/25',
  DELIVERED:
    'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-400/25',
  DRAFT:
    'bg-zinc-100 text-zinc-800 ring-1 ring-zinc-400/20 dark:bg-white/10 dark:text-zinc-200',
  SUBMITTED:
    'bg-amber-100 text-amber-900 ring-1 ring-amber-500/15 dark:bg-amber-500/15 dark:text-amber-100',
  PUBLISHED:
    'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-100',
  PAID: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-400/25',
  PARTIAL:
    'bg-amber-100 text-amber-900 ring-1 ring-amber-500/15 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-400/25',
};

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide',
        tones[status] ?? 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-400/20 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/15'
      )}
    >
      {status}
    </span>
  );
}
