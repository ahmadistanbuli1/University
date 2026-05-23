import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  fetchTranscriptPdfBlob,
  useMyTranscriptsQuery,
  useRequestTranscriptMutation,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';

type Tr = {
  id: string;
  status: string;
  requestedAt: string;
  processedAt?: string | null;
  rejectionReason?: string | null;
  filePath?: string | null;
};

async function openTranscriptPdf(id: string, download: boolean) {
  const blob = await fetchTranscriptPdfBlob(id);
  const url = URL.createObjectURL(blob);
  if (download) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

export function StudentTranscriptsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyTranscriptsQuery();
  const req = useRequestTranscriptMutation();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Tr[];

  return (
    <section>
      <PageHeader
        title={t('headings.studentTranscripts')}
        description={t('transcripts.studentLead')}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          disabled={req.isPending}
          onClick={() => {
            req.mutate(undefined, {
              onSuccess: () => toast.success(t('messages.transcriptRequested')),
              onError: (err: unknown) => {
                const msg =
                  err &&
                  typeof err === 'object' &&
                  'response' in err &&
                  (err as { response?: { data?: { message?: string } } }).response?.data?.message;
                toast.error(typeof msg === 'string' ? msg : t('messages.loadError'));
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
          {
            key: 'at',
            header: t('labels.requestedAt'),
            render: (r) => new Date(r.requestedAt).toLocaleString(),
          },
          {
            key: 'actions',
            header: t('labels.action'),
            render: (r) => {
              if (r.status === 'DELIVERED') {
                return (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        void openTranscriptPdf(r.id, true).catch(() =>
                          toast.error(t('messages.loadError'))
                        );
                      }}
                    >
                      {t('transcripts.download')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void openTranscriptPdf(r.id, false).catch(() =>
                          toast.error(t('messages.loadError'))
                        );
                      }}
                    >
                      {t('transcripts.preview')}
                    </Button>
                  </div>
                );
              }
              if (r.status === 'REJECTED' && r.rejectionReason) {
                return (
                  <Alert variant="error" className="m-0 text-start">
                    <strong className="block text-xs font-bold">{t('transcripts.rejectionReason')}</strong>
                    <span className="text-sm">{r.rejectionReason}</span>
                  </Alert>
                );
              }
              return '—';
            },
          },
        ]}
        rows={rows}
      />
    </section>
  );
}
