import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Newspaper,
  PieChart as PieChartIcon,
  Scale,
  ScrollText,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Area,
  AreaChart,
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
import { useAdminDashboardQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { IconTile } from '../components/ui/IconTile.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatCard } from '../components/ui/StatCard.js';
import { useAppSelector } from '../hooks/redux.js';
import { cn } from '../lib/cn.js';

const PIE_LIGHT = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c4b5fd', '#94a3b8'];
const PIE_DARK = ['#a5b4fc', '#818cf8', '#6366f1', '#c4b5fd', '#e879f9', '#94a3b8'];

const adminLinks: { to: string; labelKey: 'admin.users' | 'admin.news' | 'admin.appeals' | 'admin.logs'; icon: LucideIcon }[] = [
  { to: '/admin/users', labelKey: 'admin.users', icon: Users },
  { to: '/admin/news', labelKey: 'admin.news', icon: Newspaper },
  { to: '/admin/appeals', labelKey: 'admin.appeals', icon: Scale },
  { to: '/admin/logs', labelKey: 'admin.logs', icon: ScrollText },
];

function ChartHeading({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-indigo-200">
        <Icon className="size-[1.2rem]" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{children}</h2>
    </div>
  );
}

export function AdminDashboardPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAdminDashboardQuery();
  const isDark = useAppSelector((s) => s.theme.mode === 'dark');

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const pieData = data.usersByRole.map((r) => ({ ...r, name: r.role }));
  const pieColors = isDark ? PIE_DARK : PIE_LIGHT;
  const gridStroke = isDark ? '#3f3f46' : '#e4e4e7';
  const tickFill = isDark ? '#a1a1aa' : '#52525b';
  const tooltipBg = isDark ? 'rgba(24,24,27,0.92)' : '#ffffff';
  const tooltipBorder = isDark ? '#3f3f46' : '#e4e4e7';
  const barFill = isDark ? '#818cf8' : '#4f46e5';
  const areaStroke = isDark ? '#a5b4fc' : '#4f46e5';

  return (
    <section>
      <PageHeader title={t('headings.adminDashboard')} description={t('messages.adminWelcome')} icon={LayoutDashboard} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title={t('labels.kpiUsers')} value={data.totalUsers} icon={Users} />
        <StatCard title={t('labels.kpiBooks')} value={data.totalBooks} icon={BookOpen} />
        <StatCard title={t('labels.kpiNews')} value={data.totalNews} icon={Newspaper} />
        <StatCard title={t('labels.kpiPendingAppeals')} value={data.pendingAppeals} icon={Scale} />
        <StatCard title={t('labels.kpiPendingTranscripts')} value={data.pendingTranscripts} icon={ScrollText} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <ChartHeading icon={BarChart3}>{t('labels.chartUsersByRole')}</ChartHeading>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usersByRole} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="role" tick={{ fontSize: 11, fill: tickFill }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickFill }} />
                <Tooltip
                  contentStyle={{ borderRadius: 14, borderColor: tooltipBorder, background: tooltipBg, color: isDark ? '#f4f4f5' : '#18181b' }}
                />
                <Bar dataKey="count" fill={barFill} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <ChartHeading icon={Activity}>{t('labels.chartAuditVolume')}</ChartHeading>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.auditByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="auditFillDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? '#a5b4fc' : '#6366f1'} stopOpacity={isDark ? 0.45 : 0.35} />
                    <stop offset="100%" stopColor={isDark ? '#6366f1' : '#6366f1'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickFill }} tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickFill }} />
                <Tooltip
                  labelFormatter={(v) => String(v)}
                  contentStyle={{ borderRadius: 14, borderColor: tooltipBorder, background: tooltipBg, color: isDark ? '#f4f4f5' : '#18181b' }}
                />
                <Area type="monotone" dataKey="count" stroke={areaStroke} fill="url(#auditFillDash)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <ChartHeading icon={PieChartIcon}>{t('labels.chartRoleShare')}</ChartHeading>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={48} outerRadius={88} paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={entry.role} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: tooltipBorder, background: tooltipBg, color: isDark ? '#f4f4f5' : '#18181b' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: tickFill }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="mt-8 border-dashed border-zinc-300/80 dark:border-white/15">
        <div className="mb-4 flex items-center gap-3">
          <IconTile icon={LayoutDashboard} className="size-11 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-100" />
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('labels.adminShortcuts')}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all duration-200',
                  isActive
                    ? 'border-indigo-400/50 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'border-zinc-200/80 bg-white/80 text-zinc-800 hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <IconTile
                    icon={link.icon}
                    tone={isActive ? 'onAccent' : 'soft'}
                    className={cn('size-11 rounded-xl', isActive && 'bg-white/25 text-white')}
                  />
                  <span className="min-w-0 flex-1">{t(link.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </Card>
    </section>
  );
}
