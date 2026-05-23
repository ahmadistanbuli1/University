import { useTranslation } from 'react-i18next';
import { useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
type FacultyCourse = {
  id: string;
  semester: string;
  academicYear: string;
  course?: {
    name?: string;
    code?: string;
    department?: { name?: string; code?: string };
  };
};

type MeData = {
  name?: string;
  email?: string;
  role?: string;
  facultyCourses?: FacultyCourse[];
};

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="m-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function FacultyDashboardPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const me = data as MeData;
  const courses = Array.isArray(me.facultyCourses) ? me.facultyCourses : [];
  const colleges = [
    ...new Set(
      courses
        .map((c) => c.course?.department?.name)
        .filter((n): n is string => Boolean(n))
    ),
  ];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.facultyProfile')} description={t('faculty.profileLead')} />

      <Card>
        <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t('profile.identity')}
        </h2>
        <dl className="flex flex-col gap-3">
          <ProfileField label={t('labels.fullName')} value={me.name ?? '—'} />
          <ProfileField label={t('labels.email')} value={me.email ?? '—'} />
          <ProfileField label={t('labels.role')} value={me.role ?? '—'} />
        </dl>
      </Card>

      <Card>
        <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t('faculty.teachingSummary')}
        </h2>
        <dl className="flex flex-col gap-3">
          <ProfileField
            label={t('faculty.assignedCoursesCount')}
            value={String(courses.length)}
          />
          <ProfileField
            label={t('faculty.collegesTaught')}
            value={colleges.length > 0 ? colleges.join(' · ') : '—'}
          />
        </dl>
      </Card>
    </section>
  );
}
