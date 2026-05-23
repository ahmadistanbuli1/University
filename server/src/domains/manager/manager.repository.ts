import type { ManagerRequestStatus, PrismaClient } from '@prisma/client';

export class ManagerRepository {
  constructor(private readonly db: PrismaClient) {}

  createRequest(managerId: string, subject: string, body: string) {
    return this.db.managerRequest.create({
      data: { managerId, subject, body },
      include: {
        manager: { select: { id: true, name: true, email: true, college: { select: { name: true } } } },
      },
    });
  }

  listByManager(managerId: string) {
    return this.db.managerRequest.findMany({
      where: { managerId },
      orderBy: { createdAt: 'desc' },
      include: {
        resolvedBy: { select: { name: true } },
      },
    });
  }

  listPendingAndRecent() {
    return this.db.managerRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            college: { select: { id: true, name: true } },
          },
        },
        resolvedBy: { select: { name: true } },
      },
    });
  }

  findById(id: string) {
    return this.db.managerRequest.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            college: { select: { name: true } },
          },
        },
      },
    });
  }

  resolve(
    id: string,
    data: {
      status: ManagerRequestStatus;
      adminResponse: string;
      resolvedById: string;
    }
  ) {
    return this.db.managerRequest.update({
      where: { id },
      data: {
        status: data.status,
        adminResponse: data.adminResponse,
        resolvedById: data.resolvedById,
        resolvedAt: new Date(),
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { name: true } },
      },
    });
  }
}
