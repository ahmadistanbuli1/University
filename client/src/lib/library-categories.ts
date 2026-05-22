export const LIBRARY_CATEGORIES = [
  'MEDICAL',
  'ADMINISTRATIVE',
  'SCIENTIFIC',
  'PROGRAMMING',
  'FRONTEND_WEB',
  'BACKEND_WEB',
  'ARTIFICIAL_INTELLIGENCE',
] as const;

export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export const DEFAULT_LIBRARY_CATEGORY: LibraryCategory = 'MEDICAL';
