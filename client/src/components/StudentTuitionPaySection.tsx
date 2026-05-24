import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTuitionSummaryQuery } from '../api/hooks.js';
import {
  canPayInstallment,
  isInstallmentFullyPaid,
  isSecondSemesterPaymentOpen,
  sortInstallments,
  type TuitionNewsItem,
} from '../lib/tuition-utils.js';
import { StatusBadge } from './ui/StatusBadge.js';
import { Card } from './ui/Card.js';
import { cn } from '../lib/cn.js';

type StudentTuitionPaySectionProps = {
  newsItems: TuitionNewsItem[];
};

function PayCard({
  title,
  amountDue,
  amountPaid,
  remaining,
  status,
  payHref,
  active,
  dimmed,
  hint,
}: {
  title: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
  status: string;
  payHref?: string;
  active: boolean;
  dimmed: boolean;
  hint?: string;
}) {
  const { t } = useTranslation('nav');
  const paid = remaining <= 0.01;

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 border-2 transition',
        dimmed && 'pointer-events-none border-zinc-200/50 opacity-45 dark:border-white/5',
        !dimmed && paid && 'border-emerald-300/60 bg-emerald-50/25 dark:border-emerald-500/30',
        !dimmed && !paid && active && 'border-violet-300/80 dark:border-violet-500/40'
      )}
      aria-disabled={dimmed}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="m-0 text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
        {t('tuition.paid')}: ${amountPaid.toFixed(2)} / ${amountDue.toFixed(2)}
      </p>
      {hint ? (
        <p className="m-0 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
      {!dimmed && active && !paid && payHref ? (
        <Link
          to={payHref}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition hover:from-violet-700 hover:to-violet-500"
        >
          {t('tuition.payNow')}
        </Link>
      ) : null}
      {!dimmed && paid ? (
        <p className="m-0 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {t('tuition.semesterPaid')}
        </p>
      ) : null}
      {dimmed ? (
        <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-zinc-200/80 px-4 py-2.5 text-sm font-semibold text-zinc-500 dark:bg-white/10 dark:text-zinc-500">
          {t('tuition.payNow')}
        </span>
      ) : null}
    </Card>
  );
}

export function StudentTuitionPaySection({ newsItems }: StudentTuitionPaySectionProps) {
  const { t } = useTranslation('nav');
  const { data: tuition } = useTuitionSummaryQuery();

  if (!tuition?.installments?.length) return null;

  const installments = sortInstallments(tuition.installments);
  const sem1 = installments.find((i) => i.semesterKey === 'semester-1') ?? installments[0];
  const sem2 = installments.find((i) => i.semesterKey === 'semester-2') ?? installments[1];
  if (!sem1 || !sem2) return null;

  const secondOpen = isSecondSemesterPaymentOpen(newsItems);
  const sem1Paid = isInstallmentFullyPaid(sem1);
  const sem1CanPay = sem1.remaining > 0.01;
  const sem2CanPay = canPayInstallment(installments, sem2);
  const sem2Active = secondOpen && sem2CanPay;
  const sem2Dimmed = (!secondOpen || !sem1Paid) && sem2.remaining > 0.01;

  const latestTuitionNews = newsItems
    .filter((n) => n.category === 'TUITION')
    .slice(0, 1)[0];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="m-0 text-lg font-semibold text-zinc-900 dark:text-white">
          {t('tuition.paymentSection')}
        </h2>
        {latestTuitionNews?.title ? (
          <p className="m-0 mt-1 text-sm text-zinc-500 dark:text-zinc-400">{latestTuitionNews.title}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PayCard
          title={t('tuition.payFirstSemesterFees')}
          amountDue={sem1.amountDue}
          amountPaid={sem1.amountPaid}
          remaining={sem1.remaining}
          status={sem1.status}
          payHref={`/student/pay/${sem1.id}`}
          active={sem1CanPay}
          dimmed={false}
        />
        <PayCard
          title={t('tuition.paySecondSemesterFees')}
          amountDue={sem2.amountDue}
          amountPaid={sem2.amountPaid}
          remaining={sem2.remaining}
          status={sem2.status}
          payHref={sem2Active ? `/student/pay/${sem2.id}` : undefined}
          active={sem2Active}
          dimmed={sem2Dimmed}
          hint={
            !secondOpen
              ? t('tuition.secondSemesterWaitingAdmin')
              : !sem1Paid
                ? t('tuition.payFirstSemesterFirst')
                : undefined
          }
        />
      </div>
    </section>
  );
}
