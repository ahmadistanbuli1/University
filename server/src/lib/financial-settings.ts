import type { PrismaClient } from '@prisma/client';
import { studyYearFromSemester } from '../domains/academic/study-plan.js';

export const DEFAULT_TRANSCRIPT_FEE = 5;
export const DEFAULT_CLEARANCE_FEE = 15;
export const DEFAULT_ANNUAL_TUITION = 1000;
export const DEFAULT_SEMESTER_TUITION = 500;
export const PHARMACY_ANNUAL_TUITION = 1500;

export function semesterFromAnnual(annualAmount: number): number {
  return Math.round((annualAmount / 2) * 100) / 100;
}

function defaultAnnualForCollege(collegeName: string): number {
  if (collegeName.toLowerCase().includes('pharmaceutical')) return PHARMACY_ANNUAL_TUITION;
  return DEFAULT_ANNUAL_TUITION;
}

export async function ensureUniversityFinancialSettings(prisma: PrismaClient) {
  await prisma.universityFinancialSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      transcriptFee: DEFAULT_TRANSCRIPT_FEE,
      clearanceFee: DEFAULT_CLEARANCE_FEE,
    },
    update: {},
  });
}

export async function getServiceFees(prisma: PrismaClient) {
  await ensureUniversityFinancialSettings(prisma);
  const settings = await prisma.universityFinancialSettings.findUniqueOrThrow({
    where: { id: 'default' },
  });
  return {
    transcriptFee: settings.transcriptFee,
    clearanceFee: settings.clearanceFee,
  };
}

export async function ensureCollegeTuitionConfigs(prisma: PrismaClient) {
  const colleges = await prisma.college.findMany();
  for (const college of colleges) {
    const annual = defaultAnnualForCollege(college.name);
    const semester = semesterFromAnnual(annual);
    await prisma.collegeTuitionConfig.upsert({
      where: { collegeId: college.id },
      create: {
        collegeId: college.id,
        totalAmount: annual,
        semesterAmount: semester,
      },
      update: {},
    });
  }
}

export async function getCollegeTuition(
  prisma: PrismaClient,
  collegeId: string
): Promise<{ annualAmount: number; semesterAmount: number }> {
  await ensureCollegeTuitionConfigs(prisma);
  const row = await prisma.collegeTuitionConfig.findUnique({ where: { collegeId } });
  if (row) {
    return {
      annualAmount: Number(row.totalAmount),
      semesterAmount: Number(row.semesterAmount),
    };
  }
  return { annualAmount: DEFAULT_ANNUAL_TUITION, semesterAmount: DEFAULT_SEMESTER_TUITION };
}

export async function resolveStudentSemesterTuition(
  prisma: PrismaClient,
  collegeId: string,
  currentSemester: number
): Promise<{ studyYear: number; semesterAmount: number; annualAmount: number }> {
  const studyYear = studyYearFromSemester(currentSemester);
  const { annualAmount, semesterAmount } = await getCollegeTuition(prisma, collegeId);
  return { studyYear, semesterAmount, annualAmount };
}
