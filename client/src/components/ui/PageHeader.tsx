import type { LucideIcon } from 'lucide-react';
import { IconTile } from './IconTile.js';
import { cn } from '../../lib/cn.js';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <header className={cn('mb-8 flex flex-col gap-5 sm:flex-row sm:items-start', Icon && 'sm:gap-6')}>
      {Icon ? <IconTile icon={Icon} className="size-12 rounded-[1.15rem] bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100" /> : null}
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
