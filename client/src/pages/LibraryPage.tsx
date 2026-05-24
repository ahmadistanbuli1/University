import { BookOpen, Download, Library, LibraryBig, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { axiosInstance } from '../api/http.js';
import { useBooksQuery, type LibraryBooksFilters } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LibraryTableSkeleton } from '../components/ui/Skeleton.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import {
  EMPTY_LIBRARY_FILTERS,
  LIBRARY_FILTER_AUTHORS,
  LIBRARY_FILTER_PUBLISHERS,
} from '../lib/library-filter-options.js';
import { LIBRARY_CATEGORIES, libraryPublishYearOptions, type LibraryCategory } from '../lib/library-categories.js';
import { cn } from '../lib/cn.js';
import { resolveMediaUrl } from '../lib/mediaUrl.js';

const BOOKS_PAGE_SIZE = 10;

type Book = {
  id: string;
  title: string;
  filePath: string;
  category?: LibraryCategory;
  author?: string | null;
  publisher?: string | null;
  readsCount?: number;
  downloadsCount?: number;
  publishYear?: number;
};

export function LibraryPage() {
  const { t } = useTranslation(['nav', 'common']);
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<LibraryBooksFilters>({ ...EMPTY_LIBRARY_FILTERS });
  const [applied, setApplied] = useState<LibraryBooksFilters>({ ...EMPTY_LIBRARY_FILTERS });

  const apiFilters = useMemo((): LibraryBooksFilters | undefined => {
    const f: LibraryBooksFilters = {};
    if (applied.category) f.category = applied.category;
    if (applied.keyword?.trim()) f.keyword = applied.keyword.trim();
    if (applied.publishYear) f.publishYear = Number(applied.publishYear);
    if (applied.author?.trim()) f.author = applied.author.trim();
    if (applied.publisher?.trim()) f.publisher = applied.publisher.trim();
    return Object.keys(f).length ? f : undefined;
  }, [applied]);

  useEffect(() => {
    setPage(1);
  }, [apiFilters]);

  const { data, isError, isPending, isFetching } = useBooksQuery(page, apiFilters);
  const showTableSkeleton = isPending && data === undefined;

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

  function applyFilters() {
    setApplied({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    setDraft({ ...EMPTY_LIBRARY_FILTERS });
    setApplied({ ...EMPTY_LIBRARY_FILTERS });
    setPage(1);
  }

  if (isError) return <Alert variant="error">{t('nav:messages.loadError')}</Alert>;

  const rows = (data?.items ?? []) as Book[];
  const total = data?.total ?? 0;
  const isEmpty = !showTableSkeleton && !isFetching && rows.length === 0;
  const yearOptions = libraryPublishYearOptions();
  const activeCategoryLabel = applied.category
    ? t(`nav:library.categories.${applied.category}`)
    : t('nav:library.allCategories');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('nav:headings.publicLibrary')}
        description={t('nav:messages.libraryLead')}
        icon={Library}
      />

      <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50/40 to-white/80 p-4 sm:p-5 dark:border-violet-500/20 dark:from-violet-950/30 dark:to-zinc-900/40">
        <div className="flex flex-col gap-4">
          <Field label={t('nav:library.searchLabel')} className="m-0">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <Input
                className="ps-10"
                placeholder={t('nav:library.searchPlaceholder')}
                value={draft.keyword ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
              />
            </div>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t('nav:library.bookCategory')} className="m-0">
              <Select
                value={draft.category ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              >
                <option value="">{t('nav:library.allCategories')}</option>
                {LIBRARY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`nav:library.categories.${cat}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('nav:labels.publishYear')} className="m-0">
              <Select
                value={draft.publishYear === '' || draft.publishYear === undefined ? '' : String(draft.publishYear)}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    publishYear: e.target.value ? Number(e.target.value) : '',
                  }))
                }
              >
                <option value="">{t('nav:library.allYears')}</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('nav:labels.author')} className="m-0">
              <Select
                value={draft.author ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
              >
                <option value="">{t('nav:library.allAuthors')}</option>
                {LIBRARY_FILTER_AUTHORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('nav:labels.publisher')} className="m-0">
              <Select
                value={draft.publisher ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, publisher: e.target.value }))}
              >
                <option value="">{t('nav:library.allPublishers')}</option>
                {LIBRARY_FILTER_PUBLISHERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={applyFilters} className="gap-2">
              <Search className="size-4" aria-hidden />
              {t('nav:library.applyFilters')}
            </Button>
            <Button type="button" variant="secondary" onClick={resetFilters} className="gap-2">
              <RotateCcw className="size-4" aria-hidden />
              {t('nav:library.resetFilters')}
            </Button>
          </div>
        </div>
      </Card>

      <p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
        {t('nav:library.resultsSummary', {
          count: total,
          category: activeCategoryLabel,
        })}
      </p>

      {showTableSkeleton ? (
        <LibraryTableSkeleton rows={3} />
      ) : isEmpty ? (
        <Card className="flex flex-col items-center gap-4 border-dashed border-violet-300/50 bg-violet-50/30 py-14 text-center dark:border-violet-500/25 dark:bg-violet-950/20">
          <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600 dark:from-violet-500/20 dark:to-transparent dark:text-violet-300">
            <LibraryBig className="size-8" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="max-w-md">
            <h2 className="m-0 text-lg font-bold text-zinc-900 dark:text-white">
              {t('nav:library.emptyFilteredTitle')}
            </h2>
            <p className="m-0 mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t('nav:library.emptyFilteredDescription')}
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
                key: 'cat',
                header: t('nav:library.bookCategory'),
                render: (r) =>
                  r.category ? (
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                        r.category === 'GRADUATION_PROJECT'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100'
                          : 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200'
                      )}
                    >
                      {t(`nav:library.categories.${r.category}`)}
                    </span>
                  ) : (
                    '—'
                  ),
              },
              {
                key: 'auth',
                header: t('nav:labels.author'),
                render: (r) => r.author ?? '—',
              },
              {
                key: 'pub',
                header: t('nav:labels.publisher'),
                render: (r) => r.publisher ?? '—',
              },
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
