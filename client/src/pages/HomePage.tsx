import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Library,
  LogIn,
  Newspaper,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useNewsListQuery } from '../api/hooks.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { IconTile } from '../components/ui/IconTile.js';
import type { NewsCardItem } from '../components/ui/NewsCard.js';
import { NewsTimeline } from '../components/ui/NewsTimeline.js';
import { NewsCardSkeleton } from '../components/ui/Skeleton.js';

export function HomePage() {
  const { t } = useTranslation('common');
  const { data: newsData, isLoading: newsLoading } = useNewsListQuery(1);
  const previewItems = (newsData?.items ?? []).slice(0, 2) as NewsCardItem[];

  const offers = [
    { icon: TrendingUp, title: t('homeOfferGrades'), desc: t('homeOfferGradesDesc') },
    { icon: BookOpen, title: t('homeOfferCourses'), desc: t('homeOfferCoursesDesc') },
    { icon: Library, title: t('homeOfferLibrary'), desc: t('homeOfferLibraryDesc') },
    { icon: Scale, title: t('homeOfferAppeals'), desc: t('homeOfferAppealsDesc') },
  ] as const;

  const tiles = [
    { to: '/news', title: t('navNews'), desc: t('homeTileNews'), icon: Newspaper },
    { to: '/library', title: t('navLibrary'), desc: t('homeTileLibrary'), icon: Library },
    { to: '/login', title: t('navLogin'), desc: t('homeTileLogin'), icon: LogIn },
  ] as const;

  return (
    <section className="space-y-14">
      <div className="relative overflow-hidden rounded-[2rem] border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/50 to-indigo-50/40 px-6 py-12 shadow-xl sm:px-10 sm:py-16 dark:border-violet-500/20 dark:from-zinc-900 dark:via-violet-950/40 dark:to-zinc-950">
        <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-white/90 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-violet-700 dark:border-violet-500/30 dark:bg-white/5 dark:text-violet-300">
            <Sparkles className="size-4" aria-hidden />
            SPU
          </p>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            {t('homeHeroTitle')}
          </h1>
          <p className="mt-2 text-sm font-semibold text-violet-700 dark:text-violet-300">{t('brandFull')}</p>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            {t('homeHeroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="no-underline">
              <Button type="button" size="lg">
                {t('homeCtaLogin')}
              </Button>
            </Link>
            <Link to="/register" className="no-underline">
              <Button type="button" variant="secondary" size="lg">
                {t('homeCtaRegister')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={GraduationCap} className="size-12 rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200" />
            <h2 className="m-0 text-2xl font-black text-zinc-900 dark:text-white">{t('homeAboutTitle')}</h2>
          </div>
          <p className="m-0 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
            {t('homeAboutBody')}
          </p>
        </Card>
        <Card className="p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={Sparkles} className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200" />
            <h2 className="m-0 text-2xl font-black text-zinc-900 dark:text-white">{t('homeOffersTitle')}</h2>
          </div>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {offers.map((o) => {
              const Icon = o.icon;
              return (
                <li key={o.title} className="flex gap-3">
                  <IconTile icon={Icon} className="size-10 shrink-0 rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-violet-200" />
                  <div>
                    <p className="m-0 font-bold text-zinc-900 dark:text-white">{o.title}</p>
                    <p className="m-0 mt-1 text-sm text-zinc-600 dark:text-zinc-400">{o.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-2xl font-black text-zinc-900 dark:text-white">{t('homeLatestNews')}</h2>
          <Link
            to="/news"
            className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 no-underline hover:text-violet-800 dark:text-violet-400"
          >
            {t('homeViewAllNews')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        {newsLoading ? (
          <div className="max-w-3xl space-y-4">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        ) : previewItems.length === 0 ? (
          <Card className="max-w-3xl border-dashed text-center text-sm text-zinc-500">{t('homeNewsEmpty')}</Card>
        ) : (
          <div className="mx-auto max-w-3xl">
            <NewsTimeline items={previewItems} />
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-black text-zinc-900 dark:text-white">{t('homeQuickLinks')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.to} to={tile.to} className="group no-underline">
                <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-violet-300/50 group-hover:shadow-lg">
                  <div className="flex items-start gap-3">
                    <IconTile
                      icon={Icon}
                      className="size-11 rounded-xl bg-violet-50 text-violet-700 group-hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-200"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{tile.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">{tile.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
