import type { StudyTerm } from '@prisma/client';

export function studyYearFromSemester(currentSemester: number): number {
  return Math.floor((Math.max(1, currentSemester) - 1) / 2) + 1;
}

export function termFromSemester(currentSemester: number): StudyTerm {
  return currentSemester % 2 === 1 ? 'FIRST' : 'SECOND';
}

export function termOrder(term: StudyTerm): number {
  return term === 'FIRST' ? 1 : 2;
}

/** Whether the student has reached this course in their progression. */
export function isCourseReachable(
  currentSemester: number,
  courseStudyYear: number,
  courseTerm: StudyTerm
): boolean {
  const currentYear = studyYearFromSemester(currentSemester);
  const currentTerm = termFromSemester(currentSemester);
  if (courseStudyYear < currentYear) return true;
  if (courseStudyYear > currentYear) return false;
  return termOrder(courseTerm) <= termOrder(currentTerm);
}

export function courseTotalScore(practical: number, theory: number): number {
  return Math.round((practical + theory) * 100) / 100;
}

export function averageCourseTotals(totals: number[]): number | null {
  if (totals.length === 0) return null;
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  return Math.round(avg * 100) / 100;
}
