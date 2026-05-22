import type { PrismaClient } from '@prisma/client';

const DEFAULT_TOTAL = 1000;
const DEFAULT_SEMESTER = 500;

export async function ensureCollegeTuitionConfigs(prisma: PrismaClient) {
  const colleges = await prisma.college.findMany();
  for (const college of colleges) {
    await prisma.collegeTuitionConfig.upsert({
      where: { collegeId: college.id },
      create: {
        collegeId: college.id,
        totalAmount: DEFAULT_TOTAL,
        semesterAmount: DEFAULT_SEMESTER,
      },
      update: {},
    });
  }
}

/** Create two semester installments for a student (500 each). */
export async function ensureStudentTuitionInstallments(
  prisma: PrismaClient,
  studentId: string,
  collegeId: string,
  academicYear = '2025-2026'
) {
  const config = await prisma.collegeTuitionConfig.findUnique({ where: { collegeId } });
  const semesterAmount = config ? Number(config.semesterAmount) : DEFAULT_SEMESTER;

  const semesters = [
    { key: 'semester-1', label: 'First semester tuition' },
    { key: 'semester-2', label: 'Second semester tuition' },
  ];

  for (const sem of semesters) {
    await prisma.studentTuitionInstallment.upsert({
      where: {
        studentId_academicYear_semesterKey: {
          studentId,
          academicYear,
          semesterKey: sem.key,
        },
      },
      create: {
        studentId,
        academicYear,
        semesterKey: sem.key,
        label: sem.label,
        amountDue: semesterAmount,
        amountPaid: 0,
        status: 'PENDING',
      },
      update: {},
    });
  }
}
