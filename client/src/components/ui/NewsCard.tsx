import { Calendar, User } from 'lucide-react';
import { Card } from './Card.js';
import { cn } from '../../lib/cn.js';

export type NewsCardItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category?: string;
  college?: { id: string; name: string } | null;
  author?: { name?: string };
};

type NewsCardProps = {
  item: NewsCardItem;
  className?: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function NewsCard({ item, className }: NewsCardProps) {
  const excerpt =
    item.content.length > 200 ? `${item.content.slice(0, 200).trim()}…` : item.content;
  const author = item.author?.name?.trim();

  return (
    <Card
      className={cn(
        'group relative flex h-full flex-col overflow-hidden border-zinc-200/90 p-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#7C3AED]/35 hover:shadow-lg hover:shadow-[#7C3AED]/10 dark:border-white/10 dark:hover:border-[#8B5CF6]/40',
        className
      )}
    >
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#C084FC]"
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/10">
            <Calendar className="size-3.5 shrink-0 text-[#7C3AED] dark:text-[#A78BFA]" aria-hidden />
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </span>
          {author ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/10">
              <User className="size-3.5 shrink-0 text-[#7C3AED] dark:text-[#A78BFA]" aria-hidden />
              {author}
            </span>
          ) : null}
        </div>
        <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-900 dark:text-white">
          {item.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{excerpt}</p>
      </div>
    </Card>
  );
}
