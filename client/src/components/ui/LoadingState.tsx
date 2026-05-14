import { useTranslation } from 'react-i18next';
import { Spinner } from './Spinner.js';

export function LoadingState() {
  const { t } = useTranslation('common');
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-zinc-500 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-400">
      <Spinner />
      <span>{t('loading')}</span>
    </div>
  );
}
