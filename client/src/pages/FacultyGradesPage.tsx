import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useGradeSubmissionWorkspaceQuery,
  useMeQuery,
  useSaveGradeDraftMutation,
  useSubmitGradeSubmissionMutation,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { parseCourseStudyMeta } from '../lib/course-code.js';
import { getDepartmentLabel, getStudyYearLabel } from '../lib/department-labels.js';
import { isPracticalPass, PRACTICAL_PASS_MIN } from '../lib/grade-rules.js';
import { gradeSubmissionStatusLabel } from '../lib/grade-submission-status.js';

type Fc = {
  id: string;
  semester: string;
  academicYear: string;
  course?: {
    id?: string;
    name?: string;
    code?: string;
    department?: { name?: string; code?: string };
  };
};

type RosterRow = {
  studentId: string;
  academicNumber: string;
  name: string;
  practicalScore: number | null;
  theoryScore: number | null;
};

type Workspace = {
  facultyCourse: Fc;
  gradesOpen: boolean;
  phase: 'PRACTICAL' | 'THEORY';
  practicalPublished: boolean;
  canEditPractical: boolean;
  canEditTheory: boolean;
  submission: {
    id: string;
    status: string;
    phase: 'PRACTICAL' | 'THEORY';
    rejectionReason?: string | null;
    practicalPublishedAt?: string | null;
  } | null;
  roster: RosterRow[];
};

function facultyCourseLabel(fc: Fc, lang: string): string {
  const courseName = fc.course?.name ?? '—';
  const dept =
    fc.course?.department?.code && fc.course?.department?.name
      ? getDepartmentLabel(
          { code: fc.course.department.code, name: fc.course.department.name },
          lang
        )
      : (fc.course?.department?.name ?? '—');
  const meta = parseCourseStudyMeta(fc.course?.code ?? '');
  const yearPart = meta ? getStudyYearLabel(meta.studyYear, lang) : '';
  return [courseName, dept, yearPart].filter(Boolean).join(' - ');
}

export function FacultyGradesPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const { data: me, isLoading: meLoading, isError: meError } = useMeQuery();
  const [facultyCourseId, setFacultyCourseId] = useState('');
  const [rows, setRows] = useState<RosterRow[]>([]);

  const sections = useMemo(() => {
    const all = Array.isArray((me as { facultyCourses?: Fc[] })?.facultyCourses)
      ? (me as { facultyCourses: Fc[] }).facultyCourses
      : [];
    return all
      .filter((s) => parseCourseStudyMeta(s.course?.code ?? '')?.term === 'SECOND')
      .sort((a, b) => facultyCourseLabel(a, lang).localeCompare(facultyCourseLabel(b, lang), lang));
  }, [me, lang]);

  const workspace = useGradeSubmissionWorkspaceQuery(facultyCourseId || null);
  const saveDraft = useSaveGradeDraftMutation();
  const submitGrades = useSubmitGradeSubmissionMutation();

  const ws = workspace.data as Workspace | undefined;
  const phase = ws?.phase ?? ws?.submission?.phase ?? 'PRACTICAL';
  const isTheoryPhase = phase === 'THEORY';

  useEffect(() => {
    if (!facultyCourseId && sections.length > 0) {
      setFacultyCourseId(sections[0].id);
    }
  }, [facultyCourseId, sections]);

  useEffect(() => {
    if (ws?.roster) {
      setRows(
        ws.roster.map((r) => ({
          ...r,
          practicalScore: r.practicalScore ?? (isTheoryPhase ? r.practicalScore : 0),
          theoryScore: r.theoryScore ?? null,
        }))
      );
    }
  }, [ws?.roster, ws?.submission?.status, ws?.submission?.id, ws?.submission?.phase, isTheoryPhase]);

  if (meLoading) return <LoadingState />;
  if (meError || !me) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const selected = sections.find((s) => s.id === facultyCourseId);
  const canEditPractical = ws?.canEditPractical ?? false;
  const canEditTheory = ws?.canEditTheory ?? false;
  const status = ws?.submission?.status;
  const canSave = isTheoryPhase ? canEditTheory : canEditPractical;

  function buildDraftBody() {
    if (isTheoryPhase) {
      return {
        lines: rows
          .filter((r) => r.theoryScore != null)
          .map((r) => ({
            studentId: r.studentId,
            theoryScore: Number(r.theoryScore),
          })),
      };
    }
    return {
      lines: rows
        .filter((r) => r.practicalScore != null)
        .map((r) => ({
          studentId: r.studentId,
          practicalScore: Number(r.practicalScore),
        })),
    };
  }

  function handleSaveDraft() {
    const body = buildDraftBody();
    if (body.lines.length === 0) {
      toast.error(t('gradeSubmissions.enterAtLeastOne'));
      return;
    }
    saveDraft.mutate(
      { facultyCourseId, body },
      {
        onSuccess: () => toast.success(t('gradeSubmissions.draftSaved')),
        onError: () => toast.error(t('messages.loadError')),
      }
    );
  }

  function handleSubmit() {
    const body = buildDraftBody();
    if (body.lines.length === 0) {
      toast.error(t('gradeSubmissions.enterAtLeastOne'));
      return;
    }
    saveDraft.mutate(
      { facultyCourseId, body },
      {
        onSuccess: () => {
          submitGrades.mutate(facultyCourseId, {
            onSuccess: () =>
              toast.success(
                isTheoryPhase
                  ? t('gradeSubmissions.submittedTheory')
                  : t('gradeSubmissions.submittedPractical')
              ),
            onError: () => toast.error(t('messages.loadError')),
          });
        },
        onError: () => toast.error(t('messages.loadError')),
      }
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.facultyGrades')} description={t('gradeSubmissions.facultyLead')} />

      <Alert variant="info">{t('gradeSubmissions.rulesHint')}</Alert>

      <Card className="flex flex-wrap gap-4 p-4">
        <Field label={t('labels.courseName')} className="min-w-[20rem] flex-1">
          <Select
            value={facultyCourseId}
            onChange={(e) => setFacultyCourseId(e.target.value)}
          >
            <option value="">{t('labels.selectCourse')}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {facultyCourseLabel(s, lang)}
              </option>
            ))}
          </Select>
        </Field>
        {selected ? (
          <div className="flex flex-col justify-end text-sm text-zinc-600 dark:text-zinc-300">
            <span className="font-mono text-xs text-zinc-500">{selected.course?.code}</span>
            <span>
              {t('gradeSubmissions.phaseLabel')}:{' '}
              {isTheoryPhase
                ? t('gradeSubmissions.phaseTheory')
                : t('gradeSubmissions.phasePractical')}
            </span>
          </div>
        ) : null}
        {status ? (
          <div className="flex flex-col justify-end gap-1">
            <StatusBadge status={status} />
            <span className="text-xs text-zinc-500">
              {gradeSubmissionStatusLabel(status, t)}
            </span>
          </div>
        ) : null}
      </Card>

      {ws?.practicalPublished && isTheoryPhase ? (
        <Alert variant="info">{t('gradeSubmissions.practicalPublishedEnterTheory')}</Alert>
      ) : null}

      {ws?.submission?.status === 'REJECTED' && ws.submission.rejectionReason ? (
        <Alert variant="error">
          <strong className="block text-sm font-bold">{t('gradeSubmissions.rejectedTitle')}</strong>
          {ws.submission.rejectionReason}
        </Alert>
      ) : null}

      {status === 'SUBMITTED' ? (
        <Alert variant="info">{t('gradeSubmissions.awaitingExamOfficer')}</Alert>
      ) : null}

      {status === 'PUBLISHED' ? (
        <Alert variant="info">{t('gradeSubmissions.publishedHint')}</Alert>
      ) : null}

      {!facultyCourseId ? (
        <Alert variant="info">{t('gradeSubmissions.selectCourseOnly')}</Alert>
      ) : workspace.isLoading ? (
        <LoadingState />
      ) : workspace.isError ? (
        <Alert variant="error">{t('messages.loadError')}</Alert>
      ) : !ws?.gradesOpen ? (
        <Alert variant="info">{t('gradeSubmissions.firstTermClosed')}</Alert>
      ) : rows.length === 0 ? (
        <Alert variant="info">{t('messages.noStudentsInSection')}</Alert>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-start dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">{t('labels.fullName')}</th>
                <th className="px-4 py-3 font-semibold">{t('profile.academicNumber')}</th>
                <th className="px-4 py-3 font-semibold">{t('studyPlan.practical', { max: 40 })}</th>
                {isTheoryPhase ? (
                  <th className="px-4 py-3 font-semibold">{t('studyPlan.theory', { max: 60 })}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.studentId}
                  className="border-b border-zinc-100 dark:border-white/5"
                >
                  <td className="px-4 py-2 text-zinc-500">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{row.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{row.academicNumber}</td>
                  <td className="px-4 py-2">
                    {isTheoryPhase ? (
                      <span
                        className={
                          row.practicalScore != null && !isPracticalPass(row.practicalScore)
                            ? 'font-medium text-amber-600'
                            : ''
                        }
                      >
                        {row.practicalScore ?? '—'}
                        {row.practicalScore != null && row.practicalScore < PRACTICAL_PASS_MIN
                          ? ` (${t('gradeSubmissions.belowPracticalPass')})`
                          : null}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min={0}
                        max={40}
                        step={0.5}
                        disabled={!canEditPractical}
                        className="w-24"
                        value={row.practicalScore ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? 0 : Number(e.target.value);
                          setRows((prev) =>
                            prev.map((r) =>
                              r.studentId === row.studentId ? { ...r, practicalScore: v } : r
                            )
                          );
                        }}
                      />
                    )}
                  </td>
                  {isTheoryPhase ? (
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={60}
                        step={0.5}
                        disabled={!canEditTheory}
                        className="w-24"
                        value={row.theoryScore ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? null : Number(e.target.value);
                          setRows((prev) =>
                            prev.map((r) =>
                              r.studentId === row.studentId ? { ...r, theoryScore: v } : r
                            )
                          );
                        }}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {canSave && rows.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={saveDraft.isPending || submitGrades.isPending}
            onClick={handleSaveDraft}
          >
            {t('gradeSubmissions.saveDraft')}
          </Button>
          <Button
            type="button"
            disabled={saveDraft.isPending || submitGrades.isPending}
            onClick={handleSubmit}
          >
            {isTheoryPhase
              ? t('gradeSubmissions.submitTheory')
              : t('gradeSubmissions.submitPractical')}
          </Button>
        </div>
      ) : null}

      {isTheoryPhase && !canEditTheory && !ws?.practicalPublished ? (
        <Alert variant="info">{t('gradeSubmissions.theoryLockedUntilPractical')}</Alert>
      ) : null}
    </section>
  );
}
