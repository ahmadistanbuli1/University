import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateNewsMutation } from '../api/hooks.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Textarea } from '../components/ui/Textarea.js';

export function ManagerNewsPage() {
  const { t } = useTranslation('nav');
  const create = useCreateNewsMutation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [collegeId, setCollegeId] = useState('');

  return (
    <section>
      <PageHeader title={t('headings.managerNews')} />
      <Card className="max-w-md">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              {
                title,
                content,
                imageUrl: imageUrl || undefined,
                collegeId: collegeId || null,
              },
              {
                onSuccess: () => {
                  toast.success(t('messages.newsCreated'));
                  setTitle('');
                  setContent('');
                  setImageUrl('');
                  setCollegeId('');
                },
                onError: () => toast.error(t('messages.loadError')),
              }
            );
          }}
        >
          <Field label={t('labels.title')}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label={t('labels.content')}>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={6} />
          </Field>
          <Field label={t('labels.imageUrl')}>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" />
          </Field>
          <Field label={t('labels.collegeId')}>
            <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
          </Field>
          <Button type="submit" disabled={create.isPending}>
            {t('labels.publishNews')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
