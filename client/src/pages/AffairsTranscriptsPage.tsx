import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAllTranscriptsQuery, usePatchTranscriptMutation } from '../api/hooks.js';
import { ActionStack } from '../components/ui/ActionGroup.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';

type Tr = {
  id: string;
  status: string;
  requestedAt: string;
  student?: { user?: { name?: string; email?: string } };
};

function TranscriptRowActions({ row, t }: { row: Tr; t: (k: string) => string }) {
  const patch = usePatchTranscriptMutation();
  const [filePath, setFilePath] = useState('/uploads/transcript.pdf');
  return (
    <ActionStack>
      <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} />
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={patch.isPending || row.status === 'DELIVERED'}
        onClick={() =>
          patch.mutate(
            { id: row.id, filePath, status: 'DELIVERED' },
            {
              onSuccess: () => toast.success(t('messages.transcriptUpdated')),
              onError: () => toast.error(t('messages.loadError')),
            }
          )
        }
      >
        {t('labels.markDelivered')}
      </Button>
    </ActionStack>
  );
}

export function AffairsTranscriptsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAllTranscriptsQuery();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Tr[];

  return (
    <section>
      <PageHeader title={t('headings.affairsTranscripts')} />
      <DataTable<Tr>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'st', header: t('labels.status'), render: (r) => <StatusBadge status={r.status} /> },
          { key: 'who', header: t('labels.fullName'), render: (r) => r.student?.user?.name ?? '—' },
          { key: 'at', header: t('labels.requestedAt'), render: (r) => new Date(r.requestedAt).toLocaleString() },
          {
            key: 'act',
            header: t('labels.action'),
            render: (r) => <TranscriptRowActions row={r} t={t} />,
          },
        ]}
        rows={rows}
      />
    </section>
  );
}
