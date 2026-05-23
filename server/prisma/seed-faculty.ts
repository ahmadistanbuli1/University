import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';

export const FACULTY_EMAIL = 'faculty@university.edu';

/** Seven demo courses across colleges for the default faculty account. */
export const FACULTY_DEMO_COURSE_CODES = [
  'INFO_ENG-Y4-S1-C01',
  'INFO_ENG-Y4-S1-C02',
  'ALT_ENERGY_ENG-Y3-S1-C01',
  'ALT_ENERGY_ENG-Y3-S1-C02',
  'MED_ENG-Y2-S1-C01',
  'PHARMACY-Y2-S2-C01',
  'ANESTHESIA-Y3-S1-C01',
] as const;

export const FACULTY_OFFERING_TERM = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;

export async function ensureDemoFacultyUser(prisma: PrismaClient, password: string) {
  const existing = await prisma.user.findUnique({ where: { email: FACULTY_EMAIL } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      name: 'Dr. Ahmad Faculty',
      email: FACULTY_EMAIL,
      password,
      role: UserRole.FACULTY,
    },
  });
}

/** Replace demo faculty assignments with exactly the seven configured courses. */
export async function seedFacultyCourseAssignments(prisma: PrismaClient) {
  const faculty = await prisma.user.findUnique({ where: { email: FACULTY_EMAIL } });
  if (!faculty) return;

  const existingFc = await prisma.facultyCourse.findMany({
    where: { facultyId: faculty.id },
    select: { id: true },
  });
  const fcIds = existingFc.map((r) => r.id);
  if (fcIds.length > 0) {
    await prisma.gradeAppeal.deleteMany({
      where: { examResult: { facultyCourseId: { in: fcIds } } },
    });
    await prisma.examResult.deleteMany({ where: { facultyCourseId: { in: fcIds } } });
    await prisma.facultyCourse.deleteMany({ where: { facultyId: faculty.id } });
  }

  for (const code of FACULTY_DEMO_COURSE_CODES) {
    const course = await prisma.course.findUnique({ where: { code } });
    if (!course) {
      console.warn(`Faculty seed: course ${code} not found`);
      continue;
    }
    await prisma.facultyCourse.create({
      data: {
        facultyId: faculty.id,
        courseId: course.id,
        semester: FACULTY_OFFERING_TERM.semester,
        academicYear: FACULTY_OFFERING_TERM.academicYear,
      },
    });
  }
}

export { assignFacultyCourses } from '../src/lib/faculty-courses.js';
