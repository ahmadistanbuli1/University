import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useCreateAppealMutation,
  useMyAppealsQuery,
  useMyResultsQuery,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';
import { appealFormSchema } from '../lib/form-schemas.js';

type ResultRow = {
  id: string;
  facultyCourse?: { course?: { name?: string } };
};

type AppealRow = {
  id: string;
  status: string;
  reason: string;
  adminResponse?: string | null;
  submittedAt: string;
  examResult?: { facultyCourse?: { course?: { name?: string } } };
};

type AppealForm = { examResultId: string; reason: string };

export function StudentAppealsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyResultsQuery();
  const myAppeals = useMyAppealsQuery();
  const appeal = useCreateAppealMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppealForm>({
    resolver: zodResolver(appealFormSchema),
    defaultValues: { examResultId: '', reason: '' },
  });

  const results = ((data?.results ?? []) as ResultRow[]).map((r) => ({
    id: r.id,
    label: `${r.facultyCourse?.course?.name ?? r.id}`,
  }));

  if (isLoading || myAppeals.isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const appeals = (myAppeals.data ?? []) as AppealRow[];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.studentAppeals')} />

      <Card>
        <h2 className="m-0 mb-4 text-lg font-semibold">{t('appeals.myRequests')}</h2>
        {!appeals.length ? (
          <p className="text-sm text-zinc-500">{t('appeals.none')}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {appeals.map((a) => (
              <li key={a.id} className="rounded-xl border border-zinc-200/80 p-4 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {a.examResult?.facultyCourse?.course?.name ?? t('labels.examResult')}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{a.reason}</p>
                {a.adminResponse ? (
                  <p className="mt-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
                    <span className="font-medium">{t('appeals.adminDecision')}:</span> {a.adminResponse}
                  </p>
                ) : a.status === 'PENDING' ? (
                  <p className="mt-2 text-xs text-zinc-500">{t('appeals.pendingHint')}</p>
                ) : null}
                <p className="mt-2 text-xs text-zinc-400">
                  {new Date(a.submittedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="max-w-md">
        <h2 className="m-0 mb-4 text-lg font-semibold">{t('appeals.submitNew')}</h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            appeal.mutate(
              { examResultId: vals.examResultId, reason: vals.reason },
              {
                onSuccess: () => {
                  toast.success(t('messages.appealSent'));
                  reset({ examResultId: '', reason: '' });
                  void myAppeals.refetch();
                },
                onError: () => toast.error(t('messages.loadError')),
              }
            );
          })}
        >
          <Field label={t('labels.examResult')} error={errors.examResultId?.message}>
            <Select aria-invalid={!!errors.examResultId} {...register('examResultId')}>
              <option value="">—</option>
              {results.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('labels.reason')} error={errors.reason?.message}>
            <Textarea rows={4} aria-invalid={!!errors.reason} {...register('reason')} />
          </Field>
          <Button type="submit" disabled={appeal.isPending || results.length === 0}>
            {t('labels.submitAppeal')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
