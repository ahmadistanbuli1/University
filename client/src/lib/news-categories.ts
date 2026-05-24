import type { TFunction } from 'i18next';

export const NEWS_CATEGORIES = ['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING', 'TUITION'] as const;
export type NewsCategoryKey = (typeof NEWS_CATEGORIES)[number];

export const MANAGER_NEWS_CATEGORIES = ['ANNOUNCEMENT', 'WORKSHOP', 'TRAINING'] as const;

export function newsCategoryLabel(category: string | undefined, t: TFunction) {
  if (!category) return '';
  const key = `news.categories.${category}` as const;
  return t(key, category);
}

export function newsScopeLabel(scope: 'COLLEGE' | 'UNIVERSITY', t: TFunction) {
  return scope === 'COLLEGE' ? t('news.scopeCollege') : t('news.scopeUniversity');
}
