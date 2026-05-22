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
