import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
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
import { facultyGradeFormSchema, type FacultyGradeFormValues } from '../lib/form-schemas.js';

type Fc = {
  id: string;
  semester: string;
  academicYear: string;
  course?: { name?: string; code?: string };
};

export function FacultyGradesPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useMeQuery();
  const post = usePostResultMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyGradeFormValues>({
    resolver: zodResolver(facultyGradeFormSchema),
    defaultValues: {
      facultyCourseId: '',
      academicNumber: '',
      practicalScore: 0,
      theoryScore: 0,
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const sections = (Array.isArray(data.facultyCourses) ? data.facultyCourses : []) as Fc[];

  return (
    <section>
      <PageHeader title={t('headings.facultyGrades')} description={t('messages.facultyGradesLead')} />
      <Card className="max-w-lg">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            post.mutate(
              {
                facultyCourseId: vals.facultyCourseId,
                academicNumber: vals.academicNumber.trim(),
                practicalScore: Number(vals.practicalScore),
                theoryScore: Number(vals.theoryScore),
              },
              {
                onSuccess: () => toast.success(t('messages.gradePosted')),
                onError: (err) => {
                  const msg = isAxiosError(err)
                    ? (err.response?.data as { error?: string })?.error
                    : undefined;
                  toast.error(msg ?? t('messages.loadError'));
                },
              }
            );
          })}
        >
          <Field label={t('labels.courseName')} error={errors.facultyCourseId?.message}>
            <Select aria-invalid={!!errors.facultyCourseId} {...register('facultyCourseId')}>
              <option value="">{t('labels.selectCourse')}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.course?.name ?? s.id}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t('profile.academicNumber')} error={errors.academicNumber?.message}>
            <Input
              placeholder={t('faculty.academicNumberPlaceholder')}
              autoComplete="off"
              aria-invalid={!!errors.academicNumber}
              {...register('academicNumber')}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t('studyPlan.practical', { max: 40 })}
              error={errors.practicalScore?.message ? String(errors.practicalScore.message) : undefined}
            >
              <Input
                type="number"
                min={0}
                max={40}
                step={0.5}
                aria-invalid={!!errors.practicalScore}
                {...register('practicalScore', { valueAsNumber: true })}
              />
            </Field>
            <Field
              label={t('studyPlan.theory', { max: 60 })}
              error={errors.theoryScore?.message ? String(errors.theoryScore.message) : undefined}
            >
              <Input
                type="number"
                min={0}
                max={60}
                step={0.5}
                aria-invalid={!!errors.theoryScore}
                {...register('theoryScore', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">{t('faculty.gradeTermHint')}</p>

          <Button type="submit" disabled={post.isPending || sections.length === 0}>
            {t('labels.postResult')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
