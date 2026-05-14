import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateBookMutation, useDepartmentsQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';

export function LibrarianBooksPage() {
  const { t } = useTranslation('nav');
  const { data: depts, isLoading, isError } = useDepartmentsQuery();
  const upload = useCreateBookMutation();
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [publishYear, setPublishYear] = useState(String(new Date().getFullYear()));
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState<File | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError || !depts) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  return (
    <section>
      <PageHeader title={t('headings.librarianBooks')} />
      <Card className="max-w-md">
        <form className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!file) return;
            const fd = new FormData();
            fd.append('title', title);
            fd.append('departmentId', departmentId);
            fd.append('publishYear', publishYear);
            if (keywords) fd.append('keywords', keywords);
            fd.append('file', file);
            upload.mutate(fd, {
              onSuccess: () => {
                toast.success(t('messages.bookUploaded'));
                setTitle('');
                setFile(null);
              },
              onError: () => {
                toast.error(t('messages.loadError'));
              },
            });
          }}
        >
          <Field label={t('labels.title')}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label={t('labels.department')}>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
              <option value="">—</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('labels.publishYear')}>
            <Input type="number" value={publishYear} onChange={(e) => setPublishYear(e.target.value)} required />
          </Field>
          <Field label={t('labels.keywords')}>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </Field>
          <Field label={t('labels.pdfFile')}>
            <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          </Field>
          <Button type="submit" disabled={upload.isPending}>
            {t('labels.uploadBook')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
