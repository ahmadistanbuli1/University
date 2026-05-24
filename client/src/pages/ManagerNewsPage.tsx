import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateNewsMutation, useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { MANAGER_NEWS_CATEGORIES, newsCategoryLabel, newsScopeLabel } from '../lib/news-categories.js';

const managerNewsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.union([z.literal(''), z.string().url()]),
  scope: z.enum(['COLLEGE', 'UNIVERSITY']),
  category: z.enum(['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING']),
});

type ManagerNewsForm = z.infer<typeof managerNewsSchema>;

export function ManagerNewsPage() {
  const { t } = useTranslation('nav');
  const { data: me } = useMeQuery();
  const create = useCreateNewsMutation();

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
      content: '',
      imageUrl: '',
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

      <Card className="max-w-lg">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            create.mutate(
              {
                title: vals.title,
                content: vals.content,
                imageUrl: vals.imageUrl || undefined,
                category: vals.category,
                scope: vals.scope,
                collegeId: vals.scope === 'COLLEGE' ? undefined : null,
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
            <Input aria-invalid={!!errors.title} {...register('title')} />
          </Field>
          <Field label={t('labels.content')} error={errors.content?.message}>
            <Textarea rows={6} aria-invalid={!!errors.content} {...register('content')} />
          </Field>
          <Field label={t('labels.imageUrl')} error={errors.imageUrl?.message}>
            <Input type="url" aria-invalid={!!errors.imageUrl} {...register('imageUrl')} />
          </Field>
          <Field label={t('news.publishScope')}>
            <Select {...register('scope')}>
              <option value="COLLEGE">{newsScopeLabel('COLLEGE', t)}</option>
              <option value="UNIVERSITY">{newsScopeLabel('UNIVERSITY', t)}</option>
            </Select>
          </Field>
          <Field label={t('news.filterCategory')} error={errors.category?.message}>
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
