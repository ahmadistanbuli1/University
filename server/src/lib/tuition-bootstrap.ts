import type { PrismaClient } from '@prisma/client';
import { getCollegeTuition } from './financial-settings.js';

export { ensureCollegeTuitionConfigs } from './financial-settings.js';

/** Create two semester installments for a student based on college tuition. */
export async function ensureStudentTuitionInstallments(
  prisma: PrismaClient,
  studentId: string,
  collegeId: string,
  academicYear = '2025-2026'
) {
  const { semesterAmount } = await getCollegeTuition(prisma, collegeId);

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
