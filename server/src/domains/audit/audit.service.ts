import type { Prisma } from '@prisma/client';
import { AuditRepository } from './audit.repository.js';

export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  async log(input: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: Prisma.InputJsonValue;
  }) {
    return this.repo.create({
      user: { connect: { id: input.userId } },
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      details: input.details,
    });
  }

  async listAuditLogs(params: { page: number; pageSize: number }) {
    return this.repo.list(params);
  }

  listMyActivity(userId: string, params: { page: number; pageSize: number }) {
    return this.repo.listForUser(userId, params);
  }
}
