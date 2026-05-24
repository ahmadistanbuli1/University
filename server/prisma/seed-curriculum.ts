import type { PrismaClient } from '@prisma/client';
import { buildCurriculumForDepartment, DEPT_MAX_STUDY_YEARS } from './seed-curriculum-data.js';
import { ensureDepartmentCoursesFromCurriculum } from '../src/lib/student-enrollment.js';

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
          practicalPass: 16,
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

    await ensureDepartmentCoursesFromCurriculum(prisma, dept.id);
  }

  console.log(`Curriculum seeded: ${courseCount} course slots across departments.`);
}
