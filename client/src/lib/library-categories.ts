export const LIBRARY_CATEGORIES = [
  'MEDICAL',
  'ADMINISTRATIVE',
  'SCIENTIFIC',
  'PROGRAMMING',
  'FRONTEND_WEB',
  'BACKEND_WEB',
  'ARTIFICIAL_INTELLIGENCE',
  'GRADUATION_PROJECT',
] as const;

export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

/** Years offered in publish-year filter dropdowns */
export function libraryPublishYearOptions(): number[] {
  const end = new Date().getFullYear() + 1;
  const years: number[] = [];
  for (let y = end; y >= 2015; y -= 1) years.push(y);
  return years;
}
