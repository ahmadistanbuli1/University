import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAnalyticsQuery, useMeQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { StatCard } from '../components/ui/StatCard.js';

type Fc = { id: string; course?: { name?: string } };

const BAR_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

export function FacultyAnalyticsPage() {
  const { t } = useTranslation('nav');
  const { data: me, isLoading: meLoading, isError: meError } = useMeQuery();
  const [facultyCourseId, setFacultyCourseId] = useState<string | null>(null);
  const analytics = useAnalyticsQuery(facultyCourseId);

  if (meLoading) return <LoadingState />;
  if (meError || !me) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const sections = (Array.isArray(me.facultyCourses) ? me.facultyCourses : []) as Fc[];
  const chartData = analytics.data?.scoreDistribution ?? [];

  return (
    <section>
      <PageHeader title={t('headings.facultyAnalytics')} />
      <Card className="mb-6 max-w-md">
        <Field label={t('labels.facultyCourseId')}>
          <Select value={facultyCourseId ?? ''} onChange={(e) => setFacultyCourseId(e.target.value || null)}>
            <option value="">—</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.course?.name ?? s.id}
              </option>
            ))}
          </Select>
        </Field>
      </Card>
      {analytics.isFetching ? (
        <div className="mb-4">
          <LoadingState />
        </div>
      ) : null}
      {analytics.isError ? <Alert variant="error">{t('messages.loadError')}</Alert> : null}
      {analytics.data ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard title={t('labels.average')} value={analytics.data.averageScore} />
            <StatCard title={t('labels.passRate')} value={`${analytics.data.passRatePercent}%`} />
            <StatCard title={t('labels.sample')} value={analytics.data.sampleSize} />
          </div>
          <Card>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">{t('labels.chartScoreBands')}</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      ) : null}
    </section>
  );
}
