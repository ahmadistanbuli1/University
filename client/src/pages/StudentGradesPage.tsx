import { useTranslation } from 'react-i18next';
import { useMyResultsQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

type ResultRow = {
  id: string;
  score: unknown;
  semester: string;
  academicYear: string;
  attemptNumber: number;
  facultyCourse?: { course?: { name?: string; code?: string } };
};

export function StudentGradesPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyResultsQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data.results ?? []) as ResultRow[];

  return (
    <section>
      <PageHeader title={t('headings.studentGrades')} />
      <Card className="mb-6">
        <p className="m-0 text-sm text-slate-500">
          {t('labels.gpa')}{' '}
          <strong className="text-2xl font-bold text-indigo-600">{data.gpa}</strong>
        </p>
      </Card>
      <DataTable<ResultRow>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          {
            key: 'course',
            header: t('labels.title'),
            render: (r) => r.facultyCourse?.course?.name ?? '—',
          },
          { key: 'score', header: t('labels.score'), render: (r) => String(r.score) },
          { key: 'sem', header: t('labels.semester'), render: (r) => r.semester },
          { key: 'year', header: t('labels.academicYear'), render: (r) => r.academicYear },
          { key: 'att', header: t('labels.attemptNumber'), render: (r) => String(r.attemptNumber) },
        ]}
        rows={rows}
      />
    </section>
  );
}
