import type { LucideIcon } from 'lucide-react';
import { IconTile } from './IconTile.js';

type StatCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
};

export function StatCard({ title, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/55 dark:shadow-none">
      <div className="pointer-events-none absolute -end-6 -top-6 size-24 rounded-full bg-indigo-500/5 dark:bg-indigo-400/10" aria-hidden />
      <div className="relative flex items-start gap-3">
        {Icon ? <IconTile icon={Icon} className="size-11 rounded-xl" /> : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-zinc-900 dark:text-white">{value}</p>
          {hint ? <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
