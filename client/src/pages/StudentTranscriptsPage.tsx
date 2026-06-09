import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  fetchTranscriptPdfBlob,
  useMyTranscriptsQuery,
  useRequestTranscriptMutation,
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
import { transcriptStatusLabel } from '../lib/transcript-status.js';

type Tr = {
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
  const fees = useServiceFeesQuery();
  const req = useRequestTranscriptMutation();
  const [payOpen, setPayOpen] = useState(false);
  const paymentPreviewRef = `TR-PREVIEW-${Date.now().toString(36).toUpperCase()}`;

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Tr[];
  const hasActive = rows.some((r) => r.status === 'PENDING' || r.status === 'AFFAIRS_APPROVED');
  const transcriptFee = fees.data?.transcriptFee ?? 5;

  return (
    <section>
      <PageHeader
        title={t('headings.studentTranscripts')}
        description={t('transcripts.studentLead')}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button type="button" disabled={req.isPending || hasActive} onClick={() => setPayOpen(true)}>
          {t('labels.requestTranscript')}
        </Button>
        {hasActive ? (
          <p className="m-0 text-sm text-zinc-500">{t('transcripts.activeRequestHint')}</p>
        ) : null}
      </div>

      <MotionDialog open={payOpen} onClose={() => setPayOpen(false)} title={t('transcripts.payTitle')}>
        <p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">{t('transcripts.payDescription')}</p>
        <dl className="mt-4 flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('transcripts.feeItem')}</dt>
            <dd className="m-0 font-semibold">{t('transcripts.officialTranscript')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">{t('tuition.amountDue')}</dt>
            <dd className="m-0 text-lg font-bold text-brand">${transcriptFee.toFixed(2)}</dd>
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
                    toast.success(t('messages.transcriptRequested'));
                    setPayOpen(false);
                  },
                  onError: (err: unknown) => {
                    const msg =
                      err &&
                      typeof err === 'object' &&
                      'response' in err &&
                      (err as { response?: { data?: { message?: string } } }).response?.data?.message;
                    toast.error(typeof msg === 'string' ? msg : t('messages.loadError'));
                  },
                }
              );
            }}
          >
            {t('transcripts.confirmPayAndRequest')}
          </Button>
        </div>
      </MotionDialog>

      <DataTable<Tr>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          {
            key: 'st',
            header: t('labels.status'),
            render: (r) => (
              <span className="inline-flex flex-col gap-1">
                <StatusBadge status={r.status} />
                <span className="text-xs text-zinc-500">{transcriptStatusLabel(r.status, t)}</span>
              </span>
            ),
          },
          {
            key: 'fee',
            header: t('transcripts.payment'),
            render: (r) =>
              r.feePaid ? (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                  ${(r.feeAmount ?? transcriptFee).toFixed(2)}
                  {r.paymentReference ? ` · ${r.paymentReference}` : ''}
                </span>
              ) : (
                '—'
              ),
          },
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
              if (r.status === 'REJECTED') {
                return (
                  <div className="flex max-w-md flex-col gap-2">
                    {r.rejectionReason ? (
                      <Alert variant="error" className="m-0 text-start">
                        <strong className="block text-xs font-bold">
                          {t('transcripts.rejectionReason')}
                        </strong>
                        <span className="text-sm">{r.rejectionReason}</span>
                      </Alert>
                    ) : null}
                    {r.feeRefunded ? (
                      <Alert variant="info" className="m-0 text-start text-sm">
                        {t('transcripts.refundMessage', {
                          amount: (r.feeAmount ?? transcriptFee).toFixed(2),
                        })}
                      </Alert>
                    ) : null}
                  </div>
                );
              }
              if (r.status === 'AFFAIRS_APPROVED') {
                return (
                  <span className="text-xs text-brand dark:text-brand-light">
                    {t('transcripts.atExamOffice')}
                  </span>
                );
              }
              if (r.status === 'PENDING') {
                return (
                  <span className="text-xs text-amber-700 dark:text-amber-200">
                    {t('transcripts.awaitingAffairs')}
                  </span>
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
