import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateNewsMutation, useMeQuery } from '../api/hooks.js';
import { NewsGalleryUpload } from '../components/news/NewsGalleryUpload.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { NewsImageUpload } from '../components/ui/NewsImageUpload.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { MANAGER_NEWS_CATEGORIES, newsCategoryLabel, newsScopeLabel } from '../lib/news-categories.js';

const managerNewsSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(500),
  content: z.string().min(1),
  scope: z.enum(['COLLEGE', 'UNIVERSITY']),
  category: z.enum(['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING']),
});

type ManagerNewsForm = z.infer<typeof managerNewsSchema>;

export function ManagerNewsPage() {
  const { t } = useTranslation('nav');
  const { data: me } = useMeQuery();
  const create = useCreateNewsMutation();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const collegeName =
    (me as { college?: { name?: string } } | undefined)?.college?.name ?? '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerNewsForm>({
    resolver: zodResolver(managerNewsSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      scope: 'COLLEGE',
      category: 'ANNOUNCEMENT',
    },
  });

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.managerNews')} />

      {collegeName ? (
        <Alert variant="info">{t('news.managerCollegeHint', { college: collegeName })}</Alert>
      ) : null}

      <Card className="max-w-2xl">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((vals) => {
            create.mutate(
              {
                body: {
                  title: vals.title,
                  summary: vals.summary,
                  content: vals.content,
                  category: vals.category,
                  scope: vals.scope,
                  collegeId: vals.scope === 'COLLEGE' ? undefined : null,
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
            <Input aria-invalid={!!errors.title} {...register('title')} />
          </Field>
          <Field label={t('news.summary')} error={errors.summary?.message}>
            <Textarea rows={3} aria-invalid={!!errors.summary} {...register('summary')} />
          </Field>
          <Field label={t('news.fullContent')} error={errors.content?.message}>
            <Textarea rows={8} aria-invalid={!!errors.content} {...register('content')} />
          </Field>
          <NewsGalleryUpload
            newFiles={galleryFiles}
            onNewFilesChange={setGalleryFiles}
            removedIds={[]}
            onToggleRemoveExisting={() => undefined}
            disabled={create.isPending}
          />
          <Field label={t('news.publishScope')}>
            <Select {...register('scope')}>
              <option value="COLLEGE">{newsScopeLabel('COLLEGE', t)}</option>
              <option value="UNIVERSITY">{newsScopeLabel('UNIVERSITY', t)}</option>
            </Select>
          </Field>
          <Field label={t('news.filterCategory')}>
            <Select {...register('category')}>
              {MANAGER_NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {newsCategoryLabel(c, t)}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" disabled={create.isPending}>
            {t('labels.publishNews')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
