import { ArrowRight, Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { newsCategoryLabel } from '../../lib/news-categories.js';
import { NewsCover } from '../ui/NewsCover.js';
import { cn } from '../../lib/cn.js';
import type { NewsCardItem } from '../ui/NewsCard.js';

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

type NewsFeedCardProps = {
  item: NewsCardItem;
  featured?: boolean;
  className?: string;
};

export function NewsFeedCard({ item, featured, className }: NewsFeedCardProps) {
  const { t } = useTranslation('nav');
  const summary =
    item.summary ??
    (item.content && item.content.length > 160
      ? `${item.content.slice(0, 160).trim()}…`
      : item.content ?? '');

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition duration-300',
        'hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10',
        'dark:border-white/10 dark:bg-zinc-900/80 dark:hover:border-brand-light/35',
        featured && 'sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-0',
        className
      )}
    >
      <Link to={`/news/${item.id}`} className={cn('block overflow-hidden', featured && 'sm:h-full')}>
        {item.imageUrl ? (
          <NewsCover
            imageUrl={item.imageUrl}
            alt={item.title}
            heightClass={featured ? 'h-52 sm:h-full sm:min-h-[280px]' : 'h-48 sm:h-52'}
          />
        ) : (
          <div
            className={cn(
              'w-full bg-gradient-to-br from-brand/15 via-brand-light/10 to-brand-secondary/15',
              featured ? 'h-52 sm:h-full sm:min-h-[280px]' : 'h-48 sm:h-52'
            )}
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {item.category ? (
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
              {newsCategoryLabel(item.category, t)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden />
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </span>
          {item.author?.name ? (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5 shrink-0" aria-hidden />
              {item.author.name}
            </span>
          ) : null}
        </div>

        <h2 className="text-lg font-black leading-snug tracking-tight text-zinc-900 sm:text-xl dark:text-white">
          <Link to={`/news/${item.id}`} className="hover:text-brand dark:hover:text-brand-light">
            {item.title}
          </Link>
        </h2>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {summary}
        </p>

        <Link
          to={`/news/${item.id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand transition group-hover:gap-2.5 dark:text-brand-light"
        >
          {t('news.readFullStory')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
