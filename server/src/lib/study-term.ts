import type { StudyTerm } from '@prisma/client';
import { parseCourseStudyMeta } from './course-code.js';

export const STUDY_TERM_FIRST = 'FIRST' as const;
export const STUDY_TERM_SECOND = 'SECOND' as const;

/** Resolve study term from course code, then stored semester label. */
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

/** Canonical value for `faculty_courses.semester`, enrollments, exam_results. */
export function normalizeOfferingTerm(semester: string, courseCode?: string | null): StudyTerm {
  return resolveStudyTerm(semester, courseCode) ?? 'SECOND';
}

export function studyTermFromCourseCode(courseCode: string): StudyTerm | null {
  return parseCourseStudyMeta(courseCode)?.term ?? null;
}
