/** Faculty course offerings (`courses` table) — aligned with study-plan codes. */
export type CourseSeed = {
  code: string;
  name: string;
};

export { facultyCoursesForStudyTerm, facultyCoursesYear1Term1 } from './seed-curriculum-data.js';

export const SEED_ACADEMIC_TERM = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;

/** Omar (INFO_ENG year 4) — current semester courses. */
export const INFO_ENG_DEMO_EMAIL = 'student.infoeng@university.edu';
