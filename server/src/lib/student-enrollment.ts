import type { PrismaClient } from '@prisma/client';
import { parseCourseStudyMeta } from './course-code.js';
import { studyYearFromSemester } from '../domains/academic/study-plan.js';

const DEFAULT_FACULTY_EMAIL = 'faculty@university.edu';
const DEFAULT_OFFERING_SEMESTER = 'Fall 2025';

/**
 * If the registration form sent a study year (1..max) instead of a semester index,
 * convert to the first semester of that year. Year 1 stays as semester 1.
 */
export function normalizeRegistrationSemester(
  currentSemester: number,
  maxStudyYears: number
): number {
  if (currentSemester < 1) return 1;
  if (currentSemester > maxStudyYears * 2) return currentSemester;

  const asStudyYear = currentSemester;
  if (asStudyYear > maxStudyYears) return currentSemester;

  const semesterForYear = (asStudyYear - 1) * 2 + 1;
  if (studyYearFromSemester(currentSemester) !== asStudyYear) {
    return semesterForYear;
  }
  return currentSemester;
}

/** Mirror curriculum rows into faculty `courses` for a department. */
export async function ensureDepartmentCoursesFromCurriculum(
  prisma: PrismaClient,
  departmentId: string
) {
  const curriculum = await prisma.curriculumCourse.findMany({
    where: { departmentId },
    orderBy: [{ studyYear: 'asc' }, { term: 'asc' }, { sortOrder: 'asc' }],
  });

  for (const row of curriculum) {
    await prisma.course.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        departmentId,
      },
      update: {
        name: row.name,
        departmentId,
      },
    });
  }
}

async function resolveDefaultFacultyId(prisma: PrismaClient): Promise<string | null> {
  const faculty = await prisma.user.findUnique({
    where: { email: DEFAULT_FACULTY_EMAIL },
    select: { id: true },
  });
  return faculty?.id ?? null;
}

/** Ensure a default faculty offering exists for each course in the department. */
export async function ensureFacultyOfferingsForDepartment(
  prisma: PrismaClient,
  departmentId: string,
  academicYear: string,
  semesterLabel = DEFAULT_OFFERING_SEMESTER
) {
  const facultyId = await resolveDefaultFacultyId(prisma);
  if (!facultyId) return;

  const courses = await prisma.course.findMany({
    where: { departmentId },
    select: { id: true },
  });

  for (const course of courses) {
    const existing = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId: course.id,
        semester: semesterLabel,
        academicYear,
      },
    });
    if (!existing) {
      await prisma.facultyCourse.create({
        data: {
          facultyId,
          courseId: course.id,
          semester: semesterLabel,
          academicYear,
        },
      });
    }
  }
}

/**
 * Enroll the student in every course of their department (full study plan).
 * Does not create curriculum grades — those are entered by faculty or affairs.
 */
export async function syncStudentDepartmentEnrollments(
  prisma: PrismaClient,
  input: {
    studentId: string;
    departmentId: string;
    academicYear: string;
    semesterLabel?: string;
  }
) {
  const semesterLabel = input.semesterLabel ?? DEFAULT_OFFERING_SEMESTER;

  await ensureDepartmentCoursesFromCurriculum(prisma, input.departmentId);

  const courses = await prisma.course.findMany({
    where: { departmentId: input.departmentId },
    select: { id: true },
  });

  for (const course of courses) {
    const existing = await prisma.enrollment.findFirst({
      where: { studentId: input.studentId, courseId: course.id },
    });
    if (!existing) {
      await prisma.enrollment.create({
        data: {
          studentId: input.studentId,
          courseId: course.id,
          semester: semesterLabel,
          academicYear: input.academicYear,
        },
      });
    }
  }
}

export type StudentCoursesByTerm = {
  studyYear: number;
  terms: Array<{
    term: 'FIRST' | 'SECOND';
    courses: Array<{ id: string; name: string; code: string }>;
  }>;
};

/** Group enrollments for the student's current study year (term 1 + term 2 tables). */
export function groupEnrollmentsForCurrentYear(
  enrollments: Array<{
    course: { id: string; name: string; code: string };
  }>,
  currentSemester: number
): StudentCoursesByTerm {
  const studyYear = studyYearFromSemester(currentSemester);
  const terms: StudentCoursesByTerm['terms'] = [
    { term: 'FIRST', courses: [] },
    { term: 'SECOND', courses: [] },
  ];

  for (const row of enrollments) {
    const meta = parseCourseStudyMeta(row.course.code);
    if (!meta || meta.studyYear !== studyYear) continue;
    const block = meta.term === 'FIRST' ? terms[0]! : terms[1]!;
    block.courses.push({
      id: row.course.id,
      name: row.course.name,
      code: row.course.code,
    });
  }

  for (const block of terms) {
    block.courses.sort((a, b) => a.code.localeCompare(b.code));
  }

  return { studyYear, terms };
}
