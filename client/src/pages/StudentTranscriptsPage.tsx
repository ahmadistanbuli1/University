import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMyTranscriptsQuery, useRequestTranscriptMutation } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';

type Tr = { id: string; status: string; requestedAt: string };

export function StudentTranscriptsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyTranscriptsQuery();
  const req = useRequestTranscriptMutation();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Tr[];

  return (
    <section>
      <PageHeader title={t('headings.studentTranscripts')} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          disabled={req.isPending}
          onClick={() => {
            req.mutate(undefined, {
              onSuccess: () => {
                toast.success(t('messages.transcriptRequested'));
              },
              onError: () => {
                toast.error(t('messages.loadError'));
              },
            });
          }}
        >
          {t('labels.requestTranscript')}
        </Button>
      </div>
      {req.isError ? <Alert variant="error">{t('messages.loadError')}</Alert> : null}
      <DataTable<Tr>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'st', header: t('labels.status'), render: (r) => <StatusBadge status={r.status} /> },
          { key: 'at', header: t('labels.requestedAt'), render: (r) => new Date(r.requestedAt).toLocaleString() },
        ]}
        rows={rows}
      />
    </section>
  );
}
