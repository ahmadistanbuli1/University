import type { NotificationKind, Prisma, PrismaClient, UserRole } from '@prisma/client';

export type CreateNotificationInput = {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  linkPath: string;
  meta?: Prisma.InputJsonValue;
};

export class NotificationRepository {
  constructor(private readonly db: PrismaClient) {}

  createMany(items: CreateNotificationInput[]) {
    if (items.length === 0) return Promise.resolve({ count: 0 });
    return this.db.notification.createMany({
      data: items.map((n) => ({
        userId: n.userId,
        kind: n.kind,
        title: n.title,
        body: n.body,
        linkPath: n.linkPath,
        meta: n.meta ?? undefined,
      })),
    });
  }

  listForUser(userId: string, limit = 30) {
    return this.db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  countUnread(userId: string) {
    return this.db.notification.count({ where: { userId, read: false } });
  }

  markRead(id: string, userId: string) {
    return this.db.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  markAllRead(userId: string) {
    return this.db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  findUserIdsByRoles(roles: UserRole[], excludeUserId?: string) {
    return this.db.user.findMany({
      where: {
        active: true,
        role: { in: roles },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });
  }

  findStudentUserIdsByCollege(collegeId: string, excludeUserId?: string) {
    return this.db.student
      .findMany({
        where: {
          department: { collegeId },
          user: { active: true },
        },
        select: { userId: true },
      })
      .then((rows) => rows.map((r) => r.userId).filter((id) => id !== excludeUserId));
  }

  findAllActiveUserIds(excludeUserId?: string) {
    return this.db.user.findMany({
      where: {
        active: true,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });
  }

  findManagerUserIdsByCollege(collegeId: string, excludeUserId?: string) {
    return this.db.user.findMany({
      where: {
        active: true,
        role: 'MANAGER',
        collegeId,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });
  }

  findStudentUserId(studentId: string) {
    return this.db.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
  }
}
