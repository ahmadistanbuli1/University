import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MotionPage } from '../components/motion/MotionPage.js';
import { SidebarNavItem } from '../components/motion/SidebarNavItem.js';
import { Button } from '../components/ui/Button.js';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher.js';
import { ThemeToggle } from '../components/ui/ThemeToggle.js';
import { useAppDispatch, useAppSelector } from '../hooks/redux.js';
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed.js';
import { cn } from '../lib/cn.js';
import { springSnappy } from '../lib/motion.js';
import { logoutSession } from '../api/http.js';
import spuLogo from '../images/spu.png';
import { NotificationBell } from '../components/NotificationBell.js';
import { clearCredentials } from '../store/authSlice.js';

export type NavItem = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
  sectionLabelKey?: string;
};

type DashboardShellProps = {
  titleKey: string;
  navItems: NavItem[];
};

const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 76;

export function DashboardShell({ titleKey, navItems }: DashboardShellProps) {
  const { t } = useTranslation('nav');
  const { t: tc } = useTranslation('common');
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebarCollapsed();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-x-hidden',
        'bg-zinc-50 dark:bg-zinc-950',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_55%_at_100%_-8%,rgba(99,102,241,0.18),transparent_55%)]',
        'dark:before:bg-[radial-gradient(ellipse_80%_50%_at_0%_0%,rgba(99,102,241,0.22),transparent_50%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_70%_40%_at_0%_100%,rgba(167,139,250,0.12),transparent_50%)]',
        'dark:after:bg-[radial-gradient(ellipse_60%_35%_at_100%_100%,rgba(139,92,246,0.15),transparent_45%)]'
      )}
    >
      <header className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center gap-2 border-b border-zinc-200/50 bg-white/75 px-3 py-2.5 shadow-sm backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/75 supports-[backdrop-filter]:bg-white/65 dark:supports-[backdrop-filter]:bg-zinc-950/65 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden rounded-2xl border border-zinc-200/80 bg-white/90 px-2.5 py-2 text-brand shadow-sm hover:bg-brand/5 hover:text-brand-dark dark:border-white/10 dark:bg-white/5 dark:text-brand-light dark:hover:bg-brand/15 dark:hover:text-white md:inline-flex"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-[1.15rem]" strokeWidth={1.85} aria-hidden />
            ) : (
              <PanelLeftClose className="size-[1.15rem]" strokeWidth={1.85} aria-hidden />
            )}
          </Button>
          <img
            src={spuLogo}
            alt=""
            className="hidden size-11 shrink-0 rounded-2xl object-contain shadow-md sm:block"
            aria-hidden
          />
          <div className="min-w-0 sm:ps-0">
            <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {t('labels.workspace')}
            </p>
            <p className="truncate text-sm font-black text-zinc-900 dark:text-white sm:text-base">
              {t(titleKey)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? <NotificationBell /> : null}
          {user ? (
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/90 py-1 pe-1 ps-2.5 dark:border-white/10 dark:bg-white/5">
              <span
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-light text-xs font-black text-white shadow-md"
                aria-hidden
              >
                {initial}
              </span>
              <span className="hidden max-w-[10rem] truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200 lg:inline">
                {user.name}
              </span>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-2xl border border-zinc-200/80 bg-white/90 px-3 py-2 text-zinc-700 shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={() => {
              void logoutSession()
                .catch(() => undefined)
                .finally(() => {
                  dispatch(clearCredentials());
                  navigate('/login');
                });
            }}
          >
            <LogOut className="size-4 sm:hidden" strokeWidth={1.85} aria-hidden />
            <span className="hidden sm:inline">{tc('logout')}</span>
          </Button>
        </div>
      </header>

      <div className="h-[var(--dashboard-nav-h,4.25rem)] shrink-0" aria-hidden />

      <nav
        className="sticky top-[var(--dashboard-nav-h,4.25rem)] z-40 flex gap-1.5 overflow-x-auto border-b border-zinc-200/50 bg-white/70 px-2 py-2.5 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/70 md:hidden"
        aria-label="Sidebar mobile"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.to} className="flex shrink-0 flex-col gap-1">
              {item.sectionLabelKey ? (
                <span className="px-1 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {t(item.sectionLabelKey)}
                </span>
              ) : null}
              <NavLink
                to={item.to}
                end={item.end ?? false}
                title={t(item.labelKey)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition-colors duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-brand to-brand-light text-white shadow-md'
                      : 'bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 hover:bg-brand/5 hover:text-brand-dark dark:bg-white/5 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-brand/12 dark:hover:text-brand-light'
                  )
                }
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.85} aria-hidden />
                <span className="max-w-[7.5rem] truncate">{t(item.labelKey)}</span>
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:flex-row md:gap-4 md:p-5">
        <motion.aside
          className="hidden shrink-0 flex-col md:flex"
          initial={false}
          animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
          transition={springSnappy}
        >
          <div className="flex h-full flex-1 flex-col gap-3 overflow-hidden rounded-[1.75rem] border border-white/50 bg-white/55 p-3 shadow-xl shadow-indigo-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/40">
            <div
              className={cn(
                'flex items-center gap-3 pb-1 pt-1',
                collapsed ? 'flex-col justify-center px-0' : 'px-2'
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-light text-xs font-black text-white shadow-md">
                SPU
              </span>
              <AnimatePresence mode="wait">
                {!collapsed ? (
                  <motion.div
                    key="brand-text"
                    className="min-w-0 flex-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {t(titleKey)}
                    </p>
                    <p className="text-xs font-bold leading-tight text-zinc-800 dark:text-zinc-100">
                      {t('labels.navHint')}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'shrink-0 rounded-xl border border-zinc-200/80 bg-white/80 text-brand hover:bg-brand/5 hover:text-brand-dark dark:border-white/10 dark:bg-white/5 dark:text-brand-light dark:hover:bg-brand/15 dark:hover:text-white',
                  collapsed && 'mt-1'
                )}
                onClick={toggle}
                aria-expanded={!collapsed}
                aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" strokeWidth={1.85} aria-hidden />
                ) : (
                  <PanelLeftClose className="size-4" strokeWidth={1.85} aria-hidden />
                )}
              </Button>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Sidebar">
              {navItems.map((item) => (
                <div key={item.to}>
                  {item.sectionLabelKey && !collapsed ? (
                    <p className="px-2 pb-0.5 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {t(item.sectionLabelKey)}
                    </p>
                  ) : null}
                  <SidebarNavItem
                    to={item.to}
                    end={item.end}
                    label={t(item.labelKey)}
                    icon={item.icon}
                    collapsed={collapsed}
                  />
                </div>
              ))}
            </nav>
          </div>
        </motion.aside>

        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/60 bg-white/65 p-4 shadow-2xl shadow-indigo-950/[0.07] backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/45 dark:shadow-black/30 sm:p-6 md:p-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionPage key={location.pathname}>
              <Outlet />
            </MotionPage>
          </div>
        </main>
      </div>
    </div>
  );
}
