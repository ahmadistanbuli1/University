import type { PrismaClient } from '@prisma/client';
import {
  buildCurriculumForDepartment,
  DEPT_MAX_STUDY_YEARS,
  INFO_ENG_DEMO_GRADES,
} from './seed-curriculum-data.js';

function randomGrade(minP: number, maxP: number, minT: number, maxT: number) {
  const practical = Math.round((minP + Math.random() * (maxP - minP)) * 10) / 10;
  const theory = Math.round((minT + Math.random() * (maxT - minT)) * 10) / 10;
  return { practical, theory };
}

/** Upsert curriculum courses for all departments and seed demo grades. */
export async function seedCurriculum(prisma: PrismaClient) {
  const departments = await prisma.department.findMany();
  let courseCount = 0;

  for (const dept of departments) {
    const maxYears = DEPT_MAX_STUDY_YEARS[dept.code];
    if (!maxYears) continue;

    const seeds = buildCurriculumForDepartment(dept.code);
    for (const [index, seed] of seeds.entries()) {
      await prisma.curriculumCourse.upsert({
        where: { code: seed.code },
        create: {
          departmentId: dept.id,
          studyYear: seed.studyYear,
          term: seed.term,
          name: seed.name,
          code: seed.code,
          practicalPass: 40,
          theoryPass: 60,
          sortOrder: index,
        },
        update: {
          name: seed.name,
          studyYear: seed.studyYear,
          term: seed.term,
          departmentId: dept.id,
          sortOrder: index,
        },
      });
      courseCount++;
    }
  }

  const infoStudent = await prisma.student.findFirst({
    where: { user: { email: 'student.infoeng@university.edu' } },
  });

  if (infoStudent) {
    await prisma.student.update({
      where: { id: infoStudent.id },
      data: { currentSemester: 7 },
    });

    const infoCourses = await prisma.curriculumCourse.findMany({
      where: { department: { code: 'INFO_ENG' } },
    });

    for (const course of infoCourses) {
      const preset = INFO_ENG_DEMO_GRADES[course.code];
      const isYear4Term2OrLater =
        course.studyYear > 4 || (course.studyYear === 4 && course.term === 'SECOND');
      if (isYear4Term2OrLater) continue;

      const scores = preset ?? randomGrade(28, 38, 42, 58);
      await prisma.studentCurriculumGrade.upsert({
        where: {
          studentId_curriculumCourseId: {
            studentId: infoStudent.id,
            curriculumCourseId: course.id,
          },
        },
        create: {
          studentId: infoStudent.id,
          curriculumCourseId: course.id,
          practicalScore: scores.practical,
          theoryScore: scores.theory,
        },
        update: {
          practicalScore: scores.practical,
          theoryScore: scores.theory,
        },
      });
    }
  }

  console.log(`Curriculum seeded: ${courseCount} course slots across departments.`);
}
