import type { PrismaClient } from '@prisma/client';
import { computePublishedTotal } from '../src/domains/academic/grade-rules.js';
import { facultyCoursesForStudyTerm } from './seed-curriculum-data.js';
import { FACULTY_S1_COMPLETED_TERM } from './seed-faculty.js';

export type StudentGradeSeed = {
  studentId: string;
  departmentCode: string;
  studyYear: number;
};

function randomScores(): { practical: number; theory: number } {
  const practical = Math.round((16 + Math.random() * 24) * 2) / 2;
  const theory = Math.round((38 + Math.random() * 22) * 2) / 2;
  return { practical, theory };
}

/**
 * Published first-semester grades for every student (all S1 courses in their study year).
 * Second-semester courses stay without grades.
 */
export async function seedCompletedFirstTermGrades(
  prisma: PrismaClient,
  facultyId: string,
  students: StudentGradeSeed[]
) {
  await prisma.studentCurriculumGrade.deleteMany({
    where: { curriculumCourse: { term: 'FIRST' } },
  });
  await prisma.examResult.deleteMany({
    where: { facultyCourse: { course: { code: { contains: '-S1-' } } } },
  });

  let count = 0;

  for (const student of students) {
    const courses = facultyCoursesForStudyTerm(
      student.departmentCode,
      student.studyYear,
      'FIRST'
    );

    for (const slot of courses) {
      const course = await prisma.course.findUnique({ where: { code: slot.code } });
      if (!course) continue;

      const curriculum = await prisma.curriculumCourse.findUnique({ where: { code: slot.code } });
      if (!curriculum) continue;

      let facultyCourse = await prisma.facultyCourse.findFirst({
        where: {
          facultyId,
          courseId: course.id,
          semester: FACULTY_S1_COMPLETED_TERM.semester,
          academicYear: FACULTY_S1_COMPLETED_TERM.academicYear,
        },
      });

      if (!facultyCourse) {
        facultyCourse = await prisma.facultyCourse.create({
          data: {
            facultyId,
            courseId: course.id,
            semester: FACULTY_S1_COMPLETED_TERM.semester,
            academicYear: FACULTY_S1_COMPLETED_TERM.academicYear,
          },
        });
      }

      const { practical, theory } = randomScores();
      const total = computePublishedTotal(practical, theory).total;

      await prisma.examResult.upsert({
        where: {
          studentId_facultyCourseId_attemptNumber: {
            studentId: student.studentId,
            facultyCourseId: facultyCourse.id,
            attemptNumber: 1,
          },
        },
        create: {
          studentId: student.studentId,
          facultyCourseId: facultyCourse.id,
          score: total,
          practicalScore: practical,
          theoryScore: theory,
          attemptNumber: 1,
          semester: FACULTY_S1_COMPLETED_TERM.semester,
          academicYear: FACULTY_S1_COMPLETED_TERM.academicYear,
        },
        update: {
          score: total,
          practicalScore: practical,
          theoryScore: theory,
        },
      });

      await prisma.studentCurriculumGrade.upsert({
        where: {
          studentId_curriculumCourseId: {
            studentId: student.studentId,
            curriculumCourseId: curriculum.id,
          },
        },
        create: {
          studentId: student.studentId,
          curriculumCourseId: curriculum.id,
          practicalScore: practical,
          theoryScore: theory,
        },
        update: {
          practicalScore: practical,
          theoryScore: theory,
        },
      });

      count++;
    }
  }

  console.log(`First-semester demo grades seeded: ${count} student/course rows.`);
}
