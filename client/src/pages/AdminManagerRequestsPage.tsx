import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  useAdminManagerRequestsQuery,
  useResolveManagerRequestMutation,
  type ManagerRequestRow,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Textarea } from '../components/ui/Textarea.js';

export function AdminManagerRequestsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAdminManagerRequestsQuery();
  const resolve = useResolveManagerRequestMutation();
  const [active, setActive] = useState<ManagerRequestRow | null>(null);
  const [response, setResponse] = useState('');

  const submit = (status: 'RESOLVED' | 'REJECTED') => {
    if (!active || response.trim().length < 3) return;
    resolve.mutate(
      { id: active.id, status, adminResponse: response.trim() },
      {
        onSuccess: () => {
          toast.success(t('messages.managerRequestResolved'));
          setActive(null);
          setResponse('');
        },
        onError: (err) => {
          const msg = isAxiosError(err)
            ? (err.response?.data as { error?: string })?.error
            : undefined;
          toast.error(msg ?? t('messages.loadError'));
        },
      }
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.adminManagerRequests')}
        description={t('messages.adminManagerRequestsLead')}
      />

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
                  <div>
                    <p className="m-0 font-semibold">{req.subject}</p>
                    <p className="m-0 mt-1 text-sm text-zinc-500">
                      {req.manager?.name} · {req.manager?.college?.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                    {req.status}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{req.body}</p>
                {req.status === 'PENDING' ? (
                  active?.id === req.id ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <Field label={t('labels.adminNote')}>
                        <Textarea
                          rows={3}
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                        />
                      </Field>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={resolve.isPending}
                          onClick={() => submit('RESOLVED')}
                        >
                          {t('labels.approve')}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={resolve.isPending}
                          onClick={() => submit('REJECTED')}
                        >
                          {t('labels.reject')}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setActive(null)}>
                          {t('labels.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      className="mt-3"
                      size="sm"
                      onClick={() => {
                        setActive(req);
                        setResponse('');
                      }}
                    >
                      {t('labels.respond')}
                    </Button>
                  )
                ) : req.adminResponse ? (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">{t('tuition.adminResponse')}: </span>
                    {req.adminResponse}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
