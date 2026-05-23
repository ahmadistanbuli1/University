import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { axiosInstance } from '../api/http.js';
import { useDepartmentsQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { useAppDispatch } from '../hooks/redux.js';
import i18n from '../i18n/config.js';
import { buildAcademicYearOptions } from '../lib/academic-options.js';
import {
  buildStudyYearOptions,
  getCollegeLabel,
  getDepartmentLabel,
  getMaxStudyYears,
  getStudyYearLabel,
} from '../lib/department-labels.js';
import { registerFormSchema, type RegisterFormValues } from '../lib/form-schemas.js';
import { defaultRouteForRole } from '../lib/defaultRouteForRole.js';
import { setCredentials } from '../store/authSlice.js';

type RegisterResponse = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
};

export function RegisterPage() {
  const { t, i18n: i18nInstance } = useTranslation('common');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: departments, isLoading, isError } = useDepartmentsQuery();
  const academicYears = useMemo(() => buildAcademicYearOptions(), []);
  const lang = i18nInstance.language;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      departmentId: '',
      academicNumber: '',
      currentSemester: 1,
      academicYear: academicYears[1] ?? academicYears[0] ?? '2025-2026',
    },
  });

  const departmentId = useWatch({ control, name: 'departmentId' });

  const selectedDepartment = useMemo(
    () => departments?.find((d) => d.id === departmentId),
    [departments, departmentId]
  );

  const studyYears = useMemo(
    () => buildStudyYearOptions(getMaxStudyYears(selectedDepartment?.code)),
    [selectedDepartment?.code]
  );

  const departmentGroups = useMemo(() => {
    if (!departments?.length) return [];
    const byCollege = new Map<string, typeof departments>();
    for (const d of departments) {
      const collegeName = getCollegeLabel(d.college?.name ?? t('registerCollegeUnknown'), lang);
      const list = byCollege.get(collegeName) ?? [];
      list.push(d);
      byCollege.set(collegeName, list);
    }
    return [...byCollege.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [departments, t, lang]);

  const groupInfo = useMemo(() => {
    if (!selectedDepartment) return null;
    const localized = t(`registerDeptInfo.${selectedDepartment.code}`, { defaultValue: '' });
    const text =
      (typeof localized === 'string' && localized.length > 0
        ? localized
        : selectedDepartment.description) ?? '';
    return text || null;
  }, [selectedDepartment, t]);

  const registerMut = useMutation({
    mutationFn: async (body: RegisterFormValues) => {
      const { data } = await axiosInstance.post<RegisterResponse>('/api/auth/register', body);
      return data;
    },
    onSuccess: (data: RegisterResponse) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      toast.success(i18n.t('registerToastSuccess', { ns: 'common' }));
      navigate(defaultRouteForRole(data.user.role), { replace: true });
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        const body = err.response?.data as { error?: string } | undefined;
        const code = body?.error;
        if (code === 'Academic number already registered') {
          toast.error(t('registerErrorAcademicNumber'));
          return;
        }
        if (code === 'Email already registered') {
          toast.error(t('registerErrorEmail'));
          return;
        }
        if (code === 'Invalid department') {
          toast.error(t('registerErrorDepartment'));
          return;
        }
      }
      toast.error(t('registerError'));
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError || !departments?.length) {
    return (
      <section className="mx-auto w-full max-w-md">
        <Alert variant="error">{t('registerStructureError')}</Alert>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-lg">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.18),transparent_45%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(192,132,252,0.2),transparent_50%)]"
        aria-hidden
      />
      <PageHeader title={t('registerTitle')} description={t('registerLead')} icon={UserPlus} />
      <Card className="shadow-md">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((vals) => registerMut.mutate(vals))}
        >
          <Field label={t('fullNameLabel')} error={errors.name?.message}>
            <Input autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
          </Field>
          <Field label={t('emailLabel')} error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="username"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field label={t('passwordLabel')} error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
          </Field>
          <Field label={t('registerAcademicNumberLabel')} error={errors.academicNumber?.message}>
            <Input
              placeholder={t('registerAcademicNumberPlaceholder')}
              autoComplete="off"
              aria-invalid={!!errors.academicNumber}
              {...register('academicNumber')}
            />
          </Field>

          <Field label={t('registerDepartmentLabel')} error={errors.departmentId?.message}>
            <Select aria-invalid={!!errors.departmentId} {...register('departmentId')}>
              <option value="">{t('registerDepartmentPlaceholder')}</option>
              {departmentGroups.map(([collegeName, depts]) => (
                <optgroup key={collegeName} label={collegeName}>
                  {depts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {getDepartmentLabel(d, lang)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('registerStudyLevelLabel')} error={errors.currentSemester?.message}>
              <Select
                aria-invalid={!!errors.currentSemester}
                {...register('currentSemester', { valueAsNumber: true })}
              >
                {studyYears.map((level) => (
                  <option key={level} value={(level - 1) * 2 + 1}>
                    {getStudyYearLabel(level, lang)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('registerAcademicYearLabel')} error={errors.academicYear?.message}>
              <Select aria-invalid={!!errors.academicYear} {...register('academicYear')}>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {selectedDepartment && groupInfo ? (
            <div
              className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-4 py-3 text-sm text-violet-950 dark:border-violet-500/20 dark:bg-violet-950/30 dark:text-violet-100"
              role="note"
            >
              <p className="font-medium text-violet-900 dark:text-violet-50">
                {getDepartmentLabel(selectedDepartment, lang)}
              </p>
              <p className="mt-1 text-violet-800/90 dark:text-violet-200/90">{groupInfo}</p>
            </div>
          ) : null}

          <Button type="submit" disabled={registerMut.isPending} size="lg" className="w-full">
            {registerMut.isPending ? t('registerSubmitting') : t('registerSubmit')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            {t('haveAccountLogin')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
