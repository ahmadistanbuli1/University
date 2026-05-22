import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTuitionSummaryQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

export function StudentTuitionPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useTuitionSummaryQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

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

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-lg font-semibold">{t('tuition.installments')}</h2>
          <StatusBadge status={data.overallStatus} />
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {data.installments.map((inst) => (
            <li
              key={inst.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/80 px-4 py-3 dark:border-white/10"
            >
              <div>
                <p className="m-0 font-medium">{inst.label}</p>
                <p className="m-0 mt-1 text-sm text-zinc-500">
                  {inst.academicYear} · {t('tuition.paid')}: ${inst.amountPaid.toFixed(2)} / $
                  {inst.amountDue.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={inst.status} />
                {inst.remaining > 0 ? (
                  <Link
                    to={`/student/pay/${inst.id}`}
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-violet-600 to-violet-400 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {t('tuition.payNow')}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Link
        to="/student/discounts"
        className="inline-flex w-fit items-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-white/15"
      >
        {t('tuition.discountRequests')}
      </Link>
    </section>
  );
}
