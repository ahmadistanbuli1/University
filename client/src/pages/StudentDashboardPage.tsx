import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { StudentTuitionPaySection } from '../components/StudentTuitionPaySection.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { cn } from '../lib/cn.js';

type StudentProfile = {
  academicNumber?: string;
  currentSemester?: number;
  academicYear?: string;
  department?: {
    name?: string;
    code?: string;
    college?: { id?: string; name?: string };
  };
};

type MeData = {
  name?: string;
  email?: string;
  role?: string;
  college?: { name?: string };
  studentProfile?: StudentProfile | null;
};

function ProfileStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5',
        className
      )}
    >
      <p className="m-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="m-0 mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

export function StudentDashboardPage() {
  const { t, i18n: i18nInstance } = useTranslation('nav');
  const lang = i18nInstance.language;
  const isRtl = i18nInstance.dir() === 'rtl';
  const { data, isLoading, isError } = useMeQuery();
  const enrollments = useMyEnrollmentsQuery();
  const results = useMyResultsQuery();
  const tuition = useTuitionSummaryQuery();
  const studentCollegeId = (data as MeData | undefined)?.studentProfile?.department?.college?.id;
  const news = useNewsListQuery(1, 50, { collegeId: studentCollegeId });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const me = data as MeData;
  const profile = me.studentProfile;
  const name = me.name ?? '—';
  const email = me.email ?? '—';
  const role = me.role ?? '—';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const courseCount = enrollments.data?.terms
    ? enrollments.data.terms.reduce((n, block) => n + block.courses.length, 0)
    : 0;
  const gradeCount = Array.isArray(results.data?.results) ? results.data.results.length : 0;
  const gpa = results.data?.gpa ?? '—';

  const studyYearLabel =
    profile?.currentSemester != null
      ? t('profile.studyLevelValue', { level: studyYearFromSemester(profile.currentSemester) })
      : '—';

  const departmentLabel =
    profile?.department?.code && profile?.department?.name
      ? getDepartmentLabel(
          { code: profile.department.code, name: profile.department.name },
          lang
        )
      : (profile?.department?.name ?? '—');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.studentProfile')} description={t('profile.lead')} />

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-violet-600/90 via-violet-600 to-indigo-700 px-6 py-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl font-black ring-2 ring-white/30 backdrop-blur-sm"
              aria-hidden
            >
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-xl font-bold tracking-tight">{name}</h2>
              <p className="m-0 mt-1 text-sm text-violet-100">{email}</p>
              <p className="m-0 mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
                {role}
              </p>
            </div>
          </div>
        </div>

        {profile ? (
          <div className="flex flex-col gap-4 p-6">
            <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              {t('profile.academic')}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ProfileStat label={t('profile.academicNumber')} value={profile.academicNumber ?? '—'} />
              <ProfileStat label={t('labels.department')} value={departmentLabel} />
              <ProfileStat
                label={t('profile.college')}
                value={profile.department?.college?.name ?? me.college?.name ?? '—'}
              />
              <ProfileStat label={t('profile.studyLevel')} value={studyYearLabel} />
              <ProfileStat label={t('labels.academicYear')} value={profile.academicYear ?? '—'} />
            </div>
            <Link
              to="/student/study-plan"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-200 dark:hover:bg-violet-500/25"
            >
              {t('student.studyPlan')}
              {isRtl ? (
                <ChevronLeft className="size-4 shrink-0" aria-hidden />
              ) : (
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              )}
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <Alert variant="info">{t('profile.noStudentRecord')}</Alert>
          </div>
        )}
      </Card>

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
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:underline dark:text-violet-300"
          >
            {t('tuition.viewDetails')}
            {isRtl ? (
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            )}
          </Link>
        </Card>
      ) : null}

      <StudentTuitionPaySection
        newsItems={
          (news.data?.items ?? []) as Array<{
            title: string;
            content: string;
            category?: string;
            enablePayNow?: boolean;
            tuitionSemesterKey?: string | null;
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
