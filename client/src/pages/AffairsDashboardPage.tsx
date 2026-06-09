import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, GraduationCap, PieChart as PieChartIcon, UserPlus, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAffairsDashboardQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { StatCard } from '../components/ui/StatCard.js';
import { useAppSelector } from '../hooks/redux.js';

const BRAND = { primary: '#025692', secondary: '#F4853C', light: '#0388BE' };
const PIE_COLORS = [BRAND.primary, BRAND.secondary, BRAND.light, '#94a3b8', '#f9a66b', '#64748b'];

function ChartHeading({ icon: Icon, children }: { icon: typeof Users; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-secondary">
        <Icon className="size-[1.2rem]" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {children}
      </h2>
    </div>
  );
}

function truncateLabel(value: string, max = 28) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function AffairsDashboardPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAffairsDashboardQuery();
  const isDark = useAppSelector((s) => s.theme.mode === 'dark');
  const gridStroke = isDark ? '#3f3f46' : '#e5e7eb';
  const tickFill = isDark ? '#a1a1aa' : '#6b7280';
  const tooltipBg = isDark ? 'rgba(24,24,27,0.95)' : '#ffffff';
  const tooltipBorder = isDark ? '#3f3f46' : '#e5e7eb';
  const barFill = isDark ? BRAND.light : BRAND.primary;

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <Skeleton className="h-14 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[1.25rem]" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </section>
    );
  }
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const collegePie = data.studentsByCollege.map((c) => ({
    name: c.collegeName,
    value: c.count,
  }));

  const yearBar = data.studentsByCollegeYear.map((row) => ({
    label: `${truncateLabel(row.collegeName, 22)} · Y${row.studyYear}`,
    fullLabel: `${row.collegeName} · ${t('affairs.studyYearShort', { year: row.studyYear })}`,
    count: row.count,
  }));

  const yearBarHeight = Math.max(320, yearBar.length * 36);

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={t('headings.affairsDashboard')}
        description={t('affairs.dashboardLead')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('affairs.statsTotalStudents')} value={data.totalStudents} icon={Users} />
        <StatCard
          title={t('affairs.statsRecentStudents')}
          value={data.recentlyRegistered}
          icon={UserPlus}
          hint={t('affairs.statsRecentHint')}
        />
        <StatCard
          title={t('affairs.statsPendingClearances')}
          value={data.pendingClearances}
          icon={GraduationCap}
        />
        <StatCard
          title={t('affairs.statsPendingTranscripts')}
          value={data.pendingTranscripts}
          icon={BarChart3}
        />
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-5">
          <ChartHeading icon={PieChartIcon}>{t('affairs.chartByCollege')}</ChartHeading>
          {collegePie.length === 0 ? (
            <p className="m-0 text-sm text-zinc-500">{t('affairs.noData')}</p>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collegePie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {collegePie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => [
                      typeof value === 'number' ? value : String(value ?? ''),
                      String(item.payload?.name ?? ''),
                    ]}
                    contentStyle={{
                      borderRadius: 14,
                      borderColor: tooltipBorder,
                      background: tooltipBg,
                      color: isDark ? '#f4f4f5' : '#111827',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 12, color: tickFill, paddingTop: 16 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <ChartHeading icon={BarChart3}>{t('affairs.chartByCollegeYear')}</ChartHeading>
          {yearBar.length === 0 ? (
            <p className="m-0 text-sm text-zinc-500">{t('affairs.noData')}</p>
          ) : (
            <div className="w-full" style={{ height: yearBarHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={yearBar}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={168}
                    tick={{ fill: tickFill, fontSize: 11 }}
                  />
                  <Tooltip
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload?.fullLabel ?? _label
                    }
                    contentStyle={{
                      borderRadius: 14,
                      borderColor: tooltipBorder,
                      background: tooltipBg,
                      color: isDark ? '#f4f4f5' : '#111827',
                    }}
                  />
                  <Bar dataKey="count" fill={barFill} radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
