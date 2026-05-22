import { BookOpen, Download, Library, LibraryBig } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { axiosInstance } from '../api/http.js';
import { useBooksQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import {
  DEFAULT_LIBRARY_CATEGORY,
  LIBRARY_CATEGORIES,
  type LibraryCategory,
} from '../lib/library-categories.js';
import { cn } from '../lib/cn.js';
import { resolveMediaUrl } from '../lib/mediaUrl.js';

const BOOKS_PAGE_SIZE = 10;

type Book = {
  id: string;
  title: string;
  filePath: string;
  category?: LibraryCategory;
  readsCount?: number;
  downloadsCount?: number;
  publishYear?: number;
};

export function LibraryPage() {
  const { t } = useTranslation(['nav', 'common']);
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<LibraryCategory>(DEFAULT_LIBRARY_CATEGORY);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const { data, isLoading, isError, isFetching } = useBooksQuery(page, category);

  async function trackRead(book: Book) {
    const url = resolveMediaUrl(book.filePath);
    if (!url) {
      toast.error(t('nav:messages.bookFileMissing'));
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    try {
      await axiosInstance.patch(`/api/library/books/${book.id}/read`);
      void qc.invalidateQueries({ queryKey: ['books'] });
    } catch {
      /* counter optional */
    }
  }

  async function trackDownload(book: Book) {
    const url = resolveMediaUrl(book.filePath);
    if (!url) {
      toast.error(t('nav:messages.bookFileMissing'));
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^\w\u0600-\u06FF.-]+/g, '_')}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    try {
      await axiosInstance.patch(`/api/library/books/${book.id}/download`);
      void qc.invalidateQueries({ queryKey: ['books'] });
      toast.success(t('nav:messages.bookDownloadStarted'));
    } catch {
      toast.error(t('nav:messages.loadError'));
    }
  }

  if (isLoading && !data) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('nav:messages.loadError')}</Alert>;

  const rows = (data?.items ?? []) as Book[];
  const total = data?.total ?? 0;
  const isEmpty = !isFetching && rows.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('nav:headings.publicLibrary')}
        description={t('nav:messages.libraryLead')}
        icon={Library}
      />

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t('nav:library.categoriesLabel')}
      >
        {LIBRARY_CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-violet-600 to-violet-400 text-white shadow-md shadow-violet-600/25 ring-1 ring-violet-500/20'
                  : 'border border-zinc-200/90 bg-white/90 text-zinc-700 hover:border-violet-300/60 hover:bg-violet-50 hover:text-violet-800 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-100'
              )}
            >
              {t(`nav:library.categories.${cat}`)}
            </button>
          );
        })}
      </div>

      {isEmpty ? (
        <Card className="flex flex-col items-center gap-4 border-dashed border-violet-300/50 bg-violet-50/30 py-14 text-center dark:border-violet-500/25 dark:bg-violet-950/20">
          <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600 dark:from-violet-500/20 dark:to-transparent dark:text-violet-300">
            <LibraryBig className="size-8" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="max-w-md">
            <h2 className="m-0 text-lg font-bold text-zinc-900 dark:text-white">
              {t('nav:library.emptyTitle', { category: t(`nav:library.categories.${category}`) })}
            </h2>
            <p className="m-0 mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t('nav:library.emptyDescription')}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <DataTable<Book>
            rowKey={(r) => r.id}
            emptyMessage="—"
            columns={[
              { key: 't', header: t('nav:labels.title'), render: (r) => r.title },
              {
                key: 'y',
                header: t('nav:labels.publishYear'),
                render: (r) => r.publishYear ?? '—',
              },
              {
                key: 'stats',
                header: t('nav:labels.usage'),
                render: (r) => (
                  <span className="text-xs text-zinc-500">
                    {t('nav:labels.reads')}: {r.readsCount ?? 0} · {t('nav:labels.downloads')}:{' '}
                    {r.downloadsCount ?? 0}
                  </span>
                ),
              },
              {
                key: 'act',
                header: t('nav:labels.actions'),
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void trackRead(r)}
                    >
                      <BookOpen className="size-4" aria-hidden />
                      {t('nav:labels.readBook')}
                    </Button>
                    <Button type="button" size="sm" onClick={() => void trackDownload(r)}>
                      <Download className="size-4" aria-hidden />
                      {t('nav:labels.downloadBook')}
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={rows}
          />
          <Pagination
            page={page}
            pageSize={BOOKS_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            summary={
              <>
                {t('nav:labels.page')} {page}
              </>
            }
          />
        </>
      )}
    </section>
  );
}
