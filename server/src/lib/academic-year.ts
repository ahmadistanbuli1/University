/** Current academic year label (September start). */
export function getCurrentAcademicYear(date = new Date()): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}
