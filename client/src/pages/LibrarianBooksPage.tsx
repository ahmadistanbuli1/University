import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateBookMutation } from '../api/hooks.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { librarianBookFieldsSchema, type LibrarianBookFormValues } from '../lib/form-schemas.js';
import { LIBRARY_CATEGORIES } from '../lib/library-categories.js';

export function LibrarianBooksPage() {
  const { t } = useTranslation('nav');
  const upload = useCreateBookMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LibrarianBookFormValues>({
    resolver: zodResolver(librarianBookFieldsSchema),
    defaultValues: {
      title: '',
      category: 'MEDICAL',
      publishYear: new Date().getFullYear(),
      author: '',
      publisher: '',
      keywords: '',
    },
  });

  return (
    <section>
      <PageHeader title={t('headings.librarianBooks')} description={t('messages.librarianBooksLead')} icon={Upload} />
      <Card className="max-w-md">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            const file = fileRef.current?.files?.[0];
            if (!file) {
              setFileError(t('messages.pdfRequired'));
              return;
            }
            setFileError(null);
            const fd = new FormData();
            fd.append('title', vals.title);
            fd.append('category', vals.category);
            fd.append('publishYear', String(vals.publishYear));
            if (vals.keywords) fd.append('keywords', vals.keywords);
            if (vals.author?.trim()) fd.append('author', vals.author.trim());
            if (vals.publisher?.trim()) fd.append('publisher', vals.publisher.trim());
            fd.append('file', file);
            upload.mutate(fd, {
              onSuccess: () => {
                toast.success(t('messages.bookUploaded'));
                reset({
                  title: '',
                  category: vals.category,
                  publishYear: vals.publishYear,
                  author: '',
                  publisher: '',
                  keywords: '',
                });
                if (fileRef.current) fileRef.current.value = '';
              },
              onError: () => toast.error(t('messages.loadError')),
            });
          })}
        >
          <Field label={t('labels.title')} error={errors.title?.message}>
            <Input aria-invalid={!!errors.title} {...register('title')} />
          </Field>
          <Field label={t('library.bookCategory')} error={errors.category?.message}>
            <Select aria-invalid={!!errors.category} {...register('category')}>
              {LIBRARY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`library.categories.${cat}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('labels.publishYear')} error={errors.publishYear?.message}>
            <Input type="number" aria-invalid={!!errors.publishYear} {...register('publishYear', { valueAsNumber: true })} />
          </Field>
          <Field label={t('labels.author')} error={errors.author?.message}>
            <Input {...register('author')} />
          </Field>
          <Field label={t('labels.publisher')} error={errors.publisher?.message}>
            <Input {...register('publisher')} />
          </Field>
          <Field label={t('labels.keywords')} error={errors.keywords?.message}>
            <Input {...register('keywords')} />
          </Field>
          <Field label={t('labels.pdfFile')} error={fileError ?? undefined}>
            <div className="flex items-center gap-2">
              <FileUp className="size-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
              <Input ref={fileRef} type="file" accept="application/pdf" className="flex-1" onChange={() => setFileError(null)} />
            </div>
          </Field>
          <Button type="submit" disabled={upload.isPending} className="gap-2">
            <Upload className="size-4" aria-hidden />
            {t('labels.uploadBook')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
