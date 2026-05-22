import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyStudyPlanQuery } from '../api/hooks.js';
import { getStudyYearLabel } from '../lib/department-labels.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { cn } from '../lib/cn.js';

type StudyPlanCourse = {
  id: string;
  name: string;
  practicalPass: number;
  theoryPass: number;
  practicalDisplay: string;
  theoryDisplay: string;
  totalScore: number | null;
  hasGrade: boolean;
};

type StudyPlanTerm = {
  term: 'FIRST' | 'SECOND';
  termGpa: number | null;
  courses: StudyPlanCourse[];
};

type StudyPlanData = {
  maxStudyYears: number;
  currentStudyYear: number;
  selectedStudyYear: number;
  yearGpa: number | null;
  terms: StudyPlanTerm[];
};

export function StudentStudyPlanPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { data, isLoading, isError } = useMyStudyPlanQuery(selectedYear ?? undefined);

  const plan = data as StudyPlanData | undefined;

  const activeYear = selectedYear ?? plan?.currentStudyYear ?? 1;

  const yearOptions = useMemo(() => {
    const max = plan?.maxStudyYears ?? 4;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [plan?.maxStudyYears]);

  if (isLoading && !plan) return <LoadingState />;
  if (isError || !plan) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.studentStudyPlan')}
        description={t('studyPlan.lead')}
      />

      <div className="flex flex-wrap gap-2">
        {yearOptions.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setSelectedYear(year)}
            className={cn(
              'rounded-2xl border px-4 py-2 text-sm font-semibold transition',
              activeYear === year
                ? 'border-violet-500 bg-violet-600 text-white shadow-md'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-violet-500/15'
            )}
          >
            {getStudyYearLabel(year, lang)}
          </button>
        ))}
      </div>

      <Card>
        <p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
          {t('studyPlan.yearGpa')}{' '}
          <strong className="text-xl font-bold text-indigo-600 dark:text-violet-300">
            {plan.yearGpa != null ? plan.yearGpa : '—'}
          </strong>
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t('studyPlan.passLegend')}</p>
      </Card>

      {plan.terms.map((termBlock) => (
        <Card key={termBlock.term}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {termBlock.term === 'FIRST' ? t('studyPlan.termFirst') : t('studyPlan.termSecond')}
            </h2>
            <p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
              {t('studyPlan.termGpa')}{' '}
              <strong className="text-indigo-600 dark:text-violet-300">
                {termBlock.termGpa != null ? termBlock.termGpa : '—'}
              </strong>
            </p>
          </div>
          <DataTable<StudyPlanCourse>
            rowKey={(r) => r.id}
            emptyMessage="—"
            columns={[
              {
                key: 'name',
                header: t('studyPlan.courseName'),
                render: (r) => r.name,
              },
              {
                key: 'practical',
                header: t('studyPlan.practical', { max: 40 }),
                render: (r) => (
                  <span>
                    {r.practicalDisplay}
                    <span className="ms-1 text-xs text-zinc-400">/ {r.practicalPass}</span>
                  </span>
                ),
              },
              {
                key: 'theory',
                header: t('studyPlan.theory', { max: 60 }),
                render: (r) => (
                  <span>
                    {r.theoryDisplay}
                    <span className="ms-1 text-xs text-zinc-400">/ {r.theoryPass}</span>
                  </span>
                ),
              },
              {
                key: 'total',
                header: t('studyPlan.total'),
                render: (r) => (r.totalScore != null ? String(r.totalScore) : '—'),
              },
            ]}
            rows={termBlock.courses}
          />
        </Card>
      ))}
    </section>
  );
}
