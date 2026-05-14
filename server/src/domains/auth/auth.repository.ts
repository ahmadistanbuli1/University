import type { Prisma, PrismaClient } from '@prisma/client';

export class AuthRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: {
        college: true,
        studentProfile: { include: { department: { include: { college: true } } } },
      },
    });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.db.user.create({ data });
  }
}
