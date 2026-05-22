import type { PrismaClient } from '@prisma/client';
import {
  DEPARTMENT_CODE_MIGRATIONS,
  OBSOLETE_COLLEGE_NAMES,
  UNIVERSITY_STRUCTURE,
} from './structure-data.js';

const CANONICAL_DEPT_CODES = new Set(
  UNIVERSITY_STRUCTURE.flatMap((c) => c.departments.map((d) => d.code))
);

const CANONICAL_COLLEGE_NAMES = new Set(UNIVERSITY_STRUCTURE.map((c) => c.name));

/** Rename legacy department codes and merge duplicates before upserting structure. */
async function migrateLegacyDepartments(prisma: PrismaClient) {
  for (const [oldCode, newCode] of Object.entries(DEPARTMENT_CODE_MIGRATIONS)) {
    const oldDept = await prisma.department.findUnique({ where: { code: oldCode } });
    if (!oldDept) continue;

    const newDept = await prisma.department.findUnique({ where: { code: newCode } });
    if (!newDept) {
      await prisma.department.update({
        where: { id: oldDept.id },
        data: { code: newCode },
      });
      continue;
    }

    await prisma.student.updateMany({
      where: { departmentId: oldDept.id },
      data: { departmentId: newDept.id },
    });
    await prisma.course.updateMany({
      where: { departmentId: oldDept.id },
      data: { departmentId: newDept.id },
    });
    await prisma.book.updateMany({
      where: { departmentId: oldDept.id },
      data: { departmentId: newDept.id },
    });
    await prisma.department.delete({ where: { id: oldDept.id } });
  }
}

/** Remove departments and colleges no longer in the canonical structure. */
async function cleanupObsoleteStructure(prisma: PrismaClient) {
  const obsoleteDepts = await prisma.department.findMany({
    where: { code: { notIn: [...CANONICAL_DEPT_CODES] } },
  });

  for (const dept of obsoleteDepts) {
    const studentCount = await prisma.student.count({ where: { departmentId: dept.id } });
    if (studentCount > 0) {
      console.warn(`Skipping delete of orphan department ${dept.code} (${studentCount} students)`);
      continue;
    }
    await prisma.course.deleteMany({ where: { departmentId: dept.id } });
    await prisma.book.updateMany({ where: { departmentId: dept.id }, data: { departmentId: null } });
    await prisma.department.delete({ where: { id: dept.id } });
  }

  const colleges = await prisma.college.findMany({ include: { departments: true } });
  for (const college of colleges) {
    const isCanonical = CANONICAL_COLLEGE_NAMES.has(college.name);
    const isObsoleteName = OBSOLETE_COLLEGE_NAMES.includes(college.name);
    if (isCanonical || !isObsoleteName) continue;
    if (college.departments.length > 0) continue;

    await prisma.news.updateMany({ where: { collegeId: college.id }, data: { collegeId: null } });
    await prisma.user.updateMany({ where: { collegeId: college.id }, data: { collegeId: null } });
    await prisma.collegeTuitionConfig.deleteMany({ where: { collegeId: college.id } }).catch(() => {});
    await prisma.college.delete({ where: { id: college.id } });
  }
}

/** Upsert colleges and departments so registration always has the canonical list. */
export async function seedUniversityStructure(prisma: PrismaClient) {
  await migrateLegacyDepartments(prisma);

  for (const collegeSeed of UNIVERSITY_STRUCTURE) {
    let college = await prisma.college.findFirst({ where: { name: collegeSeed.name } });
    if (!college) {
      college = await prisma.college.create({
        data: { name: collegeSeed.name, description: collegeSeed.description },
      });
    } else {
      college = await prisma.college.update({
        where: { id: college.id },
        data: { description: collegeSeed.description },
      });
    }

    for (const deptSeed of collegeSeed.departments) {
      await prisma.department.upsert({
        where: { code: deptSeed.code },
        create: {
          code: deptSeed.code,
          name: deptSeed.name,
          description: deptSeed.description,
          collegeId: college.id,
        },
        update: {
          name: deptSeed.name,
          description: deptSeed.description,
          collegeId: college.id,
        },
      });
    }
  }

  await cleanupObsoleteStructure(prisma);

  const students = await prisma.student.findMany({ include: { department: { include: { college: true } } } });
  for (const s of students) {
    const collegeId = s.department.collegeId;
    if (s.userId) {
      await prisma.user.updateMany({
        where: { id: s.userId, role: 'STUDENT' },
        data: { collegeId },
      });
    }
  }
}
