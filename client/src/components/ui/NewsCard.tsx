import { Calendar, User } from 'lucide-react';
import { newsCategoryLabel } from '../../lib/news-categories.js';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from './Card.js';
import { NewsCover } from './NewsCover.js';
import { cn } from '../../lib/cn.js';

export type NewsCardItem = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  createdAt: string;
  imageUrl?: string | null;
  category?: string;
  college?: { id: string; name: string } | null;
  author?: { name?: string };
};

type NewsCardProps = {
  item: NewsCardItem;
  className?: string;
  variant?: 'card' | 'compact';
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

export function NewsCard({ item, className, variant = 'card' }: NewsCardProps) {
  const { t } = useTranslation('nav');
  const excerptLen = variant === 'compact' ? 140 : 200;
  const excerpt =
    item.summary ??
    (item.content && item.content.length > excerptLen
      ? `${item.content.slice(0, excerptLen).trim()}…`
      : item.content ?? '');
  const author = item.author?.name?.trim();
  const hasImage = Boolean(item.imageUrl);

  return (
    <Card
      className={cn(
        'group relative flex h-full flex-col overflow-hidden border-zinc-200/90 p-0 transition duration-300 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lg hover:shadow-brand/10 dark:border-white/10 dark:hover:border-brand-light/40',
        className
      )}
    >
      <Link to={`/news/${item.id}`} className="block">
        {hasImage ? (
          <NewsCover imageUrl={item.imageUrl} alt={item.title} heightClass="h-48 sm:h-52" />
        ) : (
          <div
            className="h-1.5 w-full bg-gradient-to-r from-brand via-brand-light to-brand-secondary"
            aria-hidden
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {item.category ? (
            <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-1 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
              {newsCategoryLabel(item.category, t)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/10">
            <Calendar className="size-3.5 shrink-0 text-brand dark:text-brand-light" aria-hidden />
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </span>
          {author ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/10">
              <User className="size-3.5 shrink-0 text-brand dark:text-brand-light" aria-hidden />
              {author}
            </span>
          ) : null}
        </div>
        <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-900 sm:text-xl dark:text-white">
          <Link to={`/news/${item.id}`} className="hover:text-brand dark:hover:text-brand-light">
            {item.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{excerpt}</p>
      </div>
    </Card>
  );
}
