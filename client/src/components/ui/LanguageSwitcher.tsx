import { useTranslation } from 'react-i18next';
import { Button } from './Button.js';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const lng = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-0.5 shadow-sm dark:border-white/10 dark:bg-white/5"
      role="group"
      aria-label={t('languageLabel')}
    >
      <span className="hidden ps-2 sm:grid" aria-hidden>
        <Languages className="size-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.85} />
      </span>
      <Button
        type="button"
        variant={lng.startsWith('ar') ? 'secondary' : 'ghost'}
        size="sm"
        className="rounded-xl !px-3 !py-1.5 !text-xs"
        onClick={() => void i18n.changeLanguage('ar')}
      >
        العربية
      </Button>
      <Button
        type="button"
        variant={lng.startsWith('en') ? 'secondary' : 'ghost'}
        size="sm"
        className="rounded-xl !px-3 !py-1.5 !text-xs"
        onClick={() => void i18n.changeLanguage('en')}
      >
        English
      </Button>
    </div>
  );
}
