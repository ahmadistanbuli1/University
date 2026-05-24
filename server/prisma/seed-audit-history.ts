import type { Prisma, PrismaClient } from '@prisma/client';
import { DEPT_MAX_STUDY_YEARS, facultyCoursesForStudyTerm } from './seed-curriculum-data.js';
import { FACULTY_EMAIL } from './seed-faculty.js';

const AFFAIRS_EMAIL = 'affairs@university.edu';

function daysAgo(base: Date, days: number): Date {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000);
}

async function insertLog(
  prisma: PrismaClient,
  data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: Prisma.InputJsonValue;
    createdAt: Date;
  }
) {
  await prisma.auditLog.create({ data });
}

/** Demo activity history for faculty and student affairs (backdated). */
export async function seedDemoAuditHistory(prisma: PrismaClient) {
  const faculty = await prisma.user.findUnique({ where: { email: FACULTY_EMAIL } });
  const affairs = await prisma.user.findUnique({ where: { email: AFFAIRS_EMAIL } });
  if (!faculty || !affairs) {
    console.warn('Audit history seed skipped: faculty or affairs user missing');
    return;
  }

  await prisma.auditLog.deleteMany({
    where: { userId: { in: [faculty.id, affairs.id] } },
  });

  const now = new Date();
  let facultyLogs = 0;
  let affairsLogs = 0;

  await insertLog(prisma, {
    userId: faculty.id,
    action: 'LOGIN',
    entity: 'users',
    entityId: faculty.id,
    createdAt: daysAgo(now, 120),
  });
  facultyLogs++;

  for (const [deptCode, maxYears] of Object.entries(DEPT_MAX_STUDY_YEARS)) {
    for (let year = 1; year <= maxYears; year++) {
      const courses = facultyCoursesForStudyTerm(deptCode, year, 'FIRST');
      const day = 75 - year * 8 - (Object.keys(DEPT_MAX_STUDY_YEARS).indexOf(deptCode) % 5);

      await insertLog(prisma, {
        userId: faculty.id,
        action: 'SUBMIT_PRACTICAL_GRADES',
        entity: 'grade_submissions',
        entityId: `${deptCode}-Y${year}-S1`,
        details: {
          departmentCode: deptCode,
          studyYear: year,
          term: 'FIRST',
          courseCount: courses.length,
          status: 'SUBMITTED',
        },
        createdAt: daysAgo(now, day + 14),
      });
      facultyLogs++;

      await insertLog(prisma, {
        userId: faculty.id,
        action: 'PUBLISH_PRACTICAL_GRADES',
        entity: 'grade_submissions',
        entityId: `${deptCode}-Y${year}-S1-practical`,
        details: {
          departmentCode: deptCode,
          studyYear: year,
          term: 'FIRST',
          phase: 'PRACTICAL',
          storedBy: 'exam_officer',
        },
        createdAt: daysAgo(now, day + 10),
      });
      facultyLogs++;

      await insertLog(prisma, {
        userId: faculty.id,
        action: 'SUBMIT_THEORY_GRADES',
        entity: 'grade_submissions',
        entityId: `${deptCode}-Y${year}-S1-theory`,
        details: {
          departmentCode: deptCode,
          studyYear: year,
          term: 'FIRST',
          phase: 'THEORY',
        },
        createdAt: daysAgo(now, day + 7),
      });
      facultyLogs++;

      await insertLog(prisma, {
        userId: faculty.id,
        action: 'PUBLISH_THEORY_GRADES',
        entity: 'grade_submissions',
        entityId: `${deptCode}-Y${year}-S1-final`,
        details: {
          departmentCode: deptCode,
          studyYear: year,
          term: 'FIRST',
          courseCount: courses.length,
          note: 'Term 1 grades archived for all students in section',
        },
        createdAt: daysAgo(now, day + 3),
      });
      facultyLogs++;
    }
  }

  await insertLog(prisma, {
    userId: faculty.id,
    action: 'SAVE_PRACTICAL_GRADE_DRAFT',
    entity: 'grade_submissions',
    entityId: faculty.id,
    details: {
      term: 'SECOND',
      academicYear: '2025-2026',
      note: 'Current term — awaiting entry',
    },
    createdAt: daysAgo(now, 2),
  });
  facultyLogs++;

  await insertLog(prisma, {
    userId: affairs.id,
    action: 'LOGIN',
    entity: 'users',
    entityId: affairs.id,
    createdAt: daysAgo(now, 90),
  });
  affairsLogs++;

  const students = await prisma.student.findMany({
    take: 40,
    orderBy: { academicNumber: 'asc' },
    include: { user: { select: { name: true } } },
  });

  for (let i = 0; i < students.length; i++) {
    const student = students[i]!;
    if (i % 5 === 4) {
      await insertLog(prisma, {
        userId: affairs.id,
        action: 'REJECT_TRANSCRIPT',
        entity: 'transcript_requests',
        entityId: student.id,
        details: {
          studentName: student.user.name,
          academicNumber: student.academicNumber,
          reason: 'Incomplete payment record',
        },
        createdAt: daysAgo(now, 45 - (i % 10)),
      });
      affairsLogs++;
    } else {
      await insertLog(prisma, {
        userId: affairs.id,
        action: 'APPROVE_TRANSCRIPT_AFFAIRS',
        entity: 'transcript_requests',
        entityId: student.id,
        details: {
          studentName: student.user.name,
          academicNumber: student.academicNumber,
          forwardedTo: 'exam_officer',
        },
        createdAt: daysAgo(now, 50 - (i % 12)),
      });
      affairsLogs++;
    }

    if (i % 7 === 0) {
      await insertLog(prisma, {
        userId: affairs.id,
        action: 'UPDATE_STUDENT_RECORD',
        entity: 'students',
        entityId: student.id,
        details: {
          studentName: student.user.name,
          academicNumber: student.academicNumber,
          fields: ['department', 'academicYear', 'currentSemester'],
        },
        createdAt: daysAgo(now, 30 - (i % 8)),
      });
      affairsLogs++;
    }
  }

  const appeals = await prisma.gradeAppeal.findMany({ take: 8, orderBy: { submittedAt: 'desc' } });
  for (const appeal of appeals) {
    await insertLog(prisma, {
      userId: affairs.id,
      action: 'UPDATE_APPEAL',
      entity: 'grade_appeals',
      entityId: appeal.id,
      details: { status: appeal.status },
      createdAt: appeal.submittedAt,
    });
    affairsLogs++;
  }

  await insertLog(prisma, {
    userId: affairs.id,
    action: 'REQUEST_TRANSCRIPT',
    entity: 'transcript_requests',
    entityId: affairs.id,
    details: { note: 'Bulk import of paid transcript queue reviewed' },
    createdAt: daysAgo(now, 5),
  });
  affairsLogs++;

  console.log(
    `Demo audit history: ${facultyLogs} faculty logs, ${affairsLogs} affairs logs.`
  );
}
