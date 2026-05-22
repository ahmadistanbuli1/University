import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateNewsMutation } from '../api/hooks.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Textarea } from '../components/ui/Textarea.js';
import { managerNewsFormSchema } from '../lib/form-schemas.js';

type NewsForm = {
  title: string;
  content: string;
  imageUrl: string;
  collegeId: string;
};

export function ManagerNewsPage() {
  const { t } = useTranslation('nav');
  const create = useCreateNewsMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsForm>({
    resolver: zodResolver(managerNewsFormSchema),
    defaultValues: { title: '', content: '', imageUrl: '', collegeId: '' },
  });

  return (
    <section>
      <PageHeader title={t('headings.managerNews')} />
      <Card className="max-w-md">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            create.mutate(
              {
                title: vals.title,
                content: vals.content,
                imageUrl: vals.imageUrl || undefined,
                collegeId: vals.collegeId || null,
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
          <Field label={t('labels.collegeId')} error={errors.collegeId?.message}>
            <Input aria-invalid={!!errors.collegeId} {...register('collegeId')} />
          </Field>
          <Button type="submit" disabled={create.isPending}>
            {t('labels.publishNews')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
