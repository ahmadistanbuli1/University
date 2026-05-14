import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export type IconTileTone = 'soft' | 'onAccent';

type IconTileProps = {
  icon: LucideIcon;
  tone?: IconTileTone;
  className?: string;
};

export function IconTile({ icon: Icon, tone = 'soft', className }: IconTileProps) {
  return (
    <span
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-2xl transition-colors',
        tone === 'soft' &&
          'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-indigo-200',
        tone === 'onAccent' && 'bg-white/20 text-white',
        className
      )}
      aria-hidden
    >
      <Icon className="size-[1.35rem]" strokeWidth={1.75} />
    </span>
  );
}
