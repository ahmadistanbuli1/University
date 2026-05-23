import type { PrismaClient } from '@prisma/client';

export const DEFAULT_FACULTY_OFFERING = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;

/** Replace all course assignments for a faculty member. */
export async function assignFacultyCourses(
  prisma: PrismaClient,
  facultyUserId: string,
  courseIds: string[],
  semester = DEFAULT_FACULTY_OFFERING.semester,
  academicYear = DEFAULT_FACULTY_OFFERING.academicYear
) {
  const uniqueIds = [...new Set(courseIds)];
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
