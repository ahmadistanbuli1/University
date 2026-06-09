import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  fetchClearancePdfBlob,
  useMyClearancesQuery,
  useRequestClearanceMutation,
  useServiceFeesQuery,
} from '../api/hooks.js';
import { PaymentQr } from '../components/PaymentQr.js';
import { MotionDialog } from '../components/motion/MotionDialog.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { clearanceStatusLabel } from '../lib/clearance-status.js';

type Cl = {
  id: string;
  status: string;
  requestedAt: string;
  processedAt?: string | null;
  rejectionReason?: string | null;
  feeAmount?: number;
  feePaid?: boolean;
  feeRefunded?: boolean;
  paymentReference?: string | null;
  filePath?: string | null;
};

async function openClearancePdf(id: string, download: boolean) {
  const blob = await fetchClearancePdfBlob(id);
  const url = URL.createObjectURL(blob);
  if (download) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearance-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

export function StudentClearancePage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyClearancesQuery();
  const fees = useServiceFeesQuery();
  const req = useRequestClearanceMutation();
  const [payOpen, setPayOpen] = useState(false);
  const paymentPreviewRef = `CL-PREVIEW-${Date.now().toString(36).toUpperCase()}`;

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Cl[];
  const hasActive = rows.some((r) => r.status === 'PENDING');
  const clearanceFee = fees.data?.clearanceFee ?? 15;

  return (
    <section>
      <PageHeader
        title={t('headings.studentClearances')}
        description={t('clearances.studentLead')}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button type="button" disabled={req.isPending || hasActive} onClick={() => setPayOpen(true)}>
          {t('clearances.request')}
        </Button>
        {hasActive ? (
          <p className="m-0 text-sm text-zinc-500">{t('clearances.activeRequestHint')}</p>
        ) : null}
      </div>

      <MotionDialog open={payOpen} onClose={() => setPayOpen(false)} title={t('clearances.payTitle')}>
        <p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">{t('clearances.payDescription')}</p>
        <dl className="mt-4 flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('clearances.feeItem')}</dt>
            <dd className="m-0 font-semibold">{t('clearances.certificateTitle')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('tuition.amountDue')}</dt>
            <dd className="m-0 text-lg font-bold text-brand">${clearanceFee.toFixed(2)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-center">
          <PaymentQr value={paymentPreviewRef} />
        </div>
        <p className="mt-3 text-xs text-zinc-500">{t('tuition.simulatedNote')}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setPayOpen(false)}>
            {t('labels.cancel')}
          </Button>
          <Button
            type="button"
            disabled={req.isPending}
            onClick={() => {
              req.mutate(
                { confirmPayment: true },
                {
                  onSuccess: () => {
                    toast.success(t('clearances.requestSubmitted'));
                    setPayOpen(false);
                  },
                  onError: () => toast.error(t('messages.loadError')),
                }
              );
            }}
          >
            {t('clearances.confirmPay')}
          </Button>
        </div>
      </MotionDialog>

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
            key: 'dt',
            header: t('labels.requestedAt'),
            render: (r) => new Date(r.requestedAt).toLocaleString(),
          },
          {
            key: 'fee',
            header: t('transcripts.payment'),
            render: (r) =>
              r.feeRefunded
                ? t('clearances.refunded', { amount: (r.feeAmount ?? 0).toFixed(2) })
                : r.feePaid
                  ? `$${(r.feeAmount ?? 0).toFixed(2)}`
                  : '—',
          },
          {
            key: 'rs',
            header: t('labels.notes'),
            render: (r) =>
              r.status === 'REJECTED' && r.rejectionReason ? (
                <span className="text-xs text-red-600 dark:text-red-300">{r.rejectionReason}</span>
              ) : (
                '—'
              ),
          },
          {
            key: 'act',
            header: t('labels.actions'),
            render: (r) =>
              r.status === 'DELIVERED' && r.filePath ? (
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      openClearancePdf(r.id, false).catch(() => toast.error(t('messages.loadError')))
                    }
                  >
                    {t('transcripts.preview')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      openClearancePdf(r.id, true).catch(() => toast.error(t('messages.loadError')))
                    }
                  >
                    {t('transcripts.download')}
                  </Button>
                </div>
              ) : (
                '—'
              ),
          },
        ]}
        rows={rows}
      />
    </section>
  );
}
