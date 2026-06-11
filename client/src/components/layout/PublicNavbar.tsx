import { Home, Library, LogIn, Menu, Newspaper, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.js';
import { ThemeToggle } from '../ui/ThemeToggle.js';
import { cn } from '../../lib/cn.js';

/** Scroll past this → dock nav to top edge */
const DOCK_AT = 56;
/** Scroll below this → float nav again (hysteresis avoids flicker) */
const FLOAT_AT = 16;

const nav = [
  { to: '/', labelKey: 'navHome' as const, icon: Home, end: true },
  { to: '/news', labelKey: 'navNews' as const, icon: Newspaper },
  { to: '/library', labelKey: 'navLibrary' as const, icon: Library },
  { to: '/login', labelKey: 'navLogin' as const, icon: LogIn },
  { to: '/register', labelKey: 'navRegister' as const, icon: UserPlus },
] as const;

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200',
    isActive
      ? 'bg-brand text-white shadow-md shadow-brand/25'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white'
  );
}

export function PublicNavbar() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setDocked((prev) => {
          if (!prev && y > DOCK_AT) return true;
          if (prev && y < FLOAT_AT) return false;
          return prev;
        });
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            'pointer-events-auto px-3 transition-[padding] duration-300 ease-out sm:px-4',
            docked ? 'pt-0' : 'pt-3 sm:pt-4'
          )}
        >
          <div
            className={cn(
              'mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3',
              'border bg-white/90 backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-950/90',
              'transition-[border-radius,box-shadow,border-color] duration-300 ease-out',
              docked
                ? 'rounded-none border-x-0 border-t-0 border-zinc-200/70 shadow-sm dark:border-white/10'
                : 'rounded-2xl border-zinc-200/80 shadow-[0_10px_40px_-14px_rgba(2,86,146,0.35)] dark:border-white/15 dark:shadow-[0_10px_40px_-14px_rgba(0,0,0,0.55)]'
            )}
          >
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 font-black tracking-tight text-zinc-900 no-underline sm:gap-3 dark:text-white"
              onClick={() => setOpen(false)}
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand via-brand-light to-brand-secondary text-xs font-black text-white shadow-lg shadow-brand/30 sm:size-11 sm:rounded-2xl sm:text-sm"
                aria-hidden
              >
                SPU
              </span>
              <span className="hidden min-w-0 flex-col sm:flex">
                <span className="text-sm font-black leading-tight sm:text-base">{t('brandShort')}</span>
                <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {t('brandTagline')}
                </span>
              </span>
            </Link>

            <nav className="ms-auto hidden items-center gap-0.5 md:flex" aria-label="Main">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                    <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.85} aria-hidden />
                    {t(item.labelKey)}
                  </NavLink>
                );
              })}
              <div className="ms-1 flex items-center gap-1 border-s border-zinc-200/80 ps-2 dark:border-white/10">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </nav>

            <div className="ms-auto flex items-center gap-1.5 md:hidden">
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
        </div>
      </header>

      <div
        id="public-mobile-menu"
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 top-[var(--public-nav-offset)] md:hidden',
          'transition-opacity duration-300 ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
          tabIndex={open ? 0 : -1}
          aria-label={t('navMenuClose')}
          onClick={() => setOpen(false)}
        />
        <nav
          className={cn(
            'relative mx-3 flex flex-col gap-1 rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95',
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

      {/* Fixed offset — never animates, prevents layout jump while scrolling */}
      <div className="h-[var(--public-nav-offset)] shrink-0" aria-hidden />
    </>
  );
}
