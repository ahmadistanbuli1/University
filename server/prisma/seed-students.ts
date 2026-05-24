import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { writeStudentAccountsMarkdown, type StudentCredential } from './seed-accounts-md.js';
import { seedDemoAuditHistory } from './seed-audit-history.js';
import { seedCompletedFirstTermGrades } from './seed-s1-completed-grades.js';
import {
  CURRENT_STUDENT_TERM,
  normalizeAllStudentsAcademicState,
} from './seed-student-academic-state.js';
import { SEED_STUDENTS, type StudentSeed } from './seed-students-data.js';
import {
  ensureDemoFacultyUser,
  seedFacultyCourseAssignments,
} from './seed-faculty.js';

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

/** Upsert demo students, normalize all accounts, seed S1 grades and activity history. */
export async function seedStudentsAndAcademics(prisma: PrismaClient, password: string) {
  const faculty = await ensureDemoFacultyUser(prisma, password);
  await seedFacultyCourseAssignments(prisma);

  const departments = await prisma.department.findMany({ include: { college: true } });
  const deptByCode = new Map(
    departments.map((d) => [
      d.code,
      { id: d.id, name: d.name, collegeId: d.collegeId, collegeName: d.college.name },
    ])
  );

  const credentials: StudentCredential[] = [];

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

    credentials.push({
      ...seed,
      collegeName: dept.collegeName,
      departmentName: dept.name,
    });

    void user;
    void student;
  }

  const allGradeTargets = await normalizeAllStudentsAcademicState(prisma);

  await seedCompletedFirstTermGrades(prisma, faculty.id, allGradeTargets);

  await seedDemoAuditHistory(prisma);

  const mdPath = await writeStudentAccountsMarkdown(credentials);
  console.log(`Student accounts written to ${mdPath}`);
  console.log(
    `Academic calendar: term 2 (${CURRENT_STUDENT_TERM.semester}), S1 grades complete for ${allGradeTargets.length} students.`
  );

  return credentials;
}
