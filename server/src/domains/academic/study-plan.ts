import type { StudyTerm } from '@prisma/client';
import { computePublishedTotal, PRACTICAL_PASS_MIN } from './grade-rules.js';
import { parseCourseStudyMeta } from '../../lib/course-code.js';

export { PRACTICAL_PASS_MIN };

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
  return computePublishedTotal(practical, theory).total;
}

/** Active grade entry follows the current academic term (second semester in demo data). */
export function isGradeEntryOpenForTerm(term: StudyTerm): boolean {
  return term === 'SECOND';
}

export function averageCourseTotals(totals: number[]): number | null {
  if (totals.length === 0) return null;
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  return Math.round(avg * 100) / 100;
}

export function isPracticalPass(practical: number): boolean {
  return practical >= PRACTICAL_PASS_MIN;
}

type ExamScoreRow = {
  courseCode: string;
  practicalScore: number | null;
  theoryScore: number | null;
};

/** Merge exam results by course code (fills gaps in curriculum grades). */
export function examScoresByCourseCode(rows: ExamScoreRow[]): Map<string, { practical: number | null; theory: number | null }> {
  const map = new Map<string, { practical: number | null; theory: number | null }>();
  for (const row of rows) {
    const prev = map.get(row.courseCode) ?? { practical: null, theory: null };
    map.set(row.courseCode, {
      practical: row.practicalScore ?? prev.practical,
      theory: row.theoryScore ?? prev.theory,
    });
  }
  return map;
}

/** True when every curriculum course in the student's current term has full published grades. */
export function isCurrentTermFullyGraded(
  curriculumCourseCodes: string[],
  examRows: ExamScoreRow[],
  studyYear: number,
  currentTerm: StudyTerm
): boolean {
  if (curriculumCourseCodes.length === 0) return false;
  const complete = new Set<string>();
  for (const row of examRows) {
    if (row.practicalScore == null || row.theoryScore == null) continue;
    const meta = parseCourseStudyMeta(row.courseCode);
    if (!meta || meta.studyYear !== studyYear || meta.term !== currentTerm) continue;
    complete.add(row.courseCode);
  }
  return curriculumCourseCodes.every((code) => complete.has(code));
}
