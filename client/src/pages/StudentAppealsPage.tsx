import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateAppealMutation, useMyResultsQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';

type ResultRow = {
  id: string;
  facultyCourse?: { course?: { name?: string } };
};

export function StudentAppealsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyResultsQuery();
  const appeal = useCreateAppealMutation();
  const [examResultId, setExamResultId] = useState('');
  const [reason, setReason] = useState('');

  const results = ((data?.results ?? []) as ResultRow[]).map((r) => ({
    id: r.id,
    label: `${r.facultyCourse?.course?.name ?? r.id}`,
  }));

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  return (
    <section>
      <PageHeader title={t('headings.studentAppeals')} />
      <Card className="max-w-md">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            appeal.mutate(
              { examResultId, reason },
              {
                onSuccess: () => {
                  toast.success(t('messages.appealSent'));
                  setReason('');
                },
                onError: () => {
                  toast.error(t('messages.loadError'));
                },
              }
            );
          }}
        >
          <Field label={t('labels.examResult')}>
            <Select value={examResultId} onChange={(e) => setExamResultId(e.target.value)} required>
              <option value="">—</option>
              {results.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('labels.reason')}>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required minLength={5} rows={4} />
          </Field>
          <Button type="submit" disabled={appeal.isPending || results.length === 0}>
            {t('labels.submitAppeal')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
