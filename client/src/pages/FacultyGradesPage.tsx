import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMeQuery, usePostResultMutation } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';

type Fc = { id: string; semester: string; academicYear: string; course?: { name?: string } };

export function FacultyGradesPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMeQuery();
  const post = usePostResultMutation();
  const [facultyCourseId, setFacultyCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('50');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [attemptNumber, setAttemptNumber] = useState('1');

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const sections = (Array.isArray(data.facultyCourses) ? data.facultyCourses : []) as Fc[];

  return (
    <section>
      <PageHeader title={t('headings.facultyGrades')} />
      <Card className="max-w-md">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fc = sections.find((s) => s.id === facultyCourseId);
            post.mutate(
              {
                studentId,
                facultyCourseId,
                score: Number(score),
                semester: semester || fc?.semester || '',
                academicYear: academicYear || fc?.academicYear || '',
                attemptNumber: attemptNumber ? Number(attemptNumber) : undefined,
              },
              {
                onSuccess: () => toast.success(t('messages.gradePosted')),
                onError: () => toast.error(t('messages.loadError')),
              }
            );
          }}
        >
          <Field label={t('labels.facultyCourseId')}>
            <Select value={facultyCourseId} onChange={(e) => setFacultyCourseId(e.target.value)} required>
              <option value="">—</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.course?.name ?? s.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('labels.studentId')}>
            <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          </Field>
          <Field label={t('labels.score')}>
            <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} required />
          </Field>
          <Field label={t('labels.semester')}>
            <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Fall" />
          </Field>
          <Field label={t('labels.academicYear')}>
            <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2025-2026" />
          </Field>
          <Field label={t('labels.attemptNumber')}>
            <Input type="number" min={1} value={attemptNumber} onChange={(e) => setAttemptNumber(e.target.value)} />
          </Field>
          <Button type="submit" disabled={post.isPending || sections.length === 0}>
            {t('labels.postResult')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
