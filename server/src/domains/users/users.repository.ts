import type { PrismaClient, UserRole } from '@prisma/client';

export class UsersRepository {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: {
        college: true,
        studentProfile: { include: { department: { include: { college: true } } } },
        facultyCourses: {
          select: {
            id: true,
            semester: true,
            academicYear: true,
            course: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
  }

  listFaculty() {
    return this.db.user.findMany({
      where: { role: 'FACULTY' },
      select: {
        id: true,
        name: true,
        email: true,
        facultyCourses: {
          select: {
            semester: true,
            academicYear: true,
            course: {
              select: {
                name: true,
                code: true,
                department: { select: { id: true, name: true, college: true } },
              },
            },
          },
        },
      },
    });
  }

  listUsers(params: { page: number; pageSize: number }) {
    const skip = (params.page - 1) * params.pageSize;
    return Promise.all([
      this.db.user.findMany({
        skip,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          collegeId: true,
          createdAt: true,
        },
      }),
      this.db.user.count(),
    ]);
  }

  updateUser(id: string, data: { role?: UserRole; collegeId?: string | null }) {
    return this.db.user.update({
      where: { id },
      data: {
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.collegeId !== undefined ? { collegeId: data.collegeId } : {}),
      },
    });
  }
}
