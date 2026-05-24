import type { LibraryBookCategory } from '@prisma/client';

export const LIBRARY_BOOK_CATEGORIES = [
  'MEDICAL',
  'ADMINISTRATIVE',
  'SCIENTIFIC',
  'PROGRAMMING',
  'FRONTEND_WEB',
  'BACKEND_WEB',
  'ARTIFICIAL_INTELLIGENCE',
  'GRADUATION_PROJECT',
] as const satisfies readonly LibraryBookCategory[];

export type LibraryCategorySlug = (typeof LIBRARY_BOOK_CATEGORIES)[number];
