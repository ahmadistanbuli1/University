import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { axiosInstance } from '../api/http.js';
import {
  useGradeSubmissionDetailQuery,
  useGradeSubmissionQueueQuery,
  usePublishGradeSubmissionMutation,
  useRejectGradeSubmissionMutation,
  useUpdateGradeSubmissionLinesMutation,
} from '../api/hooks.js';
import { MotionDialog } from '../components/motion/MotionDialog.js';
import { ActionStack } from '../components/ui/ActionGroup.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';
import { excelExportButtonClass, exportGradeSubmissionToExcel } from '../lib/excel-export.js';
import { gradeSubmissionStatusLabel } from '../lib/grade-submission-status.js';
import { formatStudyTermLabel } from '../lib/study-term.js';

type QueueItem = {
  id: string;
  status: string;
  phase?: 'PRACTICAL' | 'THEORY';
  submittedAt?: string | null;
  facultyCourse?: {
    semester: string;
    academicYear: string;
    course?: { name?: string; code?: string };
    faculty?: { name?: string };
  };
};

type Line = {
  id: string;
  studentId: string;
  practicalScore: number | string;
  theoryScore: number | string | null;
  student?: { user?: { name?: string }; academicNumber?: string };
};

type Detail = QueueItem & { lines: Line[]; rejectionReason?: string | null };

function phaseLabel(phase: 'PRACTICAL' | 'THEORY' | undefined, t: (k: string) => string) {
  return phase === 'THEORY' ? t('gradeSubmissions.phaseTheory') : t('gradeSubmissions.phasePractical');
}

export function ExamOfficerGradesPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const [exportingId, setExportingId] = useState<string | null>(null);
  const { data: queue, isLoading, isError } = useGradeSubmissionQueueQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useGradeSubmissionDetailQuery(selectedId);
  const publish = usePublishGradeSubmissionMutation();
  const reject = useRejectGradeSubmissionMutation();
  const updateLines = useUpdateGradeSubmissionLinesMutation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editLines, setEditLines] = useState<Line[]>([]);

  const items = (queue ?? []) as QueueItem[];
  const d = detail.data as Detail | undefined;
  const isTheoryPhase = d?.phase === 'THEORY';

  useEffect(() => {
    if (selectedId && d?.lines?.length) {
      setEditLines(
        d.lines.map((l) => ({
          ...l,
          practicalScore: Number(l.practicalScore),
          theoryScore: l.theoryScore != null ? Number(l.theoryScore) : null,
        }))
      );
    }
  }, [selectedId, d?.id, d?.lines, d?.phase]);

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  function openDetail(id: string) {
    setSelectedId(id);
  }

  async function exportSubmission(
    item: QueueItem,
    lines: Line[],
    phase: 'PRACTICAL' | 'THEORY' | undefined
  ) {
    if (!lines.length) {
      toast.error(t('excel.noGradesToExport'));
      return;
    }
    setExportingId(item.id);
    try {
      const isTheory = phase === 'THEORY';
      const courseName = item.facultyCourse?.course?.name ?? '—';
      const facultyName = item.facultyCourse?.faculty?.name ?? '—';
      const term = formatStudyTermLabel(
        item.facultyCourse?.semester ?? '',
        t,
        item.facultyCourse?.course?.code
      );
      const termLine = `${term} · ${item.facultyCourse?.academicYear ?? ''}`;
      await exportGradeSubmissionToExcel(
        lines.map((l) => ({
          academicNumber: l.student?.academicNumber ?? '—',
          fullName: l.student?.user?.name ?? '—',
          practicalScore: Number(l.practicalScore),
          theoryScore: l.theoryScore != null ? Number(l.theoryScore) : null,
        })),
        {
          lang,
          isTheoryPhase: isTheory,
          sheetTitle: t('excel.gradesSheetTitle'),
          subtitle: `${courseName} — ${facultyName} · ${termLine}`,
          phaseLabel: phaseLabel(phase, t),
          headers: {
            index: '#',
            academicNumber: t('profile.academicNumber'),
            fullName: t('labels.fullName'),
            practical: t('studyPlan.practical', { max: 40 }),
            theory: t('studyPlan.theory', { max: 60 }),
            total: t('studyPlan.total'),
          },
        }
      );
      toast.success(t('excel.exportSuccess'));
    } catch {
      toast.error(t('messages.loadError'));
    } finally {
      setExportingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.examOfficerGrades')}
        description={t('gradeSubmissions.examOfficerLead')}
      />

      {items.length === 0 ? (
        <Alert variant="info">{t('gradeSubmissions.examOfficerEmpty')}</Alert>
      ) : (
        <DataTable<QueueItem>
          rowKey={(r) => r.id}
          emptyMessage="—"
          columns={[
            {
              key: 'course',
              header: t('labels.courseName'),
              render: (r) => r.facultyCourse?.course?.name ?? '—',
            },
            {
              key: 'faculty',
              header: t('labels.facultyMember'),
              render: (r) => r.facultyCourse?.faculty?.name ?? '—',
            },
            {
              key: 'phase',
              header: t('gradeSubmissions.phaseLabel'),
              render: (r) => phaseLabel(r.phase, t),
            },
            {
              key: 'term',
              header: t('labels.semester'),
              render: (r) => {
                const termLabel = formatStudyTermLabel(
                  r.facultyCourse?.semester ?? '',
                  t,
                  r.facultyCourse?.course?.code
                );
                return `${termLabel} · ${r.facultyCourse?.academicYear ?? ''}`;
              },
            },
            {
              key: 'at',
              header: t('labels.submittedAt'),
              render: (r) =>
                r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—',
            },
            {
              key: 'act',
              header: t('labels.action'),
              render: (r) => (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => openDetail(r.id)}>
                    {t('gradeSubmissions.review')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className={excelExportButtonClass}
                    disabled={exportingId === r.id}
                    onClick={() => {
                      void (async () => {
                        try {
                          const { data } = await axiosInstance.get<Detail>(
                            `/api/grade-submissions/${r.id}`
                          );
                          await exportSubmission(r, data.lines ?? [], data.phase);
                        } catch {
                          toast.error(t('messages.loadError'));
                        }
                      })();
                    }}
                    title={t('excel.exportGrades')}
                    aria-label={t('excel.exportGrades')}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={items}
        />
      )}

      <MotionDialog
        open={selectedId != null}
        onClose={() => {
          setSelectedId(null);
          setEditLines([]);
          setRejectOpen(false);
          setRejectReason('');
        }}
        title={t('gradeSubmissions.reviewTitle')}
        className="max-w-4xl"
      >
        {detail.isLoading ? (
          <LoadingState />
        ) : !d ? (
          <Alert variant="error">{t('messages.loadError')}</Alert>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={d.status} />
                <span>{gradeSubmissionStatusLabel(d.status, t)}</span>
                <span className="text-zinc-500">
                  {d.facultyCourse?.course?.name} — {d.facultyCourse?.faculty?.name} ·{' '}
                  {phaseLabel(d.phase, t)}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={exportingId === d.id || editLines.length === 0}
                className={`inline-flex items-center gap-2 ${excelExportButtonClass}`}
                onClick={() => void exportSubmission(d, editLines, d.phase)}
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden />
                {exportingId === d.id ? t('excel.exporting') : t('excel.exportGrades')}
              </Button>
            </div>

            {editLines.length ? (
              <Card className="overflow-x-auto p-0">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/5">
                      <th className="px-3 py-2 text-start">{t('labels.fullName')}</th>
                      <th className="px-3 py-2 text-start">{t('profile.academicNumber')}</th>
                      <th className="px-3 py-2">{t('studyPlan.practical', { max: 40 })}</th>
                      {isTheoryPhase ? (
                        <th className="px-3 py-2">{t('studyPlan.theory', { max: 60 })}</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {editLines.map((line) => (
                      <tr key={line.studentId} className="border-b border-zinc-100 dark:border-white/5">
                        <td className="px-3 py-2">{line.student?.user?.name ?? '—'}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {line.student?.academicNumber ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          {isTheoryPhase ? (
                            Number(line.practicalScore)
                          ) : (
                            <Input
                              type="number"
                              min={0}
                              max={40}
                              step={0.5}
                              className="w-20"
                              value={Number(line.practicalScore)}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setEditLines((prev) =>
                                  prev.map((l) =>
                                    l.studentId === line.studentId
                                      ? { ...l, practicalScore: v }
                                      : l
                                  )
                                );
                              }}
                            />
                          )}
                        </td>
                        {isTheoryPhase ? (
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              max={60}
                              step={0.5}
                              className="w-20"
                              value={line.theoryScore ?? ''}
                              onChange={(e) => {
                                const v = e.target.value === '' ? null : Number(e.target.value);
                                setEditLines((prev) =>
                                  prev.map((l) =>
                                    l.studentId === line.studentId
                                      ? { ...l, theoryScore: v }
                                      : l
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
            ) : null}

            <ActionStack>
              <Button
                type="button"
                variant="secondary"
                disabled={updateLines.isPending || editLines.length === 0}
                onClick={() => {
                  const body = isTheoryPhase
                    ? {
                        lines: editLines
                          .filter((l) => l.theoryScore != null)
                          .map((l) => ({
                            studentId: l.studentId,
                            theoryScore: Number(l.theoryScore),
                          })),
                      }
                    : {
                        lines: editLines.map((l) => ({
                          studentId: l.studentId,
                          practicalScore: Number(l.practicalScore),
                        })),
                      };
                  updateLines.mutate(
                    {
                      id: d.id,
                      body,
                    },
                    {
                      onSuccess: () => toast.success(t('gradeSubmissions.linesUpdated')),
                      onError: () => toast.error(t('messages.loadError')),
                    }
                  );
                }}
              >
                {t('gradeSubmissions.saveChanges')}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={publish.isPending}
                onClick={() => {
                  publish.mutate(d.id, {
                    onSuccess: () => {
                      toast.success(
                        isTheoryPhase
                          ? t('gradeSubmissions.published')
                          : t('gradeSubmissions.practicalPublished')
                      );
                      setSelectedId(null);
                    },
                    onError: () => toast.error(t('messages.loadError')),
                  });
                }}
              >
                {isTheoryPhase
                  ? t('gradeSubmissions.publishToStudents')
                  : t('gradeSubmissions.publishPractical')}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setRejectOpen(true)}>
                {t('gradeSubmissions.reject')}
              </Button>
            </ActionStack>

            {rejectOpen ? (
              <div className="border-t border-zinc-200 pt-4 dark:border-white/10">
                <Textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('gradeSubmissions.rejectPlaceholder')}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setRejectOpen(false)}>
                    {t('labels.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={reject.isPending || rejectReason.trim().length < 3}
                    onClick={() => {
                      reject.mutate(
                        { id: d.id, rejectionReason: rejectReason.trim() },
                        {
                          onSuccess: () => {
                            toast.success(t('gradeSubmissions.rejected'));
                            setSelectedId(null);
                            setRejectOpen(false);
                          },
                          onError: () => toast.error(t('messages.loadError')),
                        }
                      );
                    }}
                  >
                    {t('gradeSubmissions.confirmReject')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </MotionDialog>
    </section>
  );
}
