import type { LucideIcon } from 'lucide-react';
import { LogOut, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { IconTile } from '../components/ui/IconTile.js';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher.js';
import { ThemeToggle } from '../components/ui/ThemeToggle.js';
import { useAppDispatch, useAppSelector } from '../hooks/redux.js';
import { cn } from '../lib/cn.js';
import { clearCredentials } from '../store/authSlice.js';

export type NavItem = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
};

type DashboardShellProps = {
  titleKey: string;
  navItems: NavItem[];
};

export function DashboardShell({ titleKey, navItems }: DashboardShellProps) {
  const { t } = useTranslation('nav');
  const { t: tc } = useTranslation('common');
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  function desktopLinkClass({ isActive }: { isActive: boolean }) {
    return cn(
      'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
      isActive
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10'
        : 'text-zinc-600 hover:bg-white/90 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white'
    );
  }

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
      <header className="relative z-30 flex flex-wrap items-center gap-2 border-b border-zinc-200/60 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/60 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="hidden sm:grid">
            <IconTile icon={Sparkles} className="size-11 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100" />
          </span>
          <div className="min-w-0 sm:ps-0">
            <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{t('labels.workspace')}</p>
            <p className="truncate text-sm font-black text-zinc-900 dark:text-white sm:text-base">{t(titleKey)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/90 py-1 pe-1 ps-2.5 dark:border-white/10 dark:bg-white/5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-md" aria-hidden>
                {initial}
              </span>
              <span className="hidden max-w-[10rem] truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200 lg:inline">{user.name}</span>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-2xl border border-zinc-200/80 bg-white/90 px-3 py-2 text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            onClick={() => {
              dispatch(clearCredentials());
              navigate('/login');
            }}
          >
            <LogOut className="size-4 sm:hidden" strokeWidth={1.85} aria-hidden />
            <span className="hidden sm:inline">{tc('logout')}</span>
          </Button>
        </div>
      </header>

      <nav
        className="relative z-20 flex gap-1.5 overflow-x-auto border-b border-zinc-200/50 bg-white/40 px-2 py-2.5 backdrop-blur-md dark:border-white/5 dark:bg-zinc-950/40 md:hidden"
        aria-label="Sidebar mobile"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              title={t(item.labelKey)}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 dark:bg-white/5 dark:text-zinc-300 dark:ring-white/10'
                )
              }
            >
              <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.85} aria-hidden />
              <span className="max-w-[7.5rem] truncate">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:flex-row md:gap-4 md:p-5">
        <aside className="hidden w-[17.5rem] shrink-0 flex-col md:flex">
          <div className="flex flex-1 flex-col gap-3 rounded-[1.75rem] border border-white/50 bg-white/55 p-3 shadow-xl shadow-indigo-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/40">
            <div className="flex items-center gap-3 px-2 pb-1 pt-1">
              <IconTile icon={Sparkles} className="size-11 rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-100" />
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t(titleKey)}</p>
                <p className="text-xs font-bold leading-tight text-zinc-800 dark:text-zinc-100">{t('labels.navHint')}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Sidebar">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end ?? false} className={desktopLinkClass}>
                    {({ isActive }) => (
                      <>
                        <IconTile
                          icon={Icon}
                          tone={isActive ? 'onAccent' : 'soft'}
                          className={cn('size-10 rounded-xl', isActive && 'bg-white/25 text-white')}
                        />
                        <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto rounded-[1.75rem] border border-white/60 bg-white/65 p-4 shadow-2xl shadow-indigo-950/[0.07] backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/45 dark:shadow-black/30 sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
