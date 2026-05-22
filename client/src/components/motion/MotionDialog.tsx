import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { scaleIn, springSnappy } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';
import { Button } from '../ui/Button.js';

type MotionDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function MotionDialog({ open, onClose, title, children, className }: MotionDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="presentation"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="motion-dialog-title"
            className={cn(
              'relative z-10 w-full max-w-md max-h-[min(90vh,640px)] overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900',
              className
            )}
            initial={scaleIn.initial}
            animate={scaleIn.animate}
            exit={scaleIn.exit}
            transition={springSnappy}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="motion-dialog-title" className="m-0 text-lg font-bold text-zinc-900 dark:text-white">
                {title}
              </h2>
              <Button type="button" variant="ghost" size="sm" className="rounded-xl px-2" onClick={onClose}>
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
