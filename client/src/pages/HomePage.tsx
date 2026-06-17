import {
  ArrowRight,
  ArrowUpRight,
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
import {
  RevealHero,
  RevealHeroItem,
  RevealOnScroll,
  RevealStagger,
  RevealStaggerItem,
} from '../components/motion/Reveal.js';
import { Button } from '../components/ui/Button.js';
import type { NewsCardItem } from '../components/ui/NewsCard.js';
import { NewsFeedCard } from '../components/news/NewsFeedCard.js';
import { NewsCardSkeleton } from '../components/ui/Skeleton.js';
import { cn } from '../lib/cn.js';

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

  const stats = [
    { value: '7+', label: t('homeStatColleges') },
    { value: '24/7', label: t('homeStatAccess') },
    { value: '100%', label: t('homeStatDigital') },
  ] as const;

  return (
    <div className="flex flex-col gap-16 pb-4 sm:gap-20">
      {/* Hero — stays inside layout, no viewport breakout */}
      <section
        className={cn(
          'relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-gradient-to-b from-white via-brand/[0.04] to-zinc-50/80',
          'px-5 py-14 sm:px-10 sm:py-20 dark:border-white/10 dark:from-zinc-900 dark:via-brand/10 dark:to-zinc-950'
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(2 86 146 / 0.12) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full bg-brand/15 blur-3xl sm:size-80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -start-16 size-56 rounded-full bg-brand-secondary/15 blur-3xl"
          aria-hidden
        />

        <RevealHero className="relative mx-auto max-w-3xl text-center">
          <RevealHeroItem>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand dark:border-brand/30 dark:bg-zinc-900/80 dark:text-brand-light">
              <Sparkles className="size-3.5" aria-hidden />
              {t('brandTagline')}
            </p>
          </RevealHeroItem>
          <RevealHeroItem>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
              <span className="bg-gradient-to-br from-zinc-900 via-brand to-brand-light bg-clip-text text-transparent dark:from-white dark:via-brand-light dark:to-brand-secondary">
                {t('homeHeroTitle')}
              </span>
            </h1>
          </RevealHeroItem>
          <RevealHeroItem>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {t('homeHeroSubtitle')}
            </p>
          </RevealHeroItem>
          <RevealHeroItem>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/login" className="no-underline">
                <Button type="button" size="lg" className="shadow-lg shadow-brand/20">
                  {t('homeCtaLogin')}
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                </Button>
              </Link>
              <Link to="/register" className="no-underline">
                <Button type="button" variant="secondary" size="lg">
                  {t('homeCtaRegister')}
                </Button>
              </Link>
            </div>
          </RevealHeroItem>
          <RevealHeroItem>
            <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-zinc-200/70 bg-white/70 px-2 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/50"
                >
                  <p className="m-0 text-lg font-black text-brand sm:text-xl dark:text-brand-light">
                    {s.value}
                  </p>
                  <p className="m-0 mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 sm:text-xs dark:text-zinc-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </RevealHeroItem>
        </RevealHero>
      </section>

      {/* About + offers */}
      <RevealOnScroll>
        <div className="grid gap-5 lg:grid-cols-12">
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 lg:col-span-5',
              'dark:border-white/10 dark:bg-zinc-900/80'
            )}
          >
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-light text-white shadow-md">
              <GraduationCap className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="m-0 text-xl font-black text-zinc-900 sm:text-2xl dark:text-white">
              {t('homeAboutTitle')}
            </h2>
            <p className="m-0 mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('homeAboutBody')}
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-brand-secondary" aria-hidden />
              <h2 className="m-0 text-xl font-black text-zinc-900 dark:text-white">
                {t('homeOffersTitle')}
              </h2>
            </div>
            <RevealStagger className="grid gap-4 sm:grid-cols-2" stagger={0.06}>
              {offers.map((o) => {
                const Icon = o.icon;
                return (
                  <RevealStaggerItem key={o.title}>
                    <div
                      className={cn(
                        'h-full rounded-2xl border border-zinc-200/80 bg-white p-5 transition hover:border-brand/25 hover:shadow-md',
                        'dark:border-white/10 dark:bg-zinc-900/80 dark:hover:border-brand/30'
                      )}
                    >
                      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand dark:text-brand-light">
                        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                      </div>
                      <p className="m-0 font-bold text-zinc-900 dark:text-white">{o.title}</p>
                      <p className="m-0 mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {o.desc}
                      </p>
                    </div>
                  </RevealStaggerItem>
                );
              })}
            </RevealStagger>
          </div>
        </div>
      </RevealOnScroll>

      {/* News */}
      <RevealOnScroll delay={0.05}>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-900/80">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="m-0 text-xl font-black text-zinc-900 sm:text-2xl dark:text-white">
              {t('homeLatestNews')}
            </h2>
            <Link
              to="/news"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand no-underline hover:text-brand-dark dark:text-brand-light"
            >
              {t('homeViewAllNews')}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
          {newsLoading ? (
            <div className="space-y-4">
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </div>
          ) : previewItems.length === 0 ? (
            <p className="m-0 rounded-xl border border-dashed border-zinc-300/80 py-10 text-center text-sm text-zinc-500 dark:border-white/15">
              {t('homeNewsEmpty')}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {previewItems.map((item) => (
                <NewsFeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </RevealOnScroll>

      {/* Quick links */}
      <RevealOnScroll delay={0.08}>
        <div>
          <h2 className="mb-4 text-xl font-black text-zinc-900 dark:text-white">
            {t('homeQuickLinks')}
          </h2>
          <RevealStagger className="grid gap-4 sm:grid-cols-3" stagger={0.08}>
            {tiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <RevealStaggerItem key={tile.to}>
                  <Link to={tile.to} className="group block h-full no-underline">
                    <div
                      className={cn(
                        'flex h-full flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 transition',
                        'hover:border-brand/25 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/80'
                      )}
                    >
                      <div>
                        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:text-brand-light">
                          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                        </div>
                        <p className="m-0 font-bold text-zinc-900 dark:text-white">{tile.title}</p>
                        <p className="m-0 mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{tile.desc}</p>
                      </div>
                      <ArrowUpRight
                        className="mt-4 size-4 text-zinc-400 transition group-hover:text-brand rtl:rotate-180"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </RevealStaggerItem>
              );
            })}
          </RevealStagger>
        </div>
      </RevealOnScroll>
    </div>
  );
}
