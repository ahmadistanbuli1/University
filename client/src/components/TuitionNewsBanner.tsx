import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTuitionSummaryQuery } from '../api/hooks.js';
import { Card } from './ui/Card.js';
import { fadeUp } from '../lib/motion.js';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  category?: string;
  enablePayNow?: boolean;
  createdAt: string;
};

export function TuitionNewsBanner({ items }: { items: NewsItem[] }) {
  const { t } = useTranslation('nav');
  const tuition = useTuitionSummaryQuery();
  const tuitionNews = items.filter((n) => n.category === 'TUITION' || n.enablePayNow);
  const firstUnpaid = tuition.data?.installments.find((i) => i.remaining > 0);

  if (!tuitionNews.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {tuitionNews.slice(0, 3).map((n, i) => (
          <motion.div
            key={n.id}
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            exit={fadeUp.exit}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <Card className="border-violet-300/40 bg-violet-50/50 dark:border-violet-500/25 dark:bg-violet-950/25">
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                {t('tuition.announcement')}
              </p>
              <h3 className="m-0 mt-1 font-semibold">{n.title}</h3>
              <p className="m-0 mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {n.content.slice(0, 200)}
              </p>
              {n.enablePayNow ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={firstUnpaid ? `/student/pay/${firstUnpaid.id}` : '/student/tuition'}
                    className="mt-4 inline-flex w-fit items-center rounded-lg bg-gradient-to-r from-violet-600 to-violet-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-600/25"
                  >
                    {t('tuition.payNow')}
                  </Link>
                </motion.div>
              ) : null}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
