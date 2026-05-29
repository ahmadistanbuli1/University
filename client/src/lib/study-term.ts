import { parseCourseStudyMeta, type StudyTerm } from './course-code.js';

export function resolveStudyTerm(semester: string, courseCode?: string | null): StudyTerm | null {
  if (courseCode) {
    const meta = parseCourseStudyMeta(courseCode);
    if (meta) return meta.term;
  }
  const normalized = semester.trim().toUpperCase();
  if (normalized === 'FIRST' || normalized === 'S1' || normalized === '1') return 'FIRST';
  if (normalized === 'SECOND' || normalized === 'S2' || normalized === '2') return 'SECOND';
  if (/spring/i.test(semester)) return 'SECOND';
  if (/fall/i.test(semester)) return 'FIRST';
  return null;
}

export function formatStudyTermLabel(
  semester: string,
  t: (key: string) => string,
  courseCode?: string | null
): string {
  const term = resolveStudyTerm(semester, courseCode);
  if (term === 'FIRST') return t('studyPlan.termFirst');
  if (term === 'SECOND') return t('studyPlan.termSecond');
  return semester;
}
