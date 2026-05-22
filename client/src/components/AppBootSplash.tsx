import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Spinner } from './ui/Spinner.js';
import { fadeIn, springSoft } from '../lib/motion.js';

const MIN_MS = 500;

export function AppBootSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const done = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => setVisible(false), wait);
    };
    void document.fonts?.ready?.then(done).catch(done);
    const fallback = window.setTimeout(done, 2500);
    return () => window.clearTimeout(fallback);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] dark:bg-[#09090B]"
      role="status"
      aria-live="polite"
      aria-busy={visible}
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <motion.div
        className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/25"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springSoft}
      >
        <span className="text-sm font-black text-white">SPU</span>
      </motion.div>
      <motion.p
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        initial={fadeIn.initial}
        animate={fadeIn.animate}
        transition={{ delay: 0.1, ...springSoft }}
      >
        SPU
      </motion.p>
      <Spinner className="size-6 border-2 border-zinc-200 border-t-violet-600 dark:border-zinc-700 dark:border-t-violet-400" />
    </motion.div>
  );
}
