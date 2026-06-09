import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DollarSign, GraduationCap } from 'lucide-react';
import {
  useAdminFinancialSettingsQuery,
  useUpdateAdminFinancialSettingsMutation,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { useAppSelector } from '../hooks/redux.js';

type CollegeRow = {
  id: string;
  name: string;
  annualAmount: number;
  semesterAmount: number;
};

export function AdminFinancialSettingsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAdminFinancialSettingsQuery();
  const save = useUpdateAdminFinancialSettingsMutation();
  const isDark = useAppSelector((s) => s.theme.mode === 'dark');

  const [transcriptFee, setTranscriptFee] = useState('');
  const [clearanceFee, setClearanceFee] = useState('');
  const [annualByCollege, setAnnualByCollege] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    setTranscriptFee(String(data.transcriptFee));
    setClearanceFee(String(data.clearanceFee));
    const next: Record<string, string> = {};
    for (const college of data.colleges) {
      next[college.id] = String(college.annualAmount);
    }
    setAnnualByCollege(next);
  }, [data]);

  const colleges = (data?.colleges ?? []) as CollegeRow[];

  const collegeTuitionsPayload = useMemo(
    () =>
      colleges.map((college) => ({
        collegeId: college.id,
        annualAmount: Number(annualByCollege[college.id] ?? '0'),
      })),
    [annualByCollege, colleges]
  );

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const handleSave = () => {
    const transcript = Number(transcriptFee);
    const clearance = Number(clearanceFee);
    if (
      !Number.isFinite(transcript) ||
      !Number.isFinite(clearance) ||
      transcript < 0 ||
      clearance < 0
    ) {
      toast.error(t('financial.invalidAmounts'));
      return;
    }
    if (
      collegeTuitionsPayload.some((row) => !Number.isFinite(row.annualAmount) || row.annualAmount < 0)
    ) {
      toast.error(t('financial.invalidAmounts'));
      return;
    }

    save.mutate(
      {
        transcriptFee: transcript,
        clearanceFee: clearance,
        collegeTuitions: collegeTuitionsPayload,
      },
      {
        onSuccess: () => toast.success(t('financial.saved')),
        onError: () => toast.error(t('messages.loadError')),
      }
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.adminFinancialSettings')}
        description={t('financial.lead')}
      />

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-secondary">
            <DollarSign className="size-[1.2rem]" strokeWidth={1.75} aria-hidden />
          </span>
          <h2 className="m-0 text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('financial.serviceFees')}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('financial.transcriptFee')}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={transcriptFee}
              onChange={(e) => setTranscriptFee(e.target.value)}
            />
          </Field>
          <Field label={t('financial.clearanceFee')}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={clearanceFee}
              onChange={(e) => setClearanceFee(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-zinc-200/80 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-secondary">
              <GraduationCap className="size-[1.2rem]" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h2 className="m-0 text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('financial.collegeTuition')}
              </h2>
              <p className="m-0 mt-1 text-sm text-zinc-500">{t('financial.collegeTuitionHint')}</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr
                className={
                  isDark ? 'bg-zinc-900/60 text-zinc-400' : 'bg-zinc-50 text-zinc-500'
                }
              >
                <th className="px-5 py-3 text-start font-semibold">{t('financial.college')}</th>
                <th className="px-5 py-3 text-start font-semibold">{t('financial.annualTuition')}</th>
                <th className="px-5 py-3 text-start font-semibold">{t('financial.semesterTuition')}</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((college) => {
                const annualRaw = annualByCollege[college.id] ?? '';
                const annual = Number(annualRaw);
                const semester =
                  Number.isFinite(annual) && annual >= 0
                    ? (Math.round((annual / 2) * 100) / 100).toFixed(2)
                    : '—';
                return (
                  <tr
                    key={college.id}
                    className="border-t border-zinc-200/80 dark:border-white/10"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {college.name}
                    </td>
                    <td className="px-5 py-3">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="max-w-[10rem]"
                        value={annualRaw}
                        onChange={(e) =>
                          setAnnualByCollege((prev) => ({
                            ...prev,
                            [college.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">${semester}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="button" disabled={save.isPending} onClick={handleSave}>
          {save.isPending ? t('tuition.processing') : t('financial.saveChanges')}
        </Button>
      </div>
    </section>
  );
}
