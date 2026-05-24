import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  usePayInstallmentQuery,
  useSimulatePaymentMutation,
  useTuitionSummaryQuery,
} from '../api/hooks.js';
import { PaymentQr } from '../components/PaymentQr.js';
import { installmentDisplayLabel } from '../lib/tuition-utils.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { scaleIn, springSnappy } from '../lib/motion.js';

export function StudentPaymentPage() {
  const { t } = useTranslation('nav');
  const { installmentId } = useParams<{ installmentId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePayInstallmentQuery(installmentId);
  const summary = useTuitionSummaryQuery();
  const pay = useSimulatePaymentMutation();
  const [receipt, setReceipt] = useState<{
    referenceCode: string;
    amountPaid: number;
    paidAt: string;
  } | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError || !data || !installmentId) {
    return <Alert variant="error">{t('messages.loadError')}</Alert>;
  }

  const refPreview = `SPU-${installmentId.slice(0, 8).toUpperCase()}`;
  const remaining = data.installment.remaining;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.studentPayment')} description={t('tuition.paymentLead')} />

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSnappy}
      >
        <Card>
          <h2 className="m-0 text-lg font-semibold">{t('tuition.paymentDetails')}</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">{t('tuition.item')}</dt>
              <dd className="m-0 font-medium">
                {installmentDisplayLabel(data.installment, t)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">{t('labels.academicYear')}</dt>
              <dd className="m-0 font-medium">{data.installment.academicYear}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">{t('tuition.amountDue')}</dt>
              <dd className="m-0 font-medium">${data.installment.amountDue.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">{t('tuition.remaining')}</dt>
              <dd className="m-0 text-lg font-bold text-violet-600">${remaining.toFixed(2)}</dd>
            </div>
          </dl>
          {remaining > 0 && !receipt ? (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-6">
              <Button
                className="w-full"
                size="lg"
                disabled={pay.isPending}
                onClick={() => {
                  pay.mutate(installmentId, {
                    onSuccess: (res) => {
                      setReceipt({
                        referenceCode: res.referenceCode,
                        amountPaid: res.amountPaid,
                        paidAt: res.paidAt,
                      });
                      toast.success(t('tuition.paymentSuccess'));
                      void summary.refetch();
                    },
                    onError: (err) => {
                      const msg = isAxiosError(err)
                        ? (err.response?.data as { error?: string })?.error
                        : undefined;
                      toast.error(msg ?? t('messages.loadError'));
                    },
                  });
                }}
              >
                {pay.isPending ? t('tuition.processing') : t('tuition.confirmPay')}
              </Button>
            </motion.div>
          ) : null}
        </Card>

        <Card className="flex flex-col items-center gap-4 text-center">
          <p className="m-0 text-sm text-zinc-500">{t('tuition.scanQr')}</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, ...springSnappy }}
          >
            <PaymentQr value={receipt?.referenceCode ?? refPreview} size={180} />
          </motion.div>
          <p className="m-0 font-mono text-xs text-zinc-500">{receipt?.referenceCode ?? refPreview}</p>
          <p className="m-0 text-xs text-zinc-400">{t('tuition.simulatedNote')}</p>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {receipt ? (
          <motion.div
            key="receipt"
            initial={scaleIn.initial}
            animate={scaleIn.animate}
            exit={scaleIn.exit}
            transition={springSnappy}
          >
            <Card className="border-emerald-300/50 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-950/20">
              <h3 className="m-0 font-semibold text-emerald-800 dark:text-emerald-200">
                {t('tuition.receipt')}
              </h3>
              <p className="mt-2 text-sm">
                {t('tuition.receiptAmount')}: <strong>${receipt.amountPaid.toFixed(2)}</strong>
              </p>
              <p className="text-sm font-mono">{receipt.referenceCode}</p>
              <p className="text-xs text-zinc-500">{new Date(receipt.paidAt).toLocaleString()}</p>
              <Button className="mt-4" variant="secondary" onClick={() => navigate('/student/tuition')}>
                {t('tuition.backToTuition')}
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/student/tuition" className="text-sm text-violet-600 hover:underline dark:text-violet-400">
              {t('tuition.backToTuition')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
