import { useTranslation } from 'react-i18next';
import { useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

export function FacultyDashboardPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const courses = Array.isArray(data.facultyCourses) ? data.facultyCourses : [];

  return (
    <section>
      <PageHeader title={t('headings.facultyDashboard')} />
      <Card>
        <p className="m-0">
          <strong>{typeof data.name === 'string' ? data.name : ''}</strong>
        </p>
        <p className="m-0 mt-2 text-sm text-slate-500">{t('messages.sectionsCount', { count: courses.length })}</p>
      </Card>
    </section>
  );
}
