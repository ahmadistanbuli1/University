import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { INFO_ENG_DEMO_EMAIL } from './seed-courses-data.js';
import { facultyCoursesForStudyTerm } from './seed-curriculum-data.js';
import { SEED_STUDENTS, type StudentSeed } from './seed-students-data.js';
import { syncStudentDepartmentEnrollments } from '../src/lib/student-enrollment.js';
import {
  ensureDemoFacultyUser,
  FACULTY_OFFERING_TERM,
  seedFacultyCourseAssignments,
} from './seed-faculty.js';
const SEED_ACADEMIC_TERM = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;

function randomScore(min = 55, max = 98): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

async function upsertStudentUser(
  prisma: PrismaClient,
  password: string,
  seed: StudentSeed,
  departmentId: string,
  collegeId: string
) {
  let user = await prisma.user.findUnique({ where: { email: seed.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: seed.name,
        email: seed.email,
        password,
        role: UserRole.STUDENT,
        collegeId,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: seed.name, collegeId, role: UserRole.STUDENT },
    });
  }

  let student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) {
    student = await prisma.student.create({
      data: {
        userId: user.id,
        departmentId,
        academicNumber: seed.academicNumber,
        currentSemester: seed.currentSemester,
        academicYear: seed.academicYear,
      },
    });
  } else {
    student = await prisma.student.update({
      where: { id: student.id },
      data: {
        departmentId,
        academicNumber: seed.academicNumber,
        currentSemester: seed.currentSemester,
        academicYear: seed.academicYear,
      },
    });
  }

  return { user, student };
}

/** Demo exam results for Omar (year 4, term 1) only. */
async function seedOmarExamResults(
  prisma: PrismaClient,
  studentId: string,
  departmentCode: string,
  facultyId: string
) {
  const courseSeeds = facultyCoursesForStudyTerm(departmentCode, 4, 'FIRST');
  for (const seed of courseSeeds) {
    const course = await prisma.course.findUnique({ where: { code: seed.code } });
    if (!course) continue;

    let fc = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId: course.id,
        semester: FACULTY_OFFERING_TERM.semester,
        academicYear: FACULTY_OFFERING_TERM.academicYear,
      },
    });
    if (!fc) continue;

    const existing = await prisma.examResult.findFirst({
      where: { studentId, facultyCourseId: fc.id },
    });
    if (!existing) {
      const total = randomScore();
      await prisma.examResult.create({
        data: {
          studentId,
          facultyCourseId: fc.id,
          score: total,
          practicalScore: Math.round(total * 0.4 * 10) / 10,
          theoryScore: Math.round(total * 0.6 * 10) / 10,
          attemptNumber: 1,
          semester: FACULTY_OFFERING_TERM.semester,
          academicYear: FACULTY_OFFERING_TERM.academicYear,
        },
      });
    }
  }
}

/** Upsert demo students with full department enrollments (study-plan courses). */
export async function seedStudentsAndAcademics(prisma: PrismaClient, password: string) {
  const faculty = await ensureDemoFacultyUser(prisma, password);
  await seedFacultyCourseAssignments(prisma);

  const departments = await prisma.department.findMany({ include: { college: true } });
  const deptByCode = new Map(departments.map((d) => [d.code, d]));

  const credentials: { name: string; email: string; department: string; academicNumber: string }[] =
    [];

  for (const seed of SEED_STUDENTS) {
    const dept = deptByCode.get(seed.departmentCode);
    if (!dept) {
      console.warn(`Seed skip: department ${seed.departmentCode} not found`);
      continue;
    }

    const { user, student } = await upsertStudentUser(
      prisma,
      password,
      seed,
      dept.id,
      dept.collegeId
    );

    await syncStudentDepartmentEnrollments(prisma, {
      studentId: student.id,
      departmentId: dept.id,
      academicYear: seed.academicYear,
      semesterLabel: SEED_ACADEMIC_TERM.semester,
    });

    if (seed.email === INFO_ENG_DEMO_EMAIL) {
      await prisma.gradeAppeal.deleteMany({ where: { studentId: student.id } });
      await prisma.examResult.deleteMany({ where: { studentId: student.id } });
      await seedOmarExamResults(prisma, student.id, seed.departmentCode, faculty.id);
    } else {
      await prisma.gradeAppeal.deleteMany({ where: { studentId: student.id } });
      await prisma.examResult.deleteMany({ where: { studentId: student.id } });
    }

    credentials.push({
      name: user.name,
      email: user.email,
      department: dept.name,
      academicNumber: seed.academicNumber,
    });
  }

  const extraStudents = await prisma.student.findMany({
    where: {
      user: {
        email: { notIn: SEED_STUDENTS.map((s) => s.email) },
        role: UserRole.STUDENT,
      },
    },
    include: { department: true },
  });

  for (const student of extraStudents) {
    await syncStudentDepartmentEnrollments(prisma, {
      studentId: student.id,
      departmentId: student.departmentId,
      academicYear: student.academicYear,
      semesterLabel: SEED_ACADEMIC_TERM.semester,
    });
  }

  return credentials;
}
