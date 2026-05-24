import { ClipboardList, FileBadge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useExamOfficerTranscriptsQuery,
  useGradeSubmissionQueueQuery,
} from '../api/hooks.js';
import { Card } from '../components/ui/Card.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatCard } from '../components/ui/StatCard.js';

export function ExamOfficerDashboardPage() {
  const { t } = useTranslation('nav');
  const transcripts = useExamOfficerTranscriptsQuery();
  const grades = useGradeSubmissionQueueQuery();

  if (transcripts.isLoading || grades.isLoading) return <LoadingState />;

  const transcriptQueue = (transcripts.data ?? []) as unknown[];
  const gradeQueue = (grades.data ?? []) as unknown[];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.examOfficerDashboard')}
        description={t('examOfficer.dashboardLead')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title={t('examOfficer.pendingGeneration')}
          value={transcriptQueue.length}
          icon={FileBadge}
        />
        <StatCard
          title={t('examOfficer.pendingGrades')}
          value={gradeQueue.length}
          icon={ClipboardList}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">
            {t('examOfficer.dashboardHint')}
          </p>
          <Link
            to="/exam-officer/transcripts"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 px-4 py-2 text-sm font-semibold text-white shadow-md"
          >
            {t('examOfficer.openTranscripts')}
          </Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">
            {t('gradeSubmissions.examOfficerLead')}
          </p>
          <Link
            to="/exam-officer/grades"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 px-4 py-2 text-sm font-semibold text-white shadow-md"
          >
            {t('examOfficer.openGrades')}
          </Link>
        </Card>
      </div>
    </section>
  );
}
