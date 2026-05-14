import { GraduationCap, Home, Library, LogIn, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.js';
import { IconTile } from '../components/ui/IconTile.js';

export function HomePage() {
  const { t } = useTranslation('common');

  const tiles = [
    { to: '/news', title: t('navNews'), desc: t('homeTileNews'), icon: Newspaper },
    { to: '/faculty-directory', title: t('navFaculty'), desc: t('homeTileFaculty'), icon: GraduationCap },
    { to: '/library', title: t('navLibrary'), desc: t('homeTileLibrary'), icon: Library },
    { to: '/login', title: t('navLogin'), desc: t('homeTileLogin'), icon: LogIn },
  ] as const;

  return (
    <section>
      <Card className="relative mb-10 overflow-hidden border-indigo-200/50 bg-gradient-to-br from-white/95 via-indigo-50/40 to-violet-100/30 p-6 shadow-lg dark:border-indigo-500/20 dark:from-zinc-900/90 dark:via-indigo-950/40 dark:to-violet-950/30">
        <div className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/25" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <IconTile icon={Home} className="size-14 rounded-2xl bg-white/80 text-indigo-700 shadow-sm dark:bg-white/10 dark:text-indigo-100" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{t('homeHeading')}</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300">{t('welcome')}</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="group no-underline">
            <Card className="h-full border-transparent bg-white/80 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-indigo-200/80 group-hover:shadow-xl group-hover:shadow-indigo-500/10 dark:bg-zinc-900/60 dark:group-hover:border-indigo-500/30">
              <div className="flex items-start gap-3">
                <IconTile
                  icon={tile.icon}
                  className="size-11 rounded-xl bg-zinc-100 text-zinc-700 transition group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-white/10 dark:text-indigo-200 dark:group-hover:bg-indigo-500/25 dark:group-hover:text-white"
                />
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 dark:text-white">{tile.title}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{tile.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
