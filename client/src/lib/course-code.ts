export type StudyTerm = 'FIRST' | 'SECOND';

export type CourseStudyMeta = {
  studyYear: number;
  term: StudyTerm;
};

/** Parse study year / term from codes like `INFO_ENG-Y3-S1-C01`. */
export function parseCourseStudyMeta(code: string): CourseStudyMeta | null {
  const match = code.match(/-Y(\d+)-(S1|S2)-/i);
  if (!match) return null;
  return {
    studyYear: Number(match[1]),
    term: match[2]!.toUpperCase() === 'S1' ? 'FIRST' : 'SECOND',
  };
}
