import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { SEED_ACADEMIC_TERM, SEED_COURSES_BY_DEPARTMENT } from './seed-courses-data.js';
import { SEED_STUDENTS, type StudentSeed } from './seed-students-data.js';

const FACULTY_EMAIL = 'faculty@university.edu';

function randomScore(min = 55, max = 98): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

async function ensureFaculty(prisma: PrismaClient, password: string) {
  const existing = await prisma.user.findUnique({ where: { email: FACULTY_EMAIL } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      name: 'Dr. Faculty',
      email: FACULTY_EMAIL,
      password,
      role: UserRole.FACULTY,
    },
  });
}

async function upsertCourses(prisma: PrismaClient) {
  const departments = await prisma.department.findMany();
  const byCode = new Map(departments.map((d) => [d.code, d]));
  const courses = new Map<string, { id: string; code: string; departmentId: string }>();

  for (const [deptCode, courseList] of Object.entries(SEED_COURSES_BY_DEPARTMENT)) {
    const dept = byCode.get(deptCode);
    if (!dept) continue;
    for (const c of courseList) {
      const row = await prisma.course.upsert({
        where: { code: c.code },
        create: { code: c.code, name: c.name, departmentId: dept.id },
        update: { name: c.name, departmentId: dept.id },
      });
      courses.set(c.code, row);
    }
  }
  return courses;
}

async function ensureFacultyCourses(
  prisma: PrismaClient,
  facultyId: string,
  courses: Map<string, { id: string; code: string }>
) {
  const map = new Map<string, string>();
  for (const [code, course] of courses) {
    let fc = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId: course.id,
        semester: SEED_ACADEMIC_TERM.semester,
        academicYear: SEED_ACADEMIC_TERM.academicYear,
      },
    });
    if (!fc) {
      fc = await prisma.facultyCourse.create({
        data: {
          facultyId,
          courseId: course.id,
          semester: SEED_ACADEMIC_TERM.semester,
          academicYear: SEED_ACADEMIC_TERM.academicYear,
        },
      });
    }
    map.set(code, fc.id);
  }
  return map;
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

async function seedStudentAcademics(
  prisma: PrismaClient,
  studentId: string,
  departmentCode: string,
  courseCodes: string[],
  facultyCourseByCode: Map<string, string>
) {
  await prisma.gradeAppeal.deleteMany({ where: { studentId } });
  await prisma.examResult.deleteMany({ where: { studentId } });
  await prisma.enrollment.deleteMany({ where: { studentId } });

  for (const code of courseCodes) {
    const course = await prisma.course.findUnique({ where: { code } });
    if (!course) continue;

    await prisma.enrollment.create({
      data: {
        studentId,
        courseId: course.id,
        semester: SEED_ACADEMIC_TERM.semester,
        academicYear: SEED_ACADEMIC_TERM.academicYear,
      },
    });

    const facultyCourseId = facultyCourseByCode.get(code);
    if (!facultyCourseId) continue;

    await prisma.examResult.create({
      data: {
        studentId,
        facultyCourseId,
        score: randomScore(),
        attemptNumber: 1,
        semester: SEED_ACADEMIC_TERM.semester,
        academicYear: SEED_ACADEMIC_TERM.academicYear,
      },
    });
  }
}

/** Upsert demo students, department courses, enrollments, and random exam grades. */
export async function seedStudentsAndAcademics(prisma: PrismaClient, password: string) {
  const faculty = await ensureFaculty(prisma, password);
  const courses = await upsertCourses(prisma);
  const facultyCourseByCode = await ensureFacultyCourses(prisma, faculty.id, courses);

  const departments = await prisma.department.findMany({ include: { college: true } });
  const deptByCode = new Map(departments.map((d) => [d.code, d]));

  const credentials: { name: string; email: string; department: string; academicNumber: string }[] = [];

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

    const courseList = SEED_COURSES_BY_DEPARTMENT[seed.departmentCode] ?? [];
    const codes = courseList.map((c) => c.code);

    await seedStudentAcademics(prisma, student.id, seed.departmentCode, codes, facultyCourseByCode);

    credentials.push({
      name: user.name,
      email: user.email,
      department: dept.name,
      academicNumber: seed.academicNumber,
    });
  }

  return credentials;
}
