import { Home, Library, LogIn, Menu, Newspaper, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.js';
import { ThemeToggle } from '../ui/ThemeToggle.js';
import { cn } from '../../lib/cn.js';

const nav = [
  { to: '/', labelKey: 'navHome' as const, icon: Home, end: true },
  { to: '/news', labelKey: 'navNews' as const, icon: Newspaper },
  { to: '/library', labelKey: 'navLibrary' as const, icon: Library },
  { to: '/login', labelKey: 'navLogin' as const, icon: LogIn },
  { to: '/register', labelKey: 'navRegister' as const, icon: UserPlus },
] as const;

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-brand to-brand-light text-white shadow-md shadow-brand/20'
      : 'text-zinc-700 hover:bg-brand/5 hover:text-brand-dark dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white'
  );
}

export function PublicNavbar() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/50 bg-white/75 shadow-sm backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/75 supports-[backdrop-filter]:bg-white/65 dark:supports-[backdrop-filter]:bg-zinc-950/65">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 font-black tracking-tight text-zinc-900 no-underline dark:text-white"
          onClick={() => setOpen(false)}
        >
          <span
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand via-brand-light to-brand-secondary text-sm font-black text-white shadow-lg shadow-brand/30"
            aria-hidden
          >
            SPU
          </span>
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="text-base font-black leading-tight sm:text-lg">{t('brandShort')}</span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t('brandTagline')}
            </span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.85} aria-hidden />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
          <ThemeToggle />
          <LanguageSwitcher />
        </nav>

        <div className="ms-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-zinc-200/80 bg-white text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            aria-label={open ? t('navMenuClose') : t('navMenuOpen')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="public-mobile-menu"
        className={cn(
          'fixed inset-0 top-[var(--public-nav-h,4.25rem)] z-40 md:hidden',
          'transition-opacity duration-300 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          tabIndex={open ? 0 : -1}
          aria-label={t('navMenuClose')}
          onClick={() => setOpen(false)}
        />
        <nav
          className={cn(
            'relative mx-3 mt-2 flex flex-col gap-1 rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95',
            'transition-all duration-300 ease-out',
            open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          )}
          aria-label="Main mobile"
        >
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.85} aria-hidden />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
    <div className="h-[var(--public-nav-h,4.25rem)] shrink-0" aria-hidden />
    </>
  );
}
