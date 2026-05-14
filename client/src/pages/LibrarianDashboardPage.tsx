import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card.js';
import { PageHeader } from '../components/ui/PageHeader.js';

export function LibrarianDashboardPage() {
  const { t } = useTranslation('nav');
  return (
    <section>
      <PageHeader title={t('headings.librarianDashboard')} />
      <Card>
        <p className="m-0 text-sm leading-relaxed text-slate-600">{t('messages.librarianWelcome')}</p>
      </Card>
    </section>
  );
}
