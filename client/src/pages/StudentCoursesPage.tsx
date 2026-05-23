import { useTranslation } from 'react-i18next';
import { useMyEnrollmentsQuery, type MyEnrollmentsByTerm } from '../api/hooks.js';
import { getStudyYearLabel } from '../lib/department-labels.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

type CourseRow = { id: string; name: string; code: string };

export function StudentCoursesPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const { data, isLoading, isError } = useMyEnrollmentsQuery();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const plan = (data ?? { studyYear: 1, terms: [] }) as MyEnrollmentsByTerm;
  const termLabels: Record<'FIRST' | 'SECOND', string> = {
    FIRST: t('studyPlan.termFirst'),
    SECOND: t('studyPlan.termSecond'),
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.studentCourses')}
        description={t('studentCourses.lead', {
          year: getStudyYearLabel(plan.studyYear, lang),
        })}
      />

      {plan.terms.every((block) => block.courses.length === 0) ? (
        <Card>
          <p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">{t('studentCourses.empty')}</p>
        </Card>
      ) : (
        plan.terms.map((block) => (
          <Card key={block.term} className="overflow-hidden">
            <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {termLabels[block.term]}
            </h2>
            <DataTable<CourseRow>
              rowKey={(r) => r.id}
              emptyMessage="—"
              columns={[
                { key: 'name', header: t('labels.title'), render: (r) => r.name },
                { key: 'code', header: t('labels.courseCode'), render: (r) => r.code },
              ]}
              rows={block.courses}
            />
          </Card>
        ))
      )}
    </section>
  );
}
