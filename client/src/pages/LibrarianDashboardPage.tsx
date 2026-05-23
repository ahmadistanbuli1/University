import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Download, LayoutDashboard, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  useDeleteBookMutation,
  useLibrarianBooksQuery,
  useLibraryStatsQuery,
  type LibraryStatsDto,
  useUpdateBookMutation,
} from '../api/hooks.js';
import { MotionDialog } from '../components/motion/MotionDialog.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { StatCard } from '../components/ui/StatCard.js';
import { useAppSelector } from '../hooks/redux.js';
import { librarianBookFieldsSchema, type LibrarianEditBookFormValues } from '../lib/form-schemas.js';
import {
  LIBRARY_CATEGORIES,
  type LibraryCategory,
} from '../lib/library-categories.js';
import { chartTickStyle, truncateChartLabel } from '../lib/chart-utils.js';
import { resolveMediaUrl } from '../lib/mediaUrl.js';

const BRAND = { primary: '#7C3AED', secondary: '#A78BFA', glow: '#C084FC', dark: '#8B5CF6' };
const PIE_COLORS = [BRAND.primary, BRAND.secondary, '#6366f1', BRAND.glow, '#c4b5fd', '#94a3b8', '#e879f9'];

type BookRow = {
  id: string;
  title: string;
  filePath: string;
  category: LibraryCategory;
  publishYear: number;
  readsCount: number;
  downloadsCount: number;
  keywords?: Array<{ keyword: string }>;
};

export function LibrarianDashboardPage() {
  const { t } = useTranslation('nav');
  const isDark = useAppSelector((s) => s.theme.mode === 'dark');
  const { data: stats, isLoading: statsLoading, isError: statsError } = useLibraryStatsQuery();
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const { data: booksData, isLoading: booksLoading } = useLibrarianBooksQuery(
    page,
    filterCategory || undefined
  );
  const updateBook = useUpdateBookMutation();
  const deleteBook = useDeleteBookMutation();

  const [editBook, setEditBook] = useState<BookRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookRow | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LibrarianEditBookFormValues>({
    resolver: zodResolver(librarianBookFieldsSchema),
  });

  const pieData = useMemo(
    () =>
      (stats?.byCategory ?? []).map((row: LibraryStatsDto['byCategory'][number]) => ({
        name: t(`library.categories.${row.category}`),
        value: row.count,
        category: row.category,
      })),
    [stats?.byCategory, t]
  );

  const readsByBook = useMemo(
    () =>
      (stats?.topByReads ?? []).slice(0, 8).map((b: LibraryStatsDto['topByReads'][number]) => ({
        name: truncateChartLabel(b.title, 24),
        fullName: b.title,
        reads: b.readsCount,
        downloads: b.downloadsCount,
      })),
    [stats?.topByReads]
  );

  const categoryActivity = useMemo(
    () =>
      (stats?.byCategory ?? []).map((row: LibraryStatsDto['byCategory'][number]) => ({
        name: truncateChartLabel(t(`library.categories.${row.category}`), 18),
        fullName: t(`library.categories.${row.category}`),
        reads: row.reads,
        downloads: row.downloads,
      })),
    [stats?.byCategory, t]
  );

  const yAxisWidth = useMemo(() => {
    const labels = [
      ...readsByBook.map((r) => r.name),
      ...categoryActivity.map((c) => c.name),
    ];
    const longest = labels.reduce((m, s) => Math.max(m, s.length), 0);
    return Math.min(200, Math.max(96, longest * 7));
  }, [readsByBook, categoryActivity]);

  const gridStroke = isDark ? '#3f3f46' : '#e5e7eb';
  const tickFill = isDark ? '#a1a1aa' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(24,24,27,0.95)' : '#fff',
    border: `1px solid ${gridStroke}`,
    borderRadius: 12,
  };

  function openEdit(book: BookRow) {
    setEditBook(book);
    reset({
      title: book.title,
      category: book.category,
      publishYear: book.publishYear,
      keywords: book.keywords?.map((k) => k.keyword).join(', ') ?? '',
    });
  }

  function readBook(book: BookRow) {
    const url = resolveMediaUrl(book.filePath);
    if (!url) {
      toast.error(t('messages.bookFileMissing'));
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (statsLoading) return <LoadingState />;
  if (statsError || !stats) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (booksData?.items ?? []) as BookRow[];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={t('headings.librarianDashboard')}
        description={t('librarian.dashboardLead')}
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t('librarian.statsTotalBooks')} value={stats.totalBooks} icon={BookOpen} />
        <StatCard title={t('librarian.statsTotalReads')} value={stats.totalReads} icon={BookOpen} />
        <StatCard
          title={t('librarian.statsTotalDownloads')}
          value={stats.totalDownloads}
          icon={Download}
        />
      </div>

      <Card className="overflow-hidden">
        <h2 className="m-0 mb-4 text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('librarian.chartReadsByBook')}
        </h2>
        <div className="min-h-[320px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={readsByBook}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={chartTickStyle(tickFill)} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={yAxisWidth}
                tick={chartTickStyle(tickFill, 11)}
                interval={0}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                  return row?.fullName ?? '';
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Bar
                dataKey="reads"
                name={t('labels.reads')}
                fill={isDark ? BRAND.dark : BRAND.primary}
                radius={[0, 4, 4, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="downloads"
                name={t('labels.downloads')}
                fill={BRAND.secondary}
                radius={[0, 4, 4, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <h2 className="m-0 mb-2 text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('librarian.chartBooksByCategory')}
          </h2>
          <div className="min-h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="38%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                >
                  {pieData.map((_: { name: string; value: number }, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 11, lineHeight: '1.5', paddingInlineStart: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <h2 className="m-0 mb-4 text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('librarian.chartActivityByCategory')}
          </h2>
          <div className="min-h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={categoryActivity}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={chartTickStyle(tickFill)} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={yAxisWidth}
                  tick={chartTickStyle(tickFill, 11)}
                  interval={0}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                    return row?.fullName ?? '';
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Bar
                  dataKey="reads"
                  name={t('labels.reads')}
                  fill={isDark ? BRAND.dark : BRAND.primary}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="downloads"
                  name={t('labels.downloads')}
                  fill={BRAND.secondary}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold text-zinc-900 dark:text-white">
            {t('librarian.manageBooks')}
          </h2>
          <Select
            className="max-w-xs"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            aria-label={t('library.categoriesLabel')}
          >
            <option value="">{t('librarian.allCategories')}</option>
            {LIBRARY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`library.categories.${cat}`)}
              </option>
            ))}
          </Select>
        </div>

        {booksLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <>
            <DataTable<BookRow>
              rowKey={(r) => r.id}
              emptyMessage={t('librarian.noBooks')}
              columns={[
                { key: 't', header: t('labels.title'), render: (r) => r.title },
                {
                  key: 'c',
                  header: t('library.bookCategory'),
                  render: (r) => t(`library.categories.${r.category}`),
                },
                { key: 'y', header: t('labels.publishYear'), render: (r) => r.publishYear },
                {
                  key: 'u',
                  header: t('labels.usage'),
                  render: (r) => (
                    <span className="text-xs text-zinc-500">
                      {t('labels.reads')}: {r.readsCount} · {t('labels.downloads')}: {r.downloadsCount}
                    </span>
                  ),
                },
                {
                  key: 'a',
                  header: t('labels.actions'),
                  render: (r) => (
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" variant="secondary" size="sm" onClick={() => readBook(r)} title={t('labels.readBook')}>
                        <BookOpen className="size-4" aria-hidden />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(r)} title={t('labels.edit')}>
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(r)}
                        title={t('librarian.deleteBook')}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  ),
                },
              ]}
              rows={rows}
            />
            <Pagination
              page={page}
              pageSize={20}
              total={booksData?.total ?? 0}
              onPageChange={setPage}
              summary={
                <>
                  {t('labels.page')} {page}
                </>
              }
            />
          </>
        )}
      </Card>

      <MotionDialog
        open={!!editBook}
        onClose={() => setEditBook(null)}
        title={t('librarian.editBook')}
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            if (!editBook) return;
            updateBook.mutate(
              {
                id: editBook.id,
                body: {
                  title: vals.title,
                  category: vals.category,
                  publishYear: vals.publishYear,
                  keywords: vals.keywords,
                },
              },
              {
                onSuccess: () => {
                  toast.success(t('librarian.bookUpdated'));
                  setEditBook(null);
                },
                onError: () => toast.error(t('messages.loadError')),
              }
            );
          })}
        >
          <Field label={t('labels.title')} error={errors.title?.message}>
            <Input {...register('title')} />
          </Field>
          <Field label={t('library.bookCategory')} error={errors.category?.message}>
            <Select {...register('category')}>
              {LIBRARY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`library.categories.${cat}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('labels.publishYear')} error={errors.publishYear?.message}>
            <Input type="number" {...register('publishYear', { valueAsNumber: true })} />
          </Field>
          <Field label={t('labels.keywords')} error={errors.keywords?.message}>
            <Input {...register('keywords')} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditBook(null)}>
              {t('labels.cancel')}
            </Button>
            <Button type="submit" disabled={updateBook.isPending}>
              {t('labels.save')}
            </Button>
          </div>
        </form>
      </MotionDialog>

      <MotionDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('librarian.deleteBook')}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {t('librarian.deleteConfirm', { title: deleteTarget?.title ?? '' })}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
            {t('labels.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleteBook.isPending}
            onClick={() => {
              if (!deleteTarget) return;
              deleteBook.mutate(deleteTarget.id, {
                onSuccess: () => {
                  toast.success(t('librarian.bookDeleted'));
                  setDeleteTarget(null);
                },
                onError: () => toast.error(t('messages.loadError')),
              });
            }}
          >
            {t('librarian.deleteBook')}
          </Button>
        </div>
      </MotionDialog>
    </section>
  );
}
