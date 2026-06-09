import type { AuditService } from '../audit/audit.service.js';
import type { AdminRepository } from './admin.repository.js';
import type { UpdateFinancialSettingsInput } from './admin.schemas.js';
export class AdminService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly audit: AuditService
  ) {}

  async getDashboardSummary() {
    const [grouped, pendingAppeals, pendingTranscripts, totalBooks, totalNews, totalUsers] = await Promise.all([
      this.repo.usersCountByRole(),
      this.repo.countPendingAppeals(),
      this.repo.countPendingTranscripts(),
      this.repo.countBooks(),
      this.repo.countNews(),
      this.repo.countUsers(),
    ]);

    const usersByRole = grouped.map((g) => ({ role: g.role, count: g._count._all }));

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 13);
    start.setUTCHours(0, 0, 0, 0);
    const auditByDay = await this.repo.auditLogCountsByDay(start, end);

    return {
      usersByRole,
      pendingAppeals,
      pendingTranscripts,
      totalBooks,
      totalNews,
      totalUsers,
      auditByDay,
    };
  }

  listAuditLogs(page: number, pageSize: number) {
    return this.audit.listAuditLogs({ page, pageSize });
  }

  getFinancialSettings() {
    return this.repo.getFinancialSettings();
  }

  async updateFinancialSettings(adminId: string, input: UpdateFinancialSettingsInput) {
    const updated = await this.repo.updateFinancialSettings(input);
    await this.audit.log({
      userId: adminId,
      action: 'UPDATE_FINANCIAL_SETTINGS',
      entity: 'university_financial_settings',
      entityId: 'default',
      details: {
        transcriptFee: input.transcriptFee,
        clearanceFee: input.clearanceFee,
        collegeTuitionRows: input.collegeTuitions.length,
      },
    });
    return updated;
  }
}
