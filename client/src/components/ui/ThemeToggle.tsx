import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.js';
import { toggleTheme } from '../../store/themeSlice.js';
import { Button } from './Button.js';

export function ThemeToggle() {
  const { t } = useTranslation('common');
  const mode = useAppSelector((s) => s.theme.mode);
  const dispatch = useAppDispatch();
  const isDark = mode === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="rounded-2xl border border-zinc-200/80 bg-zinc-50/90 px-2.5 py-2 text-zinc-700 shadow-sm hover:bg-brand/5 hover:text-brand-dark dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-brand/12 dark:hover:text-brand-light"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? t('themeSwitchLight') : t('themeSwitchDark')}
      title={isDark ? t('themeSwitchLight') : t('themeSwitchDark')}
    >
      {isDark ? <Sun className="size-[1.15rem]" strokeWidth={1.85} /> : <Moon className="size-[1.15rem]" strokeWidth={1.85} />}
    </Button>
  );
}
