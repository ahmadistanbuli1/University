import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { axiosInstance } from '../api/http.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { useAppDispatch } from '../hooks/redux.js';
import i18n from '../i18n/config.js';
import { loginFormSchema } from '../lib/form-schemas.js';
import { defaultRouteForRole } from '../lib/defaultRouteForRole.js';
import { setCredentials } from '../store/authSlice.js';

type LoginResponse = {
  user: { id: string; name: string; email: string; role: string };
};

type LoginForm = { email: string; password: string };

export function LoginPage() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const login = useMutation({
    mutationFn: async (body: LoginForm) => {
      const { data } = await axiosInstance.post<LoginResponse>('/api/auth/login', body);
      return data;
    },
    onSuccess: (data: LoginResponse) => {
      dispatch(setCredentials({ user: data.user }));
      toast.success(i18n.t('loginToastSuccess', { ns: 'common' }));
      navigate(defaultRouteForRole(data.user.role), { replace: true });
    },
    onError: () => {
      toast.error(i18n.t('loginError', { ns: 'common' }));
    },
  });

  return (
    <section className="relative mx-auto w-full max-w-md mt-9">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.18),transparent_45%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(192,132,252,0.2),transparent_50%)]"
        aria-hidden
      />
      <PageHeader title={t('loginTitle')} description={t('loginLead')} icon={KeyRound} />
      <Card className="shadow-md">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit((vals) => login.mutate(vals))}>
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
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
          </Field>
          <Button type="submit" disabled={login.isPending} size="lg" className="w-full">
            {login.isPending ? t('loginSubmitting') : t('loginSubmit')}
          </Button>
        </form>
      </Card>
    </section>
  );
}
