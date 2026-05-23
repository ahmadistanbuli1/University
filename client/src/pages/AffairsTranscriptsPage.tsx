import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAllTranscriptsQuery, useProcessTranscriptMutation } from '../api/hooks.js';
import { MotionDialog } from '../components/motion/MotionDialog.js';
import { ActionStack } from '../components/ui/ActionGroup.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';

type Tr = {
  id: string;
  status: string;
  requestedAt: string;
  rejectionReason?: string | null;
  student?: { user?: { name?: string; email?: string } };
};

function TranscriptRowActions({
  row,
  t,
  onReject,
}: {
  row: Tr;
  t: (k: string) => string;
  onReject: (row: Tr) => void;
}) {
  const process = useProcessTranscriptMutation();

  if (row.status !== 'PENDING') {
    return row.status === 'REJECTED' && row.rejectionReason ? (
      <span className="text-xs text-red-600 dark:text-red-300">{row.rejectionReason}</span>
    ) : (
      <span className="text-xs text-zinc-500">—</span>
    );
  }

  return (
    <ActionStack>
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={process.isPending}
        onClick={() =>
          process.mutate(
            { id: row.id, action: 'approve' },
            {
              onSuccess: () => toast.success(t('messages.transcriptApproved')),
              onError: (err: unknown) => {
                const msg =
                  err &&
                  typeof err === 'object' &&
                  'response' in err &&
                  (err as { response?: { data?: { message?: string } } }).response?.data?.message;
                toast.error(typeof msg === 'string' ? msg : t('messages.loadError'));
              },
            }
          )
        }
      >
        {t('transcripts.approve')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={process.isPending}
        onClick={() => onReject(row)}
      >
        {t('transcripts.reject')}
      </Button>
    </ActionStack>
  );
}

export function AffairsTranscriptsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAllTranscriptsQuery();
  const process = useProcessTranscriptMutation();
  const [rejectTarget, setRejectTarget] = useState<Tr | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Tr[];

  return (
    <section>
      <PageHeader
        title={t('headings.affairsTranscripts')}
        description={t('transcripts.affairsLead')}
      />
      <DataTable<Tr>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'st', header: t('labels.status'), render: (r) => <StatusBadge status={r.status} /> },
          { key: 'who', header: t('labels.fullName'), render: (r) => r.student?.user?.name ?? '—' },
          {
            key: 'email',
            header: t('labels.email'),
            render: (r) => r.student?.user?.email ?? '—',
          },
          {
            key: 'at',
            header: t('labels.requestedAt'),
            render: (r) => new Date(r.requestedAt).toLocaleString(),
          },
          {
            key: 'act',
            header: t('labels.action'),
            render: (r) => (
              <TranscriptRowActions row={r} t={t} onReject={(row) => setRejectTarget(row)} />
            ),
          },
        ]}
        rows={rows}
      />

      <MotionDialog
        open={rejectTarget != null}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
        }}
        title={t('transcripts.rejectTitle')}
      >
        <p className="m-0 mb-3 text-sm text-zinc-600 dark:text-zinc-300">
          {t('transcripts.rejectHint')}
        </p>
        <Textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder={t('transcripts.rejectPlaceholder')}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setRejectTarget(null);
              setRejectReason('');
            }}
          >
            {t('labels.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={process.isPending || rejectReason.trim().length < 3}
            onClick={() => {
              if (!rejectTarget) return;
              process.mutate(
                {
                  id: rejectTarget.id,
                  action: 'reject',
                  rejectionReason: rejectReason.trim(),
                },
                {
                  onSuccess: () => {
                    toast.success(t('messages.transcriptRejected'));
                    setRejectTarget(null);
                    setRejectReason('');
                  },
                  onError: () => toast.error(t('messages.loadError')),
                }
              );
            }}
          >
            {t('transcripts.confirmReject')}
          </Button>
        </div>
      </MotionDialog>
    </section>
  );
}
