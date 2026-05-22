import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar.js';
import { cn } from '../lib/cn.js';

export function PublicLayout() {
  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col',
        'bg-zinc-50 dark:bg-zinc-950',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(99,102,241,0.18),transparent_55%)]',
        'dark:before:bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(139,92,246,0.18),transparent_50%)]'
      )}
    >
      <PublicNavbar />
      <main className="relative mt-7 z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-zinc-200/60 bg-white/60 py-6 text-center text-xs font-medium text-zinc-500 backdrop-blur dark:border-white/5 dark:bg-zinc-950/60 dark:text-zinc-400">
        <p className="m-0">SPU — Shamal Private University · جامعة الشمال الخاصة</p>
      </footer>
    </div>
  );
}
