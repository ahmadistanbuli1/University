import { useTranslation } from 'react-i18next';
import { useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { Mono } from '../components/ui/Mono.js';
import { PageHeader } from '../components/ui/PageHeader.js';

type Fc = {
  id: string;
  semester: string;
  academicYear: string;
  course?: { name?: string; code?: string };
};

export function FacultyClassesPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (Array.isArray(data.facultyCourses) ? data.facultyCourses : []) as Fc[];

  return (
    <section>
      <PageHeader title={t('headings.facultyClasses')} />
      <DataTable<Fc>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'n', header: t('labels.title'), render: (r) => r.course?.name ?? '—' },
          { key: 'c', header: t('labels.courseCode'), render: (r) => r.course?.code ?? '—' },
          { key: 's', header: t('labels.semester'), render: (r) => r.semester },
          { key: 'y', header: t('labels.academicYear'), render: (r) => r.academicYear },
          { key: 'id', header: t('labels.id'), render: (r) => <Mono>{r.id}</Mono> },
        ]}
        rows={rows}
      />
    </section>
  );
}
