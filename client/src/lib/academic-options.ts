/** Academic year options in YYYY-YYYY format (e.g. 2021-2022). */
export function buildAcademicYearOptions(anchorYear = new Date().getFullYear()): string[] {
  const START_YEAR = 2021;
  const years: string[] = [];
  for (let y = START_YEAR; y <= anchorYear + 3; y++) {
    years.push(`${y}-${y + 1}`);
  }
  return years;
}

/** @deprecated Use buildStudyYearOptions from department-labels */
export const STUDY_LEVELS = [1, 2, 3, 4, 5] as const;

export type StudyLevel = (typeof STUDY_LEVELS)[number];
