import type { StudyTerm } from '@prisma/client';
import { averageCourseTotals, courseTotalScore, studyYearFromSemester } from '../domains/academic/study-plan.js';
import { UNIVERSITY_NAME } from './pdf-branding.js';
import type { TranscriptPdfData, TranscriptPdfRow } from './transcript-pdf.js';

function termLabel(term: StudyTerm): string {
  return term === 'FIRST' ? 'Term I' : 'Term II';
}

type GradeRow = {
  practicalScore: { toString(): string };
  theoryScore: { toString(): string };
  curriculumCourse: {
    studyYear: number;
    term: StudyTerm;
    name: string;
    sortOrder: number;
  };
};

export function buildTranscriptPdfData(student: {
  academicNumber: string;
  academicYear: string;
  currentSemester: number;
  user: { name: string };
  department: { name: string; college: { name: string } };
  curriculumGrades: GradeRow[];
}): TranscriptPdfData {
  const sorted = [...student.curriculumGrades].sort((a, b) => {
    if (a.curriculumCourse.studyYear !== b.curriculumCourse.studyYear) {
      return a.curriculumCourse.studyYear - b.curriculumCourse.studyYear;
    }
    const termOrder = (t: StudyTerm) => (t === 'FIRST' ? 0 : 1);
    if (a.curriculumCourse.term !== b.curriculumCourse.term) {
      return termOrder(a.curriculumCourse.term) - termOrder(b.curriculumCourse.term);
    }
    return a.curriculumCourse.sortOrder - b.curriculumCourse.sortOrder;
  });

  const rows: TranscriptPdfRow[] = sorted.map((g) => {
    const practical = Number(g.practicalScore.toString());
    const theory = Number(g.theoryScore.toString());
    const total = courseTotalScore(practical, theory);
    return {
      studyYear: g.curriculumCourse.studyYear,
      termLabel: termLabel(g.curriculumCourse.term),
      courseName: g.curriculumCourse.name,
      practical,
      theory,
      total,
      status: total >= 50 ? 'Pass' : 'Fail',
    };
  });

  const totals = rows.map((r) => r.total);
  const gpa = averageCourseTotals(totals) ?? 0;
  const studyYear = studyYearFromSemester(student.currentSemester);

  return {
    universityName: UNIVERSITY_NAME,
    studentName: student.user.name,
    academicNumber: student.academicNumber,
    collegeName: student.department.college.name,
    departmentName: student.department.name,
    academicYear: student.academicYear,
    studyYearLabel: `Year ${studyYear}`,
    rows,
    gpa,
    issuedAt: new Date(),
  };
}
