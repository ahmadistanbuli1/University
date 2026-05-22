import { useTranslation } from 'react-i18next';
import { getDepartmentLabel, studyYearFromSemester } from '../lib/department-labels.js';
import { Link } from 'react-router-dom';
import {
  useMeQuery,
  useMyEnrollmentsQuery,
  useMyResultsQuery,
  useNewsListQuery,
  useTuitionSummaryQuery,
} from '../api/hooks.js';
import { TuitionNewsBanner } from '../components/TuitionNewsBanner.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

type StudentProfile = {
  academicNumber?: string;
  currentSemester?: number;
  academicYear?: string;
    department?: {
    name?: string;
    code?: string;
    college?: { name?: string };
  };
};

type MeData = {
  name?: string;
  email?: string;
  role?: string;
  college?: { name?: string };
  studentProfile?: StudentProfile | null;
};

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="m-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function StudentDashboardPage() {
  const { t, i18n: i18nInstance } = useTranslation('nav');
  const lang = i18nInstance.language;
  const { data, isLoading, isError } = useMeQuery();
  const enrollments = useMyEnrollmentsQuery();
  const results = useMyResultsQuery();
  const tuition = useTuitionSummaryQuery();
  const news = useNewsListQuery(1);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const me = data as MeData;
  const profile = me.studentProfile;
  const name = me.name ?? '—';
  const email = me.email ?? '—';
  const role = me.role ?? '—';
  const courseCount = Array.isArray(enrollments.data) ? enrollments.data.length : 0;
  const gradeCount = Array.isArray(results.data?.results) ? results.data.results.length : 0;
  const gpa = results.data?.gpa ?? '—';

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.studentProfile')} description={t('profile.lead')} />

      <Card>
        <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t('profile.identity')}</h2>
        <dl className="flex flex-col gap-3">
          <ProfileField label={t('labels.fullName')} value={name} />
          <ProfileField label={t('labels.email')} value={email} />
          <ProfileField label={t('labels.role')} value={role} />
        </dl>
      </Card>

      {profile ? (
        <Card>
          <h2 className="m-0 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('profile.academic')}
          </h2>
          <dl className="flex flex-col gap-3">
            <ProfileField
              label={t('profile.academicNumber')}
              value={profile.academicNumber ?? '—'}
            />
            <ProfileField
              label={t('labels.department')}
              value={
                profile.department?.code && profile.department?.name
                  ? getDepartmentLabel(
                      { code: profile.department.code, name: profile.department.name },
                      lang
                    )
                  : (profile.department?.name ?? '—')
              }
            />
            <ProfileField
              label={t('profile.college')}
              value={profile.department?.college?.name ?? me.college?.name ?? '—'}
            />
            <ProfileField
              label={t('profile.studyLevel')}
              value={t('profile.studyLevelValue', {
                level:
                  profile.currentSemester != null
                    ? studyYearFromSemester(profile.currentSemester)
                    : '—',
              })}
            />
            <p className="m-0 mt-2">
              <Link
                to="/student/study-plan"
                className="text-sm font-semibold text-violet-600 hover:underline dark:text-violet-300"
              >
                {t('student.studyPlan')} →
              </Link>
            </p>
            <ProfileField
              label={t('labels.academicYear')}
              value={profile.academicYear ?? '—'}
            />
          </dl>
        </Card>
      ) : (
        <Alert variant="info">{t('profile.noStudentRecord')}</Alert>
      )}

      {tuition.data ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-semibold">{t('headings.studentTuition')}</h2>
              <p className="m-0 mt-1 text-sm text-zinc-500">
                {t('tuition.remaining')}: ${tuition.data.totalRemaining.toFixed(2)} / $
                {tuition.data.totalDue.toFixed(2)}
              </p>
            </div>
            <StatusBadge status={tuition.data.overallStatus} />
          </div>
          <Link
            to="/student/tuition"
            className="mt-4 inline-flex text-sm font-semibold text-violet-600 hover:underline"
          >
            {t('tuition.viewDetails')}
          </Link>
        </Card>
      ) : null}

      <TuitionNewsBanner
        items={
          (news.data?.items ?? []) as Array<{
            id: string;
            title: string;
            content: string;
            category?: string;
            enablePayNow?: boolean;
            createdAt: string;
          }>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="m-0 text-2xl font-bold text-violet-600 dark:text-violet-400">{courseCount}</p>
          <p className="m-0 mt-1 text-sm text-zinc-500">{t('profile.enrolledCourses')}</p>
        </Card>
        <Card className="text-center">
          <p className="m-0 text-2xl font-bold text-violet-600 dark:text-violet-400">{gradeCount}</p>
          <p className="m-0 mt-1 text-sm text-zinc-500">{t('profile.recordedGrades')}</p>
        </Card>
        <Card className="text-center">
          <p className="m-0 text-2xl font-bold text-violet-600 dark:text-violet-400">{gpa}</p>
          <p className="m-0 mt-1 text-sm text-zinc-500">{t('labels.gpa')}</p>
        </Card>
      </div>
    </section>
  );
}
