import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type MotionPageProps = {
  children: ReactNode;
  className?: string;
};

/** Fade-only transition — avoids vertical shift that breaks scroll inside overflow containers */
export function MotionPage({ children, className }: MotionPageProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ overflowAnchor: 'none' }}
    >
      {children}
    </motion.div>
  );
}
