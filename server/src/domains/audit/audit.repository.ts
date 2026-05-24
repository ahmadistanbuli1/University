import type { Prisma, PrismaClient } from '@prisma/client';

export class AuditRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: Prisma.AuditLogCreateInput) {
    return this.db.auditLog.create({ data });
  }

  async list(params: { page: number; pageSize: number }) {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
      }),
      this.db.auditLog.count(),
    ]);
    return { items, total };
  }

  async listForUser(userId: string, params: { page: number; pageSize: number }) {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;
    const where = { userId };
    const [items, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { user: { select: { id: true, email: true, name: true, role: true } } },
      }),
      this.db.auditLog.count({ where }),
    ]);
    return { items, total };
  }
}
