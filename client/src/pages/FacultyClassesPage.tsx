import { useTranslation } from 'react-i18next';
import { useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { getDepartmentLabel } from '../lib/department-labels.js';
import { formatStudyTermLabel } from '../lib/study-term.js';

type Fc = {
  id: string;
  semester: string;
  academicYear: string;
  course?: {
    name?: string;
    code?: string;
    department?: { name?: string; code?: string };
  };
};

export function FacultyClassesPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (Array.isArray(data.facultyCourses) ? data.facultyCourses : []) as Fc[];

  return (
    <section>
      <PageHeader title={t('headings.facultyCourses')} description={t('faculty.coursesLead')} />
      <DataTable<Fc>
        rowKey={(r) => r.id}
        emptyMessage={t('faculty.noCoursesAssigned')}
        columns={[
          { key: 'n', header: t('labels.title'), render: (r) => r.course?.name ?? '—' },
          { key: 'c', header: t('labels.courseCode'), render: (r) => r.course?.code ?? '—' },
          {
            key: 'd',
            header: t('labels.department'),
            render: (r) =>
              r.course?.department?.code && r.course?.department?.name
                ? getDepartmentLabel(
                    { code: r.course.department.code, name: r.course.department.name },
                    lang
                  )
                : (r.course?.department?.name ?? '—'),
          },
          {
            key: 's',
            header: t('labels.semester'),
            render: (r) => formatStudyTermLabel(r.semester, t, r.course?.code),
          },
          { key: 'y', header: t('labels.academicYear'), render: (r) => r.academicYear },
        ]}
        rows={rows}
      />
    </section>
  );
}
