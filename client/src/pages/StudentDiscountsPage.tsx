import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useMyDiscountsQuery, useSubmitDiscountMutation } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';
const schema = z.object({
  type: z.enum(['MARTYR_RELATIVE', 'ACADEMIC_EXCELLENCE', 'HUMANITARIAN']),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export function StudentDiscountsPage() {
  const { t } = useTranslation('nav');
  const { data: requests, isLoading, isError, refetch } = useMyDiscountsQuery();
  const submit = useSubmitDiscountMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'ACADEMIC_EXCELLENCE', notes: '' },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.studentDiscounts')} description={t('tuition.discountLead')} />

      <Card className="max-w-lg">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((vals) => {
            const input = document.getElementById('discount-proof') as HTMLInputElement | null;
            const file = input?.files?.[0];
            const fd = new FormData();
            fd.append('type', vals.type);
            if (vals.notes) fd.append('notes', vals.notes);
            if (file) fd.append('proof', file);
            submit.mutate(fd, {
              onSuccess: () => {
                toast.success(t('tuition.discountSubmitted'));
                reset();
                if (input) input.value = '';
                void refetch();
              },
              onError: () => toast.error(t('messages.loadError')),
            });
          })}
        >
          <Field label={t('tuition.discountType')} error={errors.type?.message}>
            <Select aria-invalid={!!errors.type} {...register('type')}>
              <option value="MARTYR_RELATIVE">{t('tuition.discountTypes.MARTYR_RELATIVE')}</option>
              <option value="ACADEMIC_EXCELLENCE">{t('tuition.discountTypes.ACADEMIC_EXCELLENCE')}</option>
              <option value="HUMANITARIAN">{t('tuition.discountTypes.HUMANITARIAN')}</option>
            </Select>
          </Field>
          <Field label={t('tuition.proofFile')}>
            <input
              id="discount-proof"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="block w-full text-sm"
            />
          </Field>
          <Field label={t('labels.notes')} error={errors.notes?.message}>
            <Textarea rows={3} {...register('notes')} />
          </Field>
          <Button type="submit" disabled={submit.isPending}>
            {t('tuition.submitDiscount')}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="m-0 mb-4 text-lg font-semibold">{t('tuition.myRequests')}</h2>
        {!requests?.length ? (
          <p className="text-sm text-zinc-500">{t('tuition.noDiscounts')}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {(requests as Array<{
              id: string;
              type: string;
              status: string;
              notes?: string | null;
              adminResponse?: string | null;
              discountPercent?: string | number | null;
              discountAmount?: string | number | null;
              proofFilePath?: string | null;
              submittedAt: string;
            }>).map((r) => (
              <li key={r.id} className="rounded-xl border border-zinc-200/80 p-4 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{t(`tuition.discountTypes.${r.type}`)}</span>
                  <StatusBadge status={r.status} />
                </div>
                {r.notes ? <p className="mt-2 text-sm text-zinc-600">{r.notes}</p> : null}
                {r.adminResponse ? (
                  <p className="mt-2 text-sm text-brand dark:text-brand-light">
                    {t('tuition.adminResponse')}: {r.adminResponse}
                  </p>
                ) : null}
                {r.discountPercent != null || r.discountAmount != null ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    {r.discountPercent != null ? `${r.discountPercent}%` : null}
                    {r.discountAmount != null ? ` · $${Number(r.discountAmount).toFixed(2)}` : null}
                  </p>
                ) : null}
                {r.proofFilePath ? (
                  <a
                    href={`/api/tuition/discounts/${r.id}/proof`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-brand hover:underline"
                  >
                    {t('tuition.viewProof')}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
