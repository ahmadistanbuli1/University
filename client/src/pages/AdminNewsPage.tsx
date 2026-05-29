import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  useCollegesQuery,
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useNewsListQuery,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { NEWS_CATEGORIES, newsCategoryLabel } from '../lib/news-categories.js';

const publishSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING', 'TUITION']),
  collegeId: z.string().optional(),
  enablePayNow: z.coerce.boolean().optional(),
  tuitionSemesterKey: z.enum(['semester-1', 'semester-2', '']).optional(),
});

type NewsItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category?: string;
  enablePayNow?: boolean;
  college?: { id: string; name: string } | null;
  author?: { name?: string };
};

export function AdminNewsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNewsListQuery(page, 20);
  const { data: colleges } = useCollegesQuery();
  const create = useCreateNewsMutation();
  const remove = useDeleteNewsMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'ANNOUNCEMENT' as const,
      collegeId: '',
      enablePayNow: false,
      tuitionSemesterKey: 'semester-2',
    },
  });

  const category = watch('category');
  const enablePayNow = watch('enablePayNow');

  if (isLoading && !data) return <LoadingState />;
  if (isError && !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const items = (data?.items ?? []) as NewsItem[];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader title={t('headings.adminNews')} />

      <Card className="max-w-xl">
        <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          {t('labels.publishNews')}
        </h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            create.mutate(
              {
                title: vals.title,
                content: vals.content,
                category: vals.category,
                collegeId: vals.collegeId || null,
                enablePayNow: vals.category === 'TUITION' ? Boolean(vals.enablePayNow) : false,
                tuitionSemesterKey:
                  vals.category === 'TUITION' && vals.enablePayNow && vals.tuitionSemesterKey
                    ? vals.tuitionSemesterKey
                    : null,
              },
              {
                onSuccess: () => {
                  toast.success(t('messages.newsCreated'));
                  reset();
                },
                onError: () => toast.error(t('messages.loadError')),
              }
            );
          })}
        >
          <Field label={t('labels.title')} error={errors.title?.message}>
            <Input {...register('title')} />
          </Field>
          <Field label={t('labels.content')} error={errors.content?.message}>
            <Textarea rows={5} {...register('content')} />
          </Field>
          <Field label={t('news.filterCategory')}>
            <Select {...register('category')}>
              {NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {newsCategoryLabel(c, t)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('news.targetCollege')}>
            <Select {...register('collegeId')}>
              <option value="">{t('news.universityWide')}</option>
              {colleges?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          {category === 'TUITION' ? (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('enablePayNow')} />
                {t('tuition.enablePaymentOnDashboard')}
              </label>
              {enablePayNow ? (
                <Field label={t('tuition.tuitionSemesterTarget')}>
                  <Select {...register('tuitionSemesterKey')}>
                    <option value="semester-1">{t('tuition.payFirstSemesterFees')}</option>
                    <option value="semester-2">{t('tuition.paySecondSemesterFees')}</option>
                  </Select>
                </Field>
              ) : null}
            </>
          ) : null}
          <Button type="submit" disabled={create.isPending}>
            {t('labels.publishNews')}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {items.map((n) => (
          <Card key={n.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="m-0 text-xs font-semibold text-brand dark:text-brand-light">
                  {newsCategoryLabel(n.category, t)}
                  {n.college?.name ? ` · ${n.college.name}` : ` · ${t('news.universityWide')}`}
                </p>
                <h3 className="m-0 mt-1 font-semibold">{n.title}</h3>
                <p className="m-0 mt-1 text-xs text-zinc-500">
                  {new Date(n.createdAt).toLocaleString()} — {n.author?.name ?? ''}
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (!window.confirm(t('news.confirmDelete', { title: n.title }))) return;
                  remove.mutate(n.id, {
                    onSuccess: () => toast.success(t('news.deleted')),
                    onError: () => toast.error(t('messages.loadError')),
                  });
                }}
              >
                {t('news.delete')}
              </Button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
              {n.content.slice(0, 400)}
              {n.content.length > 400 ? '…' : ''}
            </p>
          </Card>
        ))}
      </div>

      {data ? (
        <Pagination
          page={page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
          summary={
            <>
              {t('labels.page')} {page}
            </>
          }
        />
      ) : null}
    </section>
  );
}
