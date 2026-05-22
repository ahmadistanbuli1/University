import { zodResolver } from '@hookform/resolvers/zod';

import { useEffect } from 'react';

import { useForm, useWatch } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import { toast } from 'sonner';

import { isAxiosError } from 'axios';

import { useMeQuery, usePostResultMutation, useSectionRosterQuery } from '../api/hooks.js';

import { Alert } from '../components/ui/Alert.js';

import { Button } from '../components/ui/Button.js';

import { Card } from '../components/ui/Card.js';

import { Field } from '../components/ui/Field.js';

import { Input } from '../components/ui/Input.js';

import { LoadingState } from '../components/ui/LoadingState.js';

import { PageHeader } from '../components/ui/PageHeader.js';

import { Select } from '../components/ui/Select.js';

import { facultyGradeFormSchema, type FacultyGradeFormValues } from '../lib/form-schemas.js';



type Fc = { id: string; semester: string; academicYear: string; course?: { name?: string } };



export function FacultyGradesPage() {

  const { t } = useTranslation('nav');

  const { data, isLoading, isError } = useMeQuery();

  const post = usePostResultMutation();



  const {

    register,

    handleSubmit,

    control,

    setValue,

    formState: { errors },

  } = useForm<FacultyGradeFormValues>({

    resolver: zodResolver(facultyGradeFormSchema),

    defaultValues: {

      facultyCourseId: '',

      studentId: '',

      score: 50,

      semester: '',

      academicYear: '',

      attemptNumber: '1',

    },

  });



  const facultyCourseId = useWatch({ control, name: 'facultyCourseId' });

  const roster = useSectionRosterQuery(facultyCourseId || null);



  useEffect(() => {

    setValue('studentId', '');

  }, [facultyCourseId, setValue]);



  if (isLoading) return <LoadingState />;

  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;



  const sections = (Array.isArray(data.facultyCourses) ? data.facultyCourses : []) as Fc[];

  const students = roster.data ?? [];



  return (

    <section>

      <PageHeader title={t('headings.facultyGrades')} description={t('messages.facultyGradesLead')} />

      <Card className="max-w-lg">

        <form

          className="flex flex-col gap-3"

          onSubmit={handleSubmit((vals) => {

            const fc = sections.find((s) => s.id === vals.facultyCourseId);

            const attemptNum = vals.attemptNumber?.trim() ? Number(vals.attemptNumber) : undefined;

            post.mutate(

              {

                studentId: vals.studentId,

                facultyCourseId: vals.facultyCourseId,

                score: Number(vals.score),

                semester: vals.semester?.trim() || fc?.semester || '',

                academicYear: vals.academicYear?.trim() || fc?.academicYear || '',

                attemptNumber: attemptNum && !Number.isNaN(attemptNum) ? attemptNum : undefined,

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

          <Field label={t('labels.courseSection')} error={errors.facultyCourseId?.message}>

            <Select aria-invalid={!!errors.facultyCourseId} {...register('facultyCourseId')}>

              <option value="">{t('labels.selectSection')}</option>

              {sections.map((s) => (

                <option key={s.id} value={s.id}>

                  {s.course?.name ?? s.id} ({s.semester} · {s.academicYear})

                </option>

              ))}

            </Select>

          </Field>



          <Field label={t('labels.selectStudent')} error={errors.studentId?.message}>

            <Select

              aria-invalid={!!errors.studentId}

              disabled={!facultyCourseId || roster.isLoading}

              {...register('studentId')}

            >

              <option value="">

                {roster.isLoading

                  ? t('loading')

                  : students.length === 0

                    ? t('messages.noStudentsInSection')

                    : t('labels.selectStudent')}

              </option>

              {students.map((s) => (

                <option key={s.studentId} value={s.studentId}>

                  {s.academicNumber} — {s.name} ({s.department})

                </option>

              ))}

            </Select>

          </Field>



          <Field label={t('labels.score')} error={errors.score?.message ? String(errors.score.message) : undefined}>

            <Input type="number" min={0} max={100} aria-invalid={!!errors.score} {...register('score', { valueAsNumber: true })} />

          </Field>

          <Field label={t('labels.semester')} error={errors.semester?.message}>

            <Input placeholder="Fall 2025" {...register('semester')} />

          </Field>

          <Field label={t('labels.academicYear')} error={errors.academicYear?.message}>

            <Input placeholder="2025-2026" {...register('academicYear')} />

          </Field>

          <Field label={t('labels.attemptNumber')} error={errors.attemptNumber?.message}>

            <Input type="number" min={1} {...register('attemptNumber')} />

          </Field>

          <Button type="submit" disabled={post.isPending || sections.length === 0}>

            {t('labels.postResult')}

          </Button>

        </form>

      </Card>

    </section>

  );

}

