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
import { PageHeader } from '../components/ui/PageHeader.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { StatCard } from '../components/ui/StatCard.js';
import { useAppSelector } from '../hooks/redux.js';
import { cn } from '../lib/cn.js';

const BRAND = {
  primary: '#025692',
  secondary: '#F4853C',
  light: '#0388BE',
  dark: '#014A7A',
};

const PIE_LIGHT = [BRAND.primary, BRAND.secondary, BRAND.light, '#94a3b8', '#f9a66b', '#64748b'];
const PIE_DARK = [BRAND.light, BRAND.secondary, BRAND.primary, '#f9a66b', '#0388be', '#94a3b8'];

const adminLinks: { to: string; labelKey: 'admin.users' | 'admin.news' | 'admin.appeals' | 'admin.logs'; icon: LucideIcon }[] = [
  { to: '/admin/users', labelKey: 'admin.users', icon: Users },
  { to: '/admin/news', labelKey: 'admin.news', icon: Newspaper },
  { to: '/admin/appeals', labelKey: 'admin.appeals', icon: Scale },
  { to: '/admin/logs', labelKey: 'admin.logs', icon: ScrollText },
];

function ChartHeading({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-secondary">
        <Icon className="size-[1.2rem]" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{children}</h2>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <section>
      <Skeleton className="mb-6 h-14 w-full max-w-md" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[1.25rem]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

export function AdminDashboardPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAdminDashboardQuery();
  const isDark = useAppSelector((s) => s.theme.mode === 'dark');

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const pieData = data.usersByRole.map((r) => ({ ...r, name: r.role }));
  const pieColors = isDark ? PIE_DARK : PIE_LIGHT;
  const gridStroke = isDark ? '#3f3f46' : '#e5e7eb';
  const tickFill = isDark ? '#a1a1aa' : '#6b7280';
  const tooltipBg = isDark ? 'rgba(24,24,27,0.95)' : '#ffffff';
  const tooltipBorder = isDark ? '#3f3f46' : '#e5e7eb';
  const barFill = isDark ? BRAND.light : BRAND.primary;
  const areaStroke = isDark ? BRAND.secondary : BRAND.primary;
  return (
    <section>
      <PageHeader title={t('headings.adminDashboard')} description={t('messages.adminWelcome')} icon={LayoutDashboard} />

      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {t('labels.adminOverview')}
      </p>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title={t('labels.kpiUsers')} value={data.totalUsers} icon={Users} />
        <StatCard title={t('labels.kpiBooks')} value={data.totalBooks} icon={BookOpen} />
        <StatCard title={t('labels.kpiNews')} value={data.totalNews} icon={Newspaper} />
        <StatCard
          title={t('labels.kpiPendingAppeals')}
          value={data.pendingAppeals}
          icon={Scale}
          hint={data.pendingAppeals > 0 ? t('labels.workspace') : undefined}
        />
        <StatCard title={t('labels.kpiPendingTranscripts')} value={data.pendingTranscripts} icon={ScrollText} />
      </div>

      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {t('labels.adminActivity')}
      </p>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-brand/10 dark:border-brand-light/15">
          <ChartHeading icon={BarChart3}>{t('labels.chartUsersByRole')}</ChartHeading>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usersByRole} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="role" tick={{ fontSize: 11, fill: tickFill }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickFill }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    borderColor: tooltipBorder,
                    background: tooltipBg,
                    color: isDark ? '#f4f4f5' : '#111827',
                  }}
                />
                <Bar dataKey="count" fill={barFill} radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="border-brand/10 dark:border-brand-light/15">
          <ChartHeading icon={Activity}>{t('labels.chartAuditVolume')}</ChartHeading>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.auditByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="auditFillDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? BRAND.light : BRAND.primary} stopOpacity={isDark ? 0.5 : 0.35} />
                    <stop offset="100%" stopColor={BRAND.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickFill }} tickFormatter={(v) => String(v).slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickFill }} />
                <Tooltip
                  labelFormatter={(v) => String(v)}
                  contentStyle={{
                    borderRadius: 14,
                    borderColor: tooltipBorder,
                    background: tooltipBg,
                    color: isDark ? '#f4f4f5' : '#111827',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke={areaStroke} fill="url(#auditFillDash)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="border-brand/10 dark:border-brand-light/15">
          <ChartHeading icon={PieChartIcon}>{t('labels.chartRoleShare')}</ChartHeading>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.role} fill={pieColors[i % pieColors.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    borderColor: tooltipBorder,
                    background: tooltipBg,
                    color: isDark ? '#f4f4f5' : '#111827',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: tickFill }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-8 border-dashed border-brand/25 dark:border-brand-light/30">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile
              icon={LayoutDashboard}
              className="size-11 rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-secondary"
            />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('labels.adminShortcuts')}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('labels.navHint')}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all duration-200',
                  isActive
                    ? 'border-[#025692]/50 bg-gradient-to-r from-brand to-brand-light text-white shadow-lg shadow-[#025692]/25'
                    : 'border-zinc-200/80 bg-white/80 text-zinc-800 hover:border-brand/30 hover:bg-brand/5 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:border-brand-light/35 dark:hover:bg-brand/10'
                )
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
