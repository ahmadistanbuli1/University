import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTuitionSummaryQuery } from '../api/hooks.js';
import {
  canPayInstallment,
  installmentDisplayLabel,
  isInstallmentFullyPaid,
  sortInstallments,
} from '../lib/tuition-utils.js';
import { Alert } from '../components/ui/Alert.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { cn } from '../lib/cn.js';

export function StudentTuitionPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useTuitionSummaryQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const installments = sortInstallments(data.installments);
  const sem1 = installments.find((i) => i.semesterKey === 'semester-1') ?? installments[0];
  const sem2 = installments.find((i) => i.semesterKey === 'semester-2') ?? installments[1];
  const displaySlots = [sem1, sem2].filter(Boolean);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.studentTuition')} description={t('tuition.lead')} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="m-0 text-sm text-zinc-500">{t('tuition.totalDue')}</p>
          <p className="m-0 mt-1 text-2xl font-bold text-violet-600">${data.totalDue.toFixed(2)}</p>
        </Card>
        <Card className="text-center">
          <p className="m-0 text-sm text-zinc-500">{t('tuition.totalPaid')}</p>
          <p className="m-0 mt-1 text-2xl font-bold text-emerald-600">${data.totalPaid.toFixed(2)}</p>
        </Card>
        <Card className="text-center">
          <p className="m-0 text-sm text-zinc-500">{t('tuition.remaining')}</p>
          <p className="m-0 mt-1 text-2xl font-bold text-amber-600">${data.totalRemaining.toFixed(2)}</p>
        </Card>
      </div>

      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-lg font-semibold">{t('tuition.installments')}</h2>
        <StatusBadge status={data.overallStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {displaySlots.map((inst) => {
          const title = installmentDisplayLabel(inst, t);
          const payable = canPayInstallment(installments, inst);
          const locked =
            inst.semesterKey === 'semester-2' &&
            !payable &&
            !isInstallmentFullyPaid(inst) &&
            inst.remaining > 0;
          const paid = isInstallmentFullyPaid(inst);

          return (
            <Card
              key={inst.id}
              className={cn(
                'flex flex-col gap-4 border-2 transition',
                paid
                  ? 'border-emerald-300/60 bg-emerald-50/30 dark:border-emerald-500/30 dark:bg-emerald-950/15'
                  : 'border-violet-200/80 dark:border-violet-500/25'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                    {inst.academicYear}
                  </p>
                  <h3 className="m-0 mt-1 text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                </div>
                <StatusBadge status={inst.status} />
              </div>

              <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-white/5">
                <p className="m-0 text-sm text-zinc-500">{t('tuition.amountDue')}</p>
                <p className="m-0 text-2xl font-bold text-violet-700 dark:text-violet-300">
                  ${inst.amountDue.toFixed(2)}
                </p>
                <p className="m-0 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {t('tuition.paid')}: ${inst.amountPaid.toFixed(2)}
                  {inst.remaining > 0 ? (
                    <>
                      {' '}
                      · {t('tuition.remaining')}:{' '}
                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                        ${inst.remaining.toFixed(2)}
                      </span>
                    </>
                  ) : null}
                </p>
              </div>

              {locked ? (
                <Alert variant="info">{t('tuition.payFirstSemesterFirst')}</Alert>
              ) : null}

              {payable ? (
                <Link
                  to={`/student/pay/${inst.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 px-5 py-2.5 text-base font-semibold text-white shadow-md shadow-violet-600/25 transition hover:from-violet-700 hover:to-violet-500"
                >
                  {t('tuition.payNow')}
                </Link>
              ) : paid ? (
                <p className="m-0 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {t('tuition.semesterPaid')}
                </p>
              ) : (
                <Button className="w-full" size="lg" disabled variant="secondary">
                  {t('tuition.payNow')}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <Link
        to="/student/discounts"
        className="inline-flex w-fit items-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-white/15"
      >
        {t('tuition.discountRequests')}
      </Link>
    </section>
  );
}
