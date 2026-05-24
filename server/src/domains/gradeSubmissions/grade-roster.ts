import type { StudyTerm } from '@prisma/client';
import { parseCourseStudyMeta } from '../../lib/course-code.js';
import {
  isCourseReachable,
  isGradeEntryOpenForTerm,
  studyYearFromSemester,
} from '../academic/study-plan.js';

export type CourseOfferingMeta = {
  studyYear: number;
  term: StudyTerm;
};

export function parseOfferingMeta(courseCode: string): CourseOfferingMeta | null {
  const meta = parseCourseStudyMeta(courseCode);
  if (!meta) return null;
  return { studyYear: meta.studyYear, term: meta.term };
}

export { isGradeEntryOpenForTerm };

export function studentMatchesCourseYear(currentSemester: number, courseStudyYear: number): boolean {
  return studyYearFromSemester(currentSemester) === courseStudyYear;
}

export function isStudentEligibleForCourseGrade(
  currentSemester: number,
  courseStudyYear: number,
  courseTerm: StudyTerm
): boolean {
  if (!isGradeEntryOpenForTerm(courseTerm)) return false;
  if (!studentMatchesCourseYear(currentSemester, courseStudyYear)) return false;
  return isCourseReachable(currentSemester, courseStudyYear, courseTerm);
}
