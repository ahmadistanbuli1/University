import { Toaster } from 'sonner';

type MotionToasterProps = {
  theme: 'light' | 'dark';
};

/** Sonner toasts with motion-friendly styling (enter/exit handled by Sonner CSS) */
export function MotionToaster({ theme }: MotionToasterProps) {
  return (
    <Toaster
      theme={theme}
      position="top-center"
      closeButton
      richColors
      expand
      gap={10}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
            'rounded-2xl border border-zinc-200/90 bg-white/95 shadow-xl shadow-brand/10 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95',
          title: 'font-semibold text-zinc-900 dark:text-white',
          description: 'text-zinc-600 dark:text-zinc-300',
          actionButton:
            'rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark',
          cancelButton: 'rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200',
          closeButton:
            'rounded-lg border border-zinc-200/80 bg-white dark:border-white/10 dark:bg-zinc-800',
        },
      }}
    />
  );
}
