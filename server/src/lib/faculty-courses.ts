import type { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

export const DEFAULT_FACULTY_OFFERING = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;

export type FacultyCourseConflict = {
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  facultyEmail: string;
  semester: string;
  academicYear: string;
};

export function formatFacultyCourseConflictMessage(conflicts: FacultyCourseConflict[]) {
  const lines = conflicts.map(
    (c) =>
      `«${c.courseName}» (${c.courseCode}) — already assigned to ${c.facultyName} (${c.facultyEmail})`
  );
  return `Course teaching conflict: ${lines.join('; ')}`;
}

/** Ensure no other faculty member is assigned to the same course for this term. */
export async function findFacultyCourseConflicts(
  prisma: PrismaClient,
  courseIds: string[],
  excludeFacultyId: string,
  semester = DEFAULT_FACULTY_OFFERING.semester,
  academicYear = DEFAULT_FACULTY_OFFERING.academicYear
): Promise<FacultyCourseConflict[]> {
  const uniqueIds = [...new Set(courseIds)];
  const conflicts: FacultyCourseConflict[] = [];

  for (const courseId of uniqueIds) {
    const row = await prisma.facultyCourse.findFirst({
      where: {
        courseId,
        facultyId: { not: excludeFacultyId },
        semester,
        academicYear,
      },
      include: {
        course: { select: { code: true, name: true } },
        faculty: { select: { id: true, name: true, email: true } },
      },
    });
    if (row) {
      conflicts.push({
        courseId,
        courseCode: row.course.code,
        courseName: row.course.name,
        facultyId: row.faculty.id,
        facultyName: row.faculty.name,
        facultyEmail: row.faculty.email,
        semester,
        academicYear,
      });
    }
  }

  return conflicts;
}

export async function assertNoFacultyCourseConflicts(
  prisma: PrismaClient,
  courseIds: string[],
  excludeFacultyId: string,
  semester = DEFAULT_FACULTY_OFFERING.semester,
  academicYear = DEFAULT_FACULTY_OFFERING.academicYear
) {
  const conflicts = await findFacultyCourseConflicts(
    prisma,
    courseIds,
    excludeFacultyId,
    semester,
    academicYear
  );
  if (conflicts.length === 0) return;

  throw new AppError(
    409,
    formatFacultyCourseConflictMessage(conflicts),
    'FACULTY_COURSE_CONFLICT',
    { conflicts }
  );
}

/** Replace all course assignments for a faculty member. */
export async function assignFacultyCourses(
  prisma: PrismaClient,
  facultyUserId: string,
  courseIds: string[],
  semester = DEFAULT_FACULTY_OFFERING.semester,
  academicYear = DEFAULT_FACULTY_OFFERING.academicYear
) {
  const uniqueIds = [...new Set(courseIds)];

  await assertNoFacultyCourseConflicts(
    prisma,
    uniqueIds,
    facultyUserId,
    semester,
    academicYear
  );

  const existing = await prisma.facultyCourse.findMany({
    where: { facultyId: facultyUserId },
    select: { id: true },
  });
  const existingIds = existing.map((r) => r.id);
  if (existingIds.length > 0) {
    await prisma.gradeAppeal.deleteMany({
      where: { examResult: { facultyCourseId: { in: existingIds } } },
    });
    await prisma.examResult.deleteMany({ where: { facultyCourseId: { in: existingIds } } });
    await prisma.facultyCourse.deleteMany({ where: { facultyId: facultyUserId } });
  }

  for (const courseId of uniqueIds) {
    await prisma.facultyCourse.create({
      data: {
        facultyId: facultyUserId,
        courseId,
        semester,
        academicYear,
      },
    });
  }
}
