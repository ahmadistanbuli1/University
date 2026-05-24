import { Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from './Card.js';
import { newsCategoryLabel } from '../../lib/news-categories.js';
import { cn } from '../../lib/cn.js';
import type { NewsCardItem } from './NewsCard.js';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

type NewsTimelineProps = {
  items: NewsCardItem[];
  className?: string;
};

export function NewsTimeline({ items, className }: NewsTimelineProps) {
  const { t } = useTranslation('nav');
  return (
    <ol className={cn('relative m-0 list-none space-y-0 p-0', className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative pb-10 ps-8 sm:ps-10 last:pb-0">
          {index < items.length - 1 ? (
            <span
              className="absolute start-[0.6875rem] top-4 bottom-0 w-0.5 bg-gradient-to-b from-violet-400/80 to-violet-200/30 dark:from-violet-500/60 dark:to-transparent"
              aria-hidden
            />
          ) : null}
          <span
            className="absolute start-0 top-1.5 grid size-6 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-[10px] font-black text-white shadow-md ring-4 ring-white dark:ring-zinc-900"
            aria-hidden
          >
            {index + 1}
          </span>
          <Card className="overflow-hidden border-zinc-200/90 p-0 transition hover:border-violet-300/60 hover:shadow-lg dark:border-white/10">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-400" aria-hidden />
            <article className="p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200">
                  <Calendar className="size-3.5 shrink-0" aria-hidden />
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                </span>
                {item.category ? (
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200">
                    {newsCategoryLabel(item.category, t)}
                  </span>
                ) : null}
                {item.college?.name ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900 dark:bg-amber-500/15 dark:text-amber-100">
                    {item.college.name}
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/10">
                    {t('news.universityWide')}
                  </span>
                )}
                {item.author?.name ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/10">
                    <User className="size-3.5 shrink-0" aria-hidden />
                    {item.author.name}
                  </span>
                ) : null}
              </div>
              <h2 className="text-xl font-black tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
                {item.title}
              </h2>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
                {item.content}
              </div>
            </article>
          </Card>
        </li>
      ))}
    </ol>
  );
}
