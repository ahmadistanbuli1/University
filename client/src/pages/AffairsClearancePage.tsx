import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  fetchClearancePdfBlob,
  useAllClearancesQuery,
  useDeliverClearanceMutation,
  useProcessClearanceMutation,
} from '../api/hooks.js';
import { MotionDialog } from '../components/motion/MotionDialog.js';
import { ActionStack } from '../components/ui/ActionGroup.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';
import { clearanceStatusLabel } from '../lib/clearance-status.js';

type Cl = {
  id: string;
  status: string;
  requestedAt: string;
  rejectionReason?: string | null;
  filePath?: string | null;
  student?: {
    user?: { name?: string; email?: string };
    department?: { name?: string; college?: { name?: string } };
    academicNumber?: string;
  };
};

function ClearanceRowActions({
  row,
  t,
  onReject,
  onApprove,
}: {
  row: Cl;
  t: (k: string) => string;
  onReject: (row: Cl) => void;
  onApprove: (row: Cl) => void;
}) {
  if (row.status !== 'PENDING') {
    if (row.status === 'DELIVERED' && row.filePath) {
      return (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            fetchClearancePdfBlob(row.id)
              .then((blob) => {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank', 'noopener,noreferrer');
                setTimeout(() => URL.revokeObjectURL(url), 60_000);
              })
              .catch(() => toast.error(t('messages.loadError')))
          }
        >
          {t('transcripts.preview')}
        </Button>
      );
    }
    if (row.status === 'REJECTED' && row.rejectionReason) {
      return <span className="text-xs text-red-600 dark:text-red-300">{row.rejectionReason}</span>;
    }
    return <span className="text-xs text-zinc-500">—</span>;
  }

  return (
    <ActionStack>
      <Button type="button" variant="primary" size="sm" onClick={() => onApprove(row)}>
        {t('clearances.approveAndSend')}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onReject(row)}>
        {t('transcripts.reject')}
      </Button>
    </ActionStack>
  );
}

export function AffairsClearancePage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAllClearancesQuery();
  const rejectMut = useProcessClearanceMutation();
  const deliverMut = useDeliverClearanceMutation();
  const [rejectTarget, setRejectTarget] = useState<Cl | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveTarget, setApproveTarget] = useState<Cl | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Cl[];

  return (
    <section>
      <PageHeader
        title={t('headings.affairsClearances')}
        description={t('clearances.affairsLead')}
      />

      <DataTable<Cl>
        rowKey={(r) => r.id}
        emptyMessage={t('clearances.empty')}
        columns={[
          {
            key: 'st',
            header: t('labels.status'),
            render: (r) => (
              <StatusBadge status={r.status}>{clearanceStatusLabel(r.status, t)}</StatusBadge>
            ),
          },
          {
            key: 'student',
            header: t('labels.fullName'),
            render: (r) => r.student?.user?.name ?? '—',
          },
          {
            key: 'dept',
            header: t('labels.department'),
            render: (r) => r.student?.department?.name ?? '—',
          },
          {
            key: 'dt',
            header: t('labels.requestedAt'),
            render: (r) => new Date(r.requestedAt).toLocaleString(),
          },
          {
            key: 'act',
            header: t('labels.actions'),
            render: (r) => (
              <ClearanceRowActions
                row={r}
                t={t}
                onReject={setRejectTarget}
                onApprove={setApproveTarget}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <MotionDialog
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
        }}
        title={t('clearances.rejectTitle')}
      >
        <Textarea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t('clearances.rejectPlaceholder')}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setRejectTarget(null)}>
            {t('labels.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={rejectMut.isPending || rejectReason.trim().length < 3}
            onClick={() => {
              if (!rejectTarget) return;
              rejectMut.mutate(
                { id: rejectTarget.id, rejectionReason: rejectReason.trim() },
                {
                  onSuccess: () => {
                    toast.success(t('clearances.rejected'));
                    setRejectTarget(null);
                    setRejectReason('');
                  },
                  onError: () => toast.error(t('messages.loadError')),
                }
              );
            }}
          >
            {t('transcripts.reject')}
          </Button>
        </div>
      </MotionDialog>

      <MotionDialog
        open={!!approveTarget}
        onClose={() => {
          if (!deliverMut.isPending) setApproveTarget(null);
        }}
        title={t('clearances.approveTitle')}
      >
        <p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">
          {t('clearances.approveDescription')}
        </p>
        <dl className="mt-4 flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('labels.fullName')}</dt>
            <dd className="m-0 font-semibold">{approveTarget?.student?.user?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('profile.academicNumber')}</dt>
            <dd className="m-0 font-semibold">{approveTarget?.student?.academicNumber ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('labels.department')}</dt>
            <dd className="m-0 font-semibold">{approveTarget?.student?.department?.name ?? '—'}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-zinc-500">{t('clearances.approveHint')}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={deliverMut.isPending}
            onClick={() => setApproveTarget(null)}
          >
            {t('labels.cancel')}
          </Button>
          <Button
            type="button"
            disabled={deliverMut.isPending}
            onClick={() => {
              if (!approveTarget) return;
              deliverMut.mutate(approveTarget.id, {
                onSuccess: () => {
                  toast.success(t('clearances.delivered'));
                  setApproveTarget(null);
                },
                onError: () => toast.error(t('messages.loadError')),
              });
            }}
          >
            {deliverMut.isPending ? t('clearances.generating') : t('clearances.confirmApprove')}
          </Button>
        </div>
      </MotionDialog>
    </section>
  );
}
