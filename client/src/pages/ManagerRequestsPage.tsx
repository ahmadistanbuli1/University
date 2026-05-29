import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  useCreateManagerRequestMutation,
  useManagerRequestsQuery,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Textarea } from '../components/ui/Textarea.js';

type FormValues = { subject: string; body: string };

export function ManagerRequestsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useManagerRequestsQuery();
  const create = useCreateManagerRequestMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { subject: '', body: '' } });

  const onSubmit = handleSubmit((vals) => {
    create.mutate(vals, {
      onSuccess: () => {
        toast.success(t('messages.managerRequestSent'));
        reset();
      },
      onError: (err) => {
        const msg = isAxiosError(err)
          ? (err.response?.data as { error?: string })?.error
          : undefined;
        toast.error(msg ?? t('messages.loadError'));
      },
    });
  });

  const statusLabel = (status: string) => {
    const key = `managerRequest.status.${status}` as const;
    return t(key, status);
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.managerRequests')}
        description={t('messages.managerRequestsLead')}
      />

      <Card>
        <form className="flex max-w-lg flex-col gap-3" onSubmit={onSubmit}>
          <Field label={t('labels.requestSubject')} error={errors.subject?.message}>
            <Input {...register('subject', { required: true, minLength: 3 })} />
          </Field>
          <Field label={t('labels.requestBody')} error={errors.body?.message}>
            <Textarea rows={5} {...register('body', { required: true, minLength: 10 })} />
          </Field>
          <Button type="submit" disabled={create.isPending}>
            {t('labels.submitRequest')}
          </Button>
        </form>
      </Card>

      <h2 className="m-0 text-lg font-semibold">{t('manager.myRequests')}</h2>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <Alert variant="error">{t('messages.loadError')}</Alert>
      ) : !data?.length ? (
        <Alert variant="info">{t('manager.noRequests')}</Alert>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {data.map((req) => (
            <li key={req.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="m-0 font-semibold">{req.subject}</p>
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                    {statusLabel(req.status)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                  {req.body}
                </p>
                {req.adminResponse ? (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">{t('tuition.adminResponse')}: </span>
                    {req.adminResponse}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(req.createdAt).toLocaleString()}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
