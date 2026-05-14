import { useTranslation } from 'react-i18next';
import { useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

export function StudentDashboardPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const email = typeof data.email === 'string' ? data.email : '';
  const role = typeof data.role === 'string' ? data.role : '';
  const name = typeof data.name === 'string' ? data.name : '';

  return (
    <section>
      <PageHeader title={t('headings.studentDashboard')} />
      <Card className="flex flex-col gap-1">
        <p className="m-0">
          <strong>{name}</strong>
        </p>
        <p className="m-0 text-sm text-slate-500">
          {email} · {role}
        </p>
      </Card>
    </section>
  );
}
