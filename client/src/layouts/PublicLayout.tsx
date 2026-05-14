import { GraduationCap, Home, Library, LogIn, Newspaper, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher.js';
import { ThemeToggle } from '../components/ui/ThemeToggle.js';
import { cn } from '../lib/cn.js';

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
      : 'text-zinc-600 hover:bg-white/80 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white'
  );
}

const nav = [
  { to: '/', labelKey: 'navHome' as const, icon: Home },
  { to: '/news', labelKey: 'navNews' as const, icon: Newspaper },
  { to: '/faculty-directory', labelKey: 'navFaculty' as const, icon: GraduationCap },
  { to: '/library', labelKey: 'navLibrary' as const, icon: Library },
  { to: '/login', labelKey: 'navLogin' as const, icon: LogIn },
  { to: '/register', labelKey: 'navRegister' as const, icon: UserPlus },
] as const;

export function PublicLayout() {
  const { t } = useTranslation('common');

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col',
        'bg-zinc-50 dark:bg-zinc-950',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(99,102,241,0.2),transparent_55%)]',
        'dark:before:bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(139,92,246,0.18),transparent_50%)]'
      )}
    >
      <header className="relative z-40 border-b border-zinc-200/60 bg-white/75 shadow-sm backdrop-blur-2xl dark:border-white/5 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-black tracking-tight text-zinc-900 no-underline dark:text-white">
            <span
              className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-sm font-black text-white shadow-lg shadow-indigo-600/30"
              aria-hidden
            >
              U
            </span>
            <span className="max-w-[10rem] truncate text-base sm:max-w-none sm:text-lg">{t('appTitle')}</span>
          </Link>
          <nav className="ms-auto flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Main">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
                  <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.85} aria-hidden />
                  {t(item.labelKey)}
                </NavLink>
              );
            })}
            <ThemeToggle />
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
