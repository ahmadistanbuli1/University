import { FileOutput } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useExamOfficerTranscriptsQuery,
  useFulfillTranscriptMutation,
} from '../api/hooks.js';
import { ActionStack } from '../components/ui/ActionGroup.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { transcriptStatusLabel } from '../lib/transcript-status.js';

type Tr = {
  id: string;
  status: string;
  requestedAt: string;
  affairsReviewedAt?: string | null;
  student?: { user?: { name?: string; email?: string } };
};

export function ExamOfficerTranscriptsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useExamOfficerTranscriptsQuery();
  const fulfill = useFulfillTranscriptMutation();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Tr[];

  return (
    <section>
      <PageHeader
        title={t('headings.examOfficerTranscripts')}
        description={t('transcripts.examOfficerLead')}
        icon={FileOutput}
      />
      {rows.length === 0 ? (
        <Alert variant="info">{t('transcripts.examOfficerEmpty')}</Alert>
      ) : (
        <DataTable<Tr>
          rowKey={(r) => r.id}
          emptyMessage="—"
          columns={[
            {
              key: 'st',
              header: t('labels.status'),
              render: (r) => (
                <span title={r.status}>
                  <StatusBadge status={r.status} />
                  <span className="sr-only">{transcriptStatusLabel(r.status, t)}</span>
                </span>
              ),
            },
            { key: 'who', header: t('labels.fullName'), render: (r) => r.student?.user?.name ?? '—' },
            {
              key: 'email',
              header: t('labels.email'),
              render: (r) => r.student?.user?.email ?? '—',
            },
            {
              key: 'at',
              header: t('transcripts.affairsApprovedAt'),
              render: (r) =>
                r.affairsReviewedAt
                  ? new Date(r.affairsReviewedAt).toLocaleString()
                  : new Date(r.requestedAt).toLocaleString(),
            },
            {
              key: 'act',
              header: t('labels.action'),
              render: (r) => (
                <ActionStack>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={fulfill.isPending}
                    onClick={() =>
                      fulfill.mutate(r.id, {
                        onSuccess: () => toast.success(t('messages.transcriptDelivered')),
                        onError: (err: unknown) => {
                          const msg =
                            err &&
                            typeof err === 'object' &&
                            'response' in err &&
                            (err as { response?: { data?: { message?: string } } }).response?.data
                              ?.message;
                          toast.error(typeof msg === 'string' ? msg : t('messages.loadError'));
                        },
                      })
                    }
                  >
                    {t('transcripts.generateAndDeliver')}
                  </Button>
                </ActionStack>
              ),
            },
          ]}
          rows={rows}
        />
      )}
    </section>
  );
}
