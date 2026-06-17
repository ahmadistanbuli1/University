import { Calendar, ChevronLeft, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useNewsDetailQuery } from '../api/hooks.js';
import { NewsGallery } from '../components/news/NewsGallery.js';
import { Alert } from '../components/ui/Alert.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { NewsCover } from '../components/ui/NewsCover.js';
import { newsCategoryLabel } from '../lib/news-categories.js';
import { cn } from '../lib/cn.js';

function formatLongDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ArticleBody({ content }: { content: string }) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden text-base leading-8 text-zinc-700 dark:text-zinc-200">
      <div className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">{content}</div>
    </div>
  );
}

type NewsDetailPageProps = {
  id: string;
};

export function NewsDetailPage({ id }: NewsDetailPageProps) {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useNewsDetailQuery(id);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const article = data as {
    id: string;
    title: string;
    summary: string;
    content: string;
    imageUrl?: string | null;
    category?: string;
    createdAt: string;
    author?: { name?: string };
    college?: { name?: string } | null;
    galleryImages?: Array<{ id: string; imageUrl: string }>;
  };

  return (
    <article className="mx-auto min-w-0 w-full max-w-4xl">
      <Link
        to="/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline dark:text-brand-light"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t('news.backToNews')}
      </Link>

      {article.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 shadow-lg dark:border-white/10">
          <NewsCover imageUrl={article.imageUrl} alt={article.title} heightClass="h-56 sm:h-80 md:h-[28rem]" />
        </div>
      ) : null}

      <header className={cn('mt-8 border-b border-zinc-200/80 pb-6 dark:border-white/10', !article.imageUrl && 'mt-0')}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          {article.category ? (
            <span className="rounded-full bg-brand/10 px-3 py-1 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
              {newsCategoryLabel(article.category, t)}
            </span>
          ) : null}
          {article.college?.name ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900 dark:bg-amber-500/15 dark:text-amber-100">
              {article.college.name}
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-white/10">
              {t('news.universityWide')}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-white">
          {article.title}
        </h1>

        {article.summary ? (
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">{article.summary}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-2">
            <Calendar className="size-4 text-brand dark:text-brand-light" aria-hidden />
            <time dateTime={article.createdAt}>{formatLongDate(article.createdAt)}</time>
          </span>
          {article.author?.name ? (
            <span className="inline-flex items-center gap-2">
              <User className="size-4 text-brand dark:text-brand-light" aria-hidden />
              {article.author.name}
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-8 min-w-0 max-w-full">
        <ArticleBody content={article.content} />
      </div>

      {article.galleryImages?.length ? (
        <section className="mt-12 border-t border-zinc-200/80 pt-10 dark:border-white/10">
          <h2 className="mb-5 text-xl font-black text-zinc-900 dark:text-white">{t('news.photoGallery')}</h2>
          <NewsGallery images={article.galleryImages} />
        </section>
      ) : null}
    </article>
  );
}
