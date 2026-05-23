import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { AuditService } from '../audit/audit.service.js';
import type { NotificationDispatchService } from '../notifications/notification.service.js';
import type { ManagerRepository } from './manager.repository.js';

export class ManagerService {
  constructor(
    private readonly repo: ManagerRepository,
    private readonly audit: AuditService,
    private readonly notify: NotificationDispatchService
  ) {}

  async createRequest(managerId: string, role: UserRole, input: { subject: string; body: string }) {
    if (role !== 'MANAGER') {
      throw new AppError(403, 'Forbidden');
    }
    const created = await this.repo.createRequest(managerId, input.subject, input.body);
    await this.audit.log({
      userId: managerId,
      action: 'CREATE',
      entity: 'ManagerRequest',
      entityId: created.id,
    });
    await this.notify.notifyRoles(
      ['ADMIN'],
      {
        kind: 'MANAGER_REQUEST',
        title: 'Manager request',
        body: input.subject,
        linkPath: '/admin/manager-requests',
        meta: { subject: input.subject, managerName: created.manager.name },
      },
      managerId
    );
    return created;
  }

  async listMyRequests(managerId: string, role: UserRole) {
    if (role !== 'MANAGER') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.listByManager(managerId);
  }

  async listForAdmin(role: UserRole) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.listPendingAndRecent();
  }

  async resolve(
    adminId: string,
    role: UserRole,
    id: string,
    input: { status: 'RESOLVED' | 'REJECTED'; adminResponse: string }
  ) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const row = await this.repo.findById(id);
    if (!row) {
      throw new AppError(404, 'Request not found');
    }
    if (row.status !== 'PENDING') {
      throw new AppError(400, 'Request already processed');
    }
    const updated = await this.repo.resolve(id, {
      status: input.status,
      adminResponse: input.adminResponse,
      resolvedById: adminId,
    });
    await this.audit.log({
      userId: adminId,
      action: 'UPDATE',
      entity: 'ManagerRequest',
      entityId: id,
      details: { status: input.status },
    });
    await this.notify.notifyUser(updated.manager.id, {
      kind: 'MANAGER_REQUEST_RESOLVED',
      title: 'Request update',
      body: input.adminResponse,
      linkPath: '/manager/requests',
      meta: { status: input.status, subject: row.subject },
    });
    return updated;
  }
}
