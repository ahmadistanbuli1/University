import type { PrismaClient } from '@prisma/client';
import { studyYearFromSemester } from '../src/domains/academic/study-plan.js';
import { syncStudentDepartmentEnrollments } from '../src/lib/student-enrollment.js';

export const CURRENT_STUDENT_TERM = {
  semester: 'Spring 2026',
  academicYear: '2025-2026',
} as const;

export type StudentGradeTarget = {
  studentId: string;
  departmentCode: string;
  studyYear: number;
};

/** Every student is in term 2 of their study year; S2 has no grades yet. */
export async function normalizeAllStudentsAcademicState(
  prisma: PrismaClient
): Promise<StudentGradeTarget[]> {
  const students = await prisma.student.findMany({
    include: { department: true },
  });

  let normalized = 0;
  const targets: StudentGradeTarget[] = [];

  for (const student of students) {
    const studyYear = studyYearFromSemester(student.currentSemester);
    const targetSemester = studyYear * 2;

    if (student.currentSemester !== targetSemester) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          currentSemester: targetSemester,
          academicYear: CURRENT_STUDENT_TERM.academicYear,
        },
      });
      normalized++;
    }

    await syncStudentDepartmentEnrollments(prisma, {
      studentId: student.id,
      departmentId: student.departmentId,
      academicYear: CURRENT_STUDENT_TERM.academicYear,
      semesterLabel: CURRENT_STUDENT_TERM.semester,
    });

    targets.push({
      studentId: student.id,
      departmentCode: student.department.code,
      studyYear,
    });
  }

  await clearSecondTermGrades(prisma);

  console.log(
    `Students normalized to term 2: ${students.length} total (${normalized} semester index updated).`
  );

  return targets;
}

async function clearSecondTermGrades(prisma: PrismaClient) {
  const s2Courses = await prisma.course.findMany({
    where: { code: { contains: '-S2-' } },
    select: { id: true },
  });
  const s2CourseIds = s2Courses.map((c) => c.id);

  const s2FacultyCourses = await prisma.facultyCourse.findMany({
    where: { courseId: { in: s2CourseIds } },
    select: { id: true },
  });
  const s2FcIds = s2FacultyCourses.map((f) => f.id);

  if (s2FcIds.length > 0) {
    await prisma.gradeSubmissionLine.deleteMany({
      where: { submission: { facultyCourseId: { in: s2FcIds } } },
    });
    await prisma.gradeSubmission.deleteMany({
      where: { facultyCourseId: { in: s2FcIds } },
    });
    await prisma.gradeAppeal.deleteMany({
      where: { examResult: { facultyCourseId: { in: s2FcIds } } },
    });
    await prisma.examResult.deleteMany({
      where: { facultyCourseId: { in: s2FcIds } },
    });
  }

  await prisma.studentCurriculumGrade.deleteMany({
    where: { curriculumCourse: { term: 'SECOND' } },
  });

  console.log('Cleared second-term grades and in-progress submissions.');
}
