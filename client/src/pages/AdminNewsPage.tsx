import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  useCollegesQuery,
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useNewsDetailQuery,
  useNewsListQuery,
  useUpdateNewsMutation,
} from '../api/hooks.js';
import { NewsGalleryUpload } from '../components/news/NewsGalleryUpload.js';
import { MotionDialog } from '../components/motion/MotionDialog.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { NewsCover } from '../components/ui/NewsCover.js';
import { NewsImageUpload } from '../components/ui/NewsImageUpload.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { NEWS_CATEGORIES, newsCategoryLabel } from '../lib/news-categories.js';

const publishSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.enum(['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING', 'TUITION']),
  collegeId: z.string().optional(),
  enablePayNow: z.coerce.boolean().optional(),
  tuitionSemesterKey: z.enum(['semester-1', 'semester-2', '']).optional(),
});

type PublishValues = z.infer<typeof publishSchema>;

type NewsItem = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  createdAt: string;
  imageUrl?: string | null;
  category?: string;
  enablePayNow?: boolean;
  tuitionSemesterKey?: string | null;
  college?: { id: string; name: string } | null;
  author?: { name?: string };
  galleryImages?: Array<{ id: string; imageUrl: string }>;
};

function tuitionPayload(vals: PublishValues) {
  return {
    enablePayNow: vals.category === 'TUITION' ? Boolean(vals.enablePayNow) : false,
    tuitionSemesterKey:
      vals.category === 'TUITION' && vals.enablePayNow && vals.tuitionSemesterKey
        ? (vals.tuitionSemesterKey as 'semester-1' | 'semester-2')
        : null,
  };
}

export function AdminNewsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverCleared, setEditCoverCleared] = useState(false);
  const [editGalleryFiles, setEditGalleryFiles] = useState<File[]>([]);
  const [removedGalleryIds, setRemovedGalleryIds] = useState<string[]>([]);
  const { data, isLoading, isError } = useNewsListQuery(page, 20);
  const { data: editingDetail, isLoading: editDetailLoading } = useNewsDetailQuery(
    editing?.id ?? '',
    !!editing
  );
  const { data: colleges } = useCollegesQuery();
  const create = useCreateNewsMutation();
  const update = useUpdateNewsMutation();
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
      summary: '',
      content: '',
      category: 'ANNOUNCEMENT' as const,
      collegeId: '',
      enablePayNow: false,
      tuitionSemesterKey: 'semester-2',
    },
  });

  const editForm = useForm({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      category: 'ANNOUNCEMENT' as const,
      collegeId: '',
      enablePayNow: false,
      tuitionSemesterKey: 'semester-2',
    },
  });

  const category = watch('category');
  const enablePayNow = watch('enablePayNow');
  const editCategory = editForm.watch('category');
  const editEnablePayNow = editForm.watch('enablePayNow');

  const detail = editingDetail as NewsItem | undefined;

  useEffect(() => {
    if (!editing || !detail) return;
    const tuitionKey =
      detail.tuitionSemesterKey === 'semester-1' || detail.tuitionSemesterKey === 'semester-2'
        ? detail.tuitionSemesterKey
        : 'semester-2';
    editForm.reset({
      title: detail.title,
      summary: detail.summary ?? '',
      content: detail.content ?? '',
      category: (detail.category ?? 'ANNOUNCEMENT') as PublishValues['category'],
      collegeId: detail.college?.id ?? '',
      enablePayNow: detail.enablePayNow ?? false,
      tuitionSemesterKey: tuitionKey,
    });
    setEditCoverFile(null);
    setEditCoverCleared(false);
    setEditGalleryFiles([]);
    setRemovedGalleryIds([]);
  }, [editing, detail, editForm]);

  if (isLoading && !data) return <LoadingState />;
  if (isError && !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const items = (data?.items ?? []) as NewsItem[];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader title={t('headings.adminNews')} />

      <Card className="max-w-2xl">
        <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          {t('labels.publishNews')}
        </h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((vals) => {
            const tuition = tuitionPayload(vals);
            create.mutate(
              {
                body: {
                  title: vals.title,
                  summary: vals.summary,
                  content: vals.content,
                  category: vals.category,
                  collegeId: vals.collegeId || null,
                  ...tuition,
                },
                coverFile,
                galleryFiles,
              },
              {
                onSuccess: () => {
                  toast.success(t('messages.newsCreated'));
                  reset();
                  setCoverFile(null);
                  setGalleryFiles([]);
                },
                onError: () => toast.error(t('messages.loadError')),
              }
            );
          })}
        >
          <NewsImageUpload file={coverFile} onFileChange={setCoverFile} disabled={create.isPending} />
          <Field label={t('labels.title')} error={errors.title?.message}>
            <Input {...register('title')} />
          </Field>
          <Field label={t('news.summary')} error={errors.summary?.message}>
            <Textarea rows={3} {...register('summary')} placeholder={t('news.summaryHint')} />
          </Field>
          <Field label={t('news.fullContent')} error={errors.content?.message}>
            <Textarea rows={8} {...register('content')} />
          </Field>
          <NewsGalleryUpload
            newFiles={galleryFiles}
            onNewFilesChange={setGalleryFiles}
            removedIds={[]}
            onToggleRemoveExisting={() => undefined}
            disabled={create.isPending}
          />
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

      <div className="flex flex-col gap-4">
        {items.map((n) => (
          <Card key={n.id} className="overflow-hidden p-0">
            {n.imageUrl ? (
              <NewsCover imageUrl={n.imageUrl} alt={n.title} heightClass="h-40" />
            ) : null}
            <div className="p-4">
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
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(n)}>
                    {t('news.edit')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(n)}
                  >
                    {t('news.delete')}
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{n.summary ?? '—'}</p>
            </div>
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

      <MotionDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('news.delete')}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {t('news.confirmDelete', { title: deleteTarget?.title ?? '' })}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
            {t('labels.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={remove.isPending}
            onClick={() => {
              if (!deleteTarget) return;
              remove.mutate(deleteTarget.id, {
                onSuccess: () => {
                  toast.success(t('news.deleted'));
                  setDeleteTarget(null);
                },
                onError: () => toast.error(t('messages.loadError')),
              });
            }}
          >
            {t('news.delete')}
          </Button>
        </div>
      </MotionDialog>

      <MotionDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t('news.editNews')}
        className="max-w-2xl"
      >
        {editDetailLoading && !detail ? (
          <LoadingState />
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={editForm.handleSubmit((vals) => {
              if (!editing) return;
              const tuition = tuitionPayload(vals);
              update.mutate(
                {
                  id: editing.id,
                  body: {
                    title: vals.title,
                    summary: vals.summary,
                    content: vals.content,
                    category: vals.category,
                    collegeId: vals.collegeId || null,
                    ...tuition,
                    ...(editCoverCleared ? { imageUrl: null } : {}),
                    removedGalleryIds,
                  },
                  coverFile: editCoverFile,
                  galleryFiles: editGalleryFiles,
                },
                {
                  onSuccess: () => {
                    toast.success(t('news.updated'));
                    setEditing(null);
                  },
                  onError: () => toast.error(t('messages.loadError')),
                }
              );
            })}
          >
            <NewsImageUpload
              file={editCoverFile}
              onFileChange={setEditCoverFile}
              previewUrl={detail?.imageUrl}
              previewCleared={editCoverCleared}
              onClearPreview={() => setEditCoverCleared(true)}
              disabled={update.isPending}
            />
            <Field label={t('labels.title')} error={editForm.formState.errors.title?.message}>
              <Input {...editForm.register('title')} />
            </Field>
            <Field label={t('news.summary')} error={editForm.formState.errors.summary?.message}>
              <Textarea rows={3} {...editForm.register('summary')} />
            </Field>
            <Field label={t('news.fullContent')} error={editForm.formState.errors.content?.message}>
              <Textarea rows={8} {...editForm.register('content')} />
            </Field>
            <NewsGalleryUpload
              newFiles={editGalleryFiles}
              onNewFilesChange={setEditGalleryFiles}
              existing={detail?.galleryImages}
              removedIds={removedGalleryIds}
              onToggleRemoveExisting={(id) =>
                setRemovedGalleryIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                )
              }
              disabled={update.isPending}
            />
            <Field label={t('news.filterCategory')}>
              <Select {...editForm.register('category')}>
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {newsCategoryLabel(c, t)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('news.targetCollege')}>
              <Select {...editForm.register('collegeId')}>
                <option value="">{t('news.universityWide')}</option>
                {colleges?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            {editCategory === 'TUITION' ? (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...editForm.register('enablePayNow')} />
                  {t('tuition.enablePaymentOnDashboard')}
                </label>
                {editEnablePayNow ? (
                  <Field label={t('tuition.tuitionSemesterTarget')}>
                    <Select {...editForm.register('tuitionSemesterKey')}>
                      <option value="semester-1">{t('tuition.payFirstSemesterFees')}</option>
                      <option value="semester-2">{t('tuition.paySecondSemesterFees')}</option>
                    </Select>
                  </Field>
                ) : null}
              </>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t('labels.cancel')}
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {t('labels.save')}
              </Button>
            </div>
          </form>
        )}
      </MotionDialog>
    </section>
  );
}
