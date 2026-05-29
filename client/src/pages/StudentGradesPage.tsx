import { useTranslation } from 'react-i18next';
import { useMyResultsQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { formatStudyTermLabel } from '../lib/study-term.js';

type ResultRow = {
  id: string;
  score: unknown;
  practicalScore?: unknown;
  theoryScore?: unknown;
  semester: string;
  academicYear: string;
  facultyCourse?: { course?: { name?: string; code?: string } };
};

function formatScore(value: unknown): string {
  if (value == null) return '—';
  return String(value);
}

export function StudentGradesPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyResultsQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data.results ?? []) as ResultRow[];
  const pending = data.pendingCurrentTerm === true;

  return (
    <section>
      <PageHeader title={t('headings.studentGrades')} />
      {pending ? (
        <Alert variant="info" className="mb-6">
          {t('student.gradesPendingTerm')}
        </Alert>
      ) : null}
      <Card className="mb-6">
        <p className="m-0 text-sm text-slate-500">
          {t('labels.gpa')}{' '}
          <strong className="text-2xl font-bold text-brand">
            {pending || data.gpa == null ? '—' : data.gpa}
          </strong>
        </p>
        {pending ? (
          <p className="mt-2 text-xs text-zinc-500">{t('student.gpaAfterTermComplete')}</p>
        ) : null}
      </Card>
      {pending ? null : (
        <DataTable<ResultRow>
          rowKey={(r) => r.id}
          emptyMessage="—"
          columns={[
            {
              key: 'course',
              header: t('labels.title'),
              render: (r) => r.facultyCourse?.course?.name ?? '—',
            },
            {
              key: 'practical',
              header: t('studyPlan.practical', { max: 40 }),
              render: (r) => formatScore(r.practicalScore),
            },
            {
              key: 'theory',
              header: t('studyPlan.theory', { max: 60 }),
              render: (r) => formatScore(r.theoryScore),
            },
            { key: 'score', header: t('studyPlan.total'), render: (r) => formatScore(r.score) },
            {
              key: 'sem',
              header: t('labels.semester'),
              render: (r) =>
                formatStudyTermLabel(r.semester, t, r.facultyCourse?.course?.code),
            },
            { key: 'year', header: t('labels.academicYear'), render: (r) => r.academicYear },
          ]}
          rows={rows}
        />
      )}
    </section>
  );
}
