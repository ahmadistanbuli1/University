import type { PrismaClient } from '@prisma/client';
import {
  ensureCollegeTuitionConfigs,
  ensureUniversityFinancialSettings,
  semesterFromAnnual,
} from '../../lib/financial-settings.js';
import type { UpdateFinancialSettingsInput } from './admin.schemas.js';

export class AdminRepository {
  constructor(private readonly db: PrismaClient) {}

  usersCountByRole() {
    return this.db.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });
  }

  countPendingAppeals() {
    return this.db.gradeAppeal.count({ where: { status: 'PENDING' } });
  }

  countPendingTranscripts() {
    return this.db.transcriptRequest.count({ where: { status: 'PENDING' } });
  }

  countBooks() {
    return this.db.book.count();
  }

  countNews() {
    return this.db.news.count();
  }

  countUsers() {
    return this.db.user.count();
  }

  /** One row per calendar day in [start, end], inclusive, with audit log counts. */
  async auditLogCountsByDay(start: Date, end: Date) {
    const logs = await this.db.auditLog.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    });
    const dayKeys: string[] = [];
    const cursor = new Date(start);
    cursor.setUTCHours(0, 0, 0, 0);
    const endUtc = new Date(end);
    endUtc.setUTCHours(23, 59, 59, 999);
    while (cursor <= endUtc) {
      dayKeys.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const counts = new Map(dayKeys.map((d) => [d, 0]));
    for (const log of logs) {
      const key = log.createdAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return dayKeys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
  }

  async getFinancialSettings() {
    await ensureUniversityFinancialSettings(this.db);
    await ensureCollegeTuitionConfigs(this.db);

    const [settings, colleges] = await Promise.all([
      this.db.universityFinancialSettings.findUniqueOrThrow({ where: { id: 'default' } }),
      this.db.college.findMany({
        orderBy: { name: 'asc' },
        include: { tuitionConfig: true },
      }),
    ]);

    return {
      transcriptFee: settings.transcriptFee,
      clearanceFee: settings.clearanceFee,
      updatedAt: settings.updatedAt.toISOString(),
      colleges: colleges.map((college) => ({
        id: college.id,
        name: college.name,
        annualAmount: college.tuitionConfig
          ? Number(college.tuitionConfig.totalAmount)
          : 1000,
        semesterAmount: college.tuitionConfig
          ? Number(college.tuitionConfig.semesterAmount)
          : 500,
      })),
    };
  }

  async updateFinancialSettings(input: UpdateFinancialSettingsInput) {
    await this.db.universityFinancialSettings.update({
      where: { id: 'default' },
      data: {
        transcriptFee: input.transcriptFee,
        clearanceFee: input.clearanceFee,
      },
    });

    for (const row of input.collegeTuitions) {
      const semesterAmount = semesterFromAnnual(row.annualAmount);
      await this.db.collegeTuitionConfig.upsert({
        where: { collegeId: row.collegeId },
        create: {
          collegeId: row.collegeId,
          totalAmount: row.annualAmount,
          semesterAmount,
        },
        update: {
          totalAmount: row.annualAmount,
          semesterAmount,
        },
      });
    }

    return this.getFinancialSettings();
  }
}
