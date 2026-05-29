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
import { motion } from 'framer-motion';
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
    <section className="space-y-14 pb-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-brand/20 bg-gradient-to-br from-white via-brand/5 to-indigo-50/40 px-6 py-12 shadow-xl sm:px-10 sm:py-16 dark:border-brand/20 dark:from-zinc-900 dark:via-brand/10 dark:to-zinc-950">
        <motion.div
          className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-brand-light/20 blur-3xl"
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <RevealHero className="relative mx-auto max-w-3xl text-center">
          <RevealHeroItem>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white/90 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-brand dark:border-brand/30 dark:bg-white/5 dark:text-brand-light">
              <Sparkles className="size-4" aria-hidden />
              SPU
            </p>
          </RevealHeroItem>
          <RevealHeroItem>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
              {t('homeHeroTitle')}
            </h1>
          </RevealHeroItem>
          <RevealHeroItem>
            <p className="mt-2 text-sm font-semibold text-brand dark:text-brand-light">
              {t('brandFull')}
            </p>
          </RevealHeroItem>
          <RevealHeroItem>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {t('homeHeroSubtitle')}
            </p>
          </RevealHeroItem>
          <RevealHeroItem>
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
          </RevealHeroItem>
        </RevealHero>
      </div>

      <RevealOnScroll>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <IconTile
                icon={GraduationCap}
                className="size-12 rounded-2xl bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light"
              />
              <h2 className="m-0 text-2xl font-black text-zinc-900 dark:text-white">
                {t('homeAboutTitle')}
              </h2>
            </div>
            <p className="m-0 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('homeAboutBody')}
            </p>
          </Card>
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <IconTile
                icon={Sparkles}
                className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
              />
              <h2 className="m-0 text-2xl font-black text-zinc-900 dark:text-white">
                {t('homeOffersTitle')}
              </h2>
            </div>
            <RevealStagger className="flex flex-col gap-4" stagger={0.08}>
              {offers.map((o) => {
                const Icon = o.icon;
                return (
                  <RevealStaggerItem key={o.title}>
                    <div className="flex gap-3">
                      <IconTile
                        icon={Icon}
                        className="size-10 shrink-0 rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-brand-light"
                      />
                      <div>
                        <p className="m-0 font-bold text-zinc-900 dark:text-white">{o.title}</p>
                        <p className="m-0 mt-1 text-sm text-zinc-600 dark:text-zinc-400">{o.desc}</p>
                      </div>
                    </div>
                  </RevealStaggerItem>
                );
              })}
            </RevealStagger>
          </Card>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="m-0 text-2xl font-black text-zinc-900 dark:text-white">
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
            <div className="max-w-3xl space-y-4">
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </div>
          ) : previewItems.length === 0 ? (
            <Card className="max-w-3xl border-dashed text-center text-sm text-zinc-500">
              {t('homeNewsEmpty')}
            </Card>
          ) : (
            <div className="mx-auto max-w-3xl">
              <NewsTimeline items={previewItems} />
            </div>
          )}
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.08}>
        <div>
          <h2 className="mb-4 text-xl font-black text-zinc-900 dark:text-white">
            {t('homeQuickLinks')}
          </h2>
          <RevealStagger className="grid gap-4 sm:grid-cols-3" stagger={0.1}>
            {tiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <RevealStaggerItem key={tile.to}>
                  <Link to={tile.to} className="group block h-full no-underline">
                    <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-brand/25 group-hover:shadow-lg">
                      <div className="flex items-start gap-3">
                        <IconTile
                          icon={Icon}
                          className="size-11 rounded-xl bg-brand/5 text-brand group-hover:bg-brand/10 dark:bg-brand/15 dark:text-brand-light"
                        />
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{tile.title}</p>
                          <p className="mt-1 text-sm text-zinc-500">{tile.desc}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </RevealStaggerItem>
              );
            })}
          </RevealStagger>
        </div>
      </RevealOnScroll>
    </section>
  );
}
