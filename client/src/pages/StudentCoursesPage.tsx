import { useTranslation } from 'react-i18next';
import { useMyEnrollmentsQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

type Row = {
  id: string;
  course?: { name?: string; code?: string; department?: { name?: string } };
};

export function StudentCoursesPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMyEnrollmentsQuery();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Row[];

  return (
    <section>
      <PageHeader title={t('headings.studentCourses')} />
      <DataTable<Row>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'course', header: t('labels.title'), render: (r) => r.course?.name ?? '—' },
          { key: 'code', header: t('labels.courseCode'), render: (r) => r.course?.code ?? '—' },
          { key: 'dept', header: t('labels.department'), render: (r) => r.course?.department?.name ?? '—' },
        ]}
        rows={rows}
      />
    </section>
  );
}
