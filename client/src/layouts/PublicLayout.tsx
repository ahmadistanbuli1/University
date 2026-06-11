import { Outlet } from 'react-router-dom';
import { PublicFooter } from '../components/layout/PublicFooter.js';
import { PublicNavbar } from '../components/layout/PublicNavbar.js';
import { cn } from '../lib/cn.js';

export function PublicLayout() {
  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-x-hidden',
        'bg-zinc-50 dark:bg-zinc-950',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(2,86,146,0.12),transparent_50%)]',
        'dark:before:bg-[radial-gradient(ellipse_100%_70%_at_80%_0%,rgba(3,136,190,0.15),transparent_55%)]'
      )}
    >
      <PublicNavbar />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-2 sm:px-6 sm:pt-4">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
