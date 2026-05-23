import { cn } from '../../lib/cn.js';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-zinc-200/80 via-zinc-100 to-zinc-200/80 bg-[length:200%_100%] dark:from-zinc-800 dark:via-zinc-700/80 dark:to-zinc-800',
        className
      )}
      aria-hidden
    />
  );
}

const LIBRARY_TABLE_COLS = 4;

export function LibraryTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="overflow-x-auto rounded-2xl border border-zinc-200/90 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-none"
      aria-busy="true"
      aria-label="Loading"
    >
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/90 dark:border-white/10 dark:bg-white/5">
            {Array.from({ length: LIBRARY_TABLE_COLS }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr
              key={row}
              className="border-b border-zinc-100 last:border-0 dark:border-white/5"
            >
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-full max-w-xs" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-xl" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-white/10 dark:bg-zinc-900/60">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-full max-w-md" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full max-w-[92%]" />
      <Skeleton className="h-3 w-full max-w-[70%]" />
    </div>
  );
}
