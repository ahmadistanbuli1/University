import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAdminDiscountsQuery, useReviewDiscountMutation } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';

type DiscountRow = {
  id: string;
  type: string;
  status: string;
  notes?: string | null;
  student?: { user?: { name?: string; email?: string }; department?: { name?: string } };
};

export function AdminDiscountsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAdminDiscountsQuery();
  const review = useReviewDiscountMutation();
  const [draft, setDraft] = useState<Record<string, { percent: string; amount: string; response: string }>>(
    {}
  );

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const pending = (data as DiscountRow[]).filter((r) => r.status === 'PENDING');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.adminDiscounts')} />
      {!pending.length ? (
        <Alert variant="info">{t('tuition.noPendingDiscounts')}</Alert>
      ) : (
        pending.map((r) => {
          const d = draft[r.id] ?? { percent: '', amount: '', response: '' };
          return (
            <Card key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="m-0 font-semibold">{r.student?.user?.name}</p>
                  <p className="m-0 text-sm text-zinc-500">
                    {r.student?.user?.email} · {r.student?.department?.name}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 text-sm">
                {t(`tuition.discountTypes.${r.type}`)} — {r.notes}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label={t('tuition.discountPercent')}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={d.percent}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [r.id]: { ...d, percent: e.target.value },
                      }))
                    }
                  />
                </Field>
                <Field label={t('tuition.discountAmount')}>
                  <Input
                    type="number"
                    min={0}
                    value={d.amount}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [r.id]: { ...d, amount: e.target.value },
                      }))
                    }
                  />
                </Field>
              </div>
              <Field label={t('tuition.adminResponse')} className="mt-3">
                <Textarea
                  rows={2}
                  value={d.response}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [r.id]: { ...d, response: e.target.value },
                    }))
                  }
                />
              </Field>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  disabled={review.isPending}
                  onClick={() => {
                    review.mutate(
                      {
                        id: r.id,
                        status: 'APPROVED',
                        discountPercent: d.percent ? Number(d.percent) : undefined,
                        discountAmount: d.amount ? Number(d.amount) : undefined,
                        adminResponse: d.response || undefined,
                      },
                      {
                        onSuccess: () => toast.success(t('tuition.discountApproved')),
                        onError: () => toast.error(t('messages.loadError')),
                      }
                    );
                  }}
                >
                  {t('labels.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={review.isPending}
                  onClick={() => {
                    review.mutate(
                      {
                        id: r.id,
                        status: 'REJECTED',
                        adminResponse: d.response || t('tuition.discountRejectedDefault'),
                      },
                      {
                        onSuccess: () => toast.success(t('tuition.discountRejected')),
                        onError: () => toast.error(t('messages.loadError')),
                      }
                    );
                  }}
                >
                  {t('labels.reject')}
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </section>
  );
}
