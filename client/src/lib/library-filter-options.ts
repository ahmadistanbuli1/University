import type { LibraryBooksFilters } from '../api/hooks.js';

/** Distinct authors/publishers from demo seed — powers filter dropdowns without an extra API. */
export const LIBRARY_FILTER_AUTHORS = [
  'Dr. Lina Al-Masri',
  'Dr. Samir Haddad',
  'Prof. Nadia Rahman',
  'Dr. James Porter',
  'Dr. Hana Saleh',
  'Dr. Omar Faris',
  'Robert C. Martin',
  'Eva Chen',
  'Dr. Yara Nasser',
  'Prof. Alex Kim',
  'أحمد خليل — قسم هندسة المعلوماتية',
  'Layla Mansour — Computer Science',
] as const;

export const LIBRARY_FILTER_PUBLISHERS = [
  'SPU Medical Press',
  'Health Sciences Editions',
  'Admin Studies House',
  'Science & Tech Books',
  'MIT Press',
  'Prentice Hall',
  'WebCraft Publishing',
  'Backend Works',
  'AI Horizon',
  'مكتبة مشاريع التخرج — SPU',
  'SPU Graduation Archive',
] as const;

export const EMPTY_LIBRARY_FILTERS: LibraryBooksFilters = {
  category: '',
  keyword: '',
  publishYear: '',
  author: '',
  publisher: '',
};
