import { useMutation } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { useAppDispatch } from '../hooks/redux.js';
import i18n from '../i18n/config.js';
import { defaultRouteForRole } from '../lib/defaultRouteForRole.js';
import { setCredentials } from '../store/authSlice.js';

type RegisterResponse = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
};

export function RegisterPage() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = useMutation({
    mutationFn: async () => {
      const { data } = await http.post<RegisterResponse>('/api/auth/register', { name, email, password });
      return data;
    },
    onSuccess: (data: RegisterResponse) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      toast.success(i18n.t('registerToastSuccess', { ns: 'common' }));
      navigate(defaultRouteForRole(data.user.role), { replace: true });
    },
    onError: () => {
      toast.error(i18n.t('registerError', { ns: 'common' }));
    },
  });

  return (
    <section className="relative mx-auto w-full max-w-md">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.2),transparent_45%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.25),transparent_50%)]"
        aria-hidden
      />
      <PageHeader title={t('registerTitle')} description={t('registerLead')} icon={UserPlus} />
      <Card className="shadow-md">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            register.mutate();
          }}
        >
          <Field label={t('fullNameLabel')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </Field>
          <Field label={t('emailLabel')}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </Field>
          <Field label={t('passwordLabel')}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </Field>
          <Button type="submit" disabled={register.isPending} size="lg" className="w-full">
            {register.isPending ? t('registerSubmitting') : t('registerSubmit')}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/login')}>
            {t('haveAccountLogin')}
          </Button>
        </form>
      </Card>
    </section>
  );
}

