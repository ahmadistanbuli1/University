import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { DEPT_MAX_STUDY_YEARS } from './seed-curriculum-data.js';

export const FACULTY_EMAIL = 'faculty@university.edu';

/** Second-semester course C01 for every study year in every department (current term). */
export function buildFacultyDemoCourseCodes(): string[] {
  const codes: string[] = [];
  for (const deptCode of Object.keys(DEPT_MAX_STUDY_YEARS)) {
    const maxYears = DEPT_MAX_STUDY_YEARS[deptCode]!;
    for (let year = 1; year <= maxYears; year++) {
      codes.push(`${deptCode}-Y${year}-S2-C01`);
    }
  }
  return codes;
}

export const FACULTY_DEMO_COURSE_CODES = buildFacultyDemoCourseCodes();

export const FACULTY_OFFERING_TERM = {
  semester: 'Spring 2026',
  academicYear: '2025-2026',
} as const;

/** Historical first-semester offering label for completed demo grades. */
export const FACULTY_S1_COMPLETED_TERM = {
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

/** Replace demo faculty assignments with second-semester courses across all years. */
export async function seedFacultyCourseAssignments(prisma: PrismaClient) {
  const faculty = await prisma.user.findUnique({ where: { email: FACULTY_EMAIL } });
  if (!faculty) return;

  const existingFc = await prisma.facultyCourse.findMany({
    where: { facultyId: faculty.id },
    select: { id: true },
  });
  const fcIds = existingFc.map((r) => r.id);
  if (fcIds.length > 0) {
    await prisma.gradeSubmissionLine.deleteMany({
      where: { submission: { facultyCourseId: { in: fcIds } } },
    });
    await prisma.gradeSubmission.deleteMany({
      where: { facultyCourseId: { in: fcIds } },
    });
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
