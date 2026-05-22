import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateNewsMutation, useNewsListQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { FeedList, FeedListItem } from '../components/ui/FeedList.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';

const publishSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['GENERAL', 'TUITION']),
  enablePayNow: z.coerce.boolean().optional(),
});

type NewsItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category?: string;
  enablePayNow?: boolean;
  author?: { name?: string };
};

export function AdminNewsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNewsListQuery(page);
  const create = useCreateNewsMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(publishSchema),
    defaultValues: { title: '', content: '', category: 'GENERAL' as const, enablePayNow: false },
  });

  const category = watch('category');

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const items = data.items as NewsItem[];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader title={t('headings.adminNews')} />

      <Card className="max-w-xl">
        <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-white">{t('labels.publishNews')}</h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            create.mutate(
              {
                title: vals.title,
                content: vals.content,
                category: vals.category,
                enablePayNow: vals.category === 'TUITION' ? Boolean(vals.enablePayNow) : false,
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
          <Field label={t('tuition.announcement')}>
            <Select {...register('category')}>
              <option value="GENERAL">General</option>
              <option value="TUITION">{t('tuition.announcement')}</option>
            </Select>
          </Field>
          {category === 'TUITION' ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('enablePayNow')} />
              {t('tuition.payNow')} (link on student dashboard)
            </label>
          ) : null}
          <Button type="submit" disabled={create.isPending}>
            {t('labels.publishNews')}
          </Button>
        </form>
      </Card>

      <FeedList>
        {items.map((n) => (
          <FeedListItem
            key={n.id}
            title={n.title}
            meta={
              <>
                {new Date(n.createdAt).toLocaleString()} — {n.author?.name ?? ''}
                {n.category === 'TUITION' ? ` · ${t('tuition.announcement')}` : ''}
              </>
            }
          >
            {n.content.slice(0, 400)}
            {n.content.length > 400 ? '…' : ''}
          </FeedListItem>
        ))}
      </FeedList>
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
    </section>
  );
}
