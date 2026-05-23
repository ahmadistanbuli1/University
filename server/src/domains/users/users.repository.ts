import type { Prisma, PrismaClient, UserRole } from '@prisma/client';

export type ListUsersFilters = {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  collegeId?: string;
  departmentId?: string;
  active?: boolean;
};

const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  collegeId: true,
  createdAt: true,
  college: { select: { id: true, name: true } },
  studentProfile: {
    select: {
      id: true,
      academicNumber: true,
      currentSemester: true,
      academicYear: true,
      department: { select: { id: true, name: true, code: true } },
    },
  },
} satisfies Prisma.UserSelect;

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
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                department: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
      },
    });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  listFaculty() {
    return this.db.user.findMany({
      where: { role: 'FACULTY', active: true },
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

  listUsers(filters: ListUsersFilters) {
    const skip = (filters.page - 1) * filters.pageSize;
    const where: Prisma.UserWhereInput = {};

    if (filters.role) where.role = filters.role;
    if (filters.collegeId) where.collegeId = filters.collegeId;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.departmentId) {
      where.studentProfile = { departmentId: filters.departmentId };
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { studentProfile: { academicNumber: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return Promise.all([
      this.db.user.findMany({
        where,
        skip,
        take: filters.pageSize,
        orderBy: { createdAt: 'desc' },
        select: userListSelect,
      }),
      this.db.user.count({ where }),
    ]);
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      select: userListSelect,
    });
  }

  createStudentProfile(data: {
    userId: string;
    departmentId: string;
    academicNumber: string;
    currentSemester: number;
    academicYear: string;
  }) {
    return this.db.student.create({ data });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
      select: userListSelect,
    });
  }

  updateStudentProfile(
    studentId: string,
    data: Partial<{
      departmentId: string;
      academicNumber: string;
      currentSemester: number;
      academicYear: string;
    }>
  ) {
    return this.db.student.update({ where: { id: studentId }, data });
  }

  findStudentByUserId(userId: string) {
    return this.db.student.findUnique({ where: { userId } });
  }

  findStudentByAcademicNumber(academicNumber: string) {
    return this.db.student.findUnique({ where: { academicNumber } });
  }

  countAdmins() {
    return this.db.user.count({ where: { role: 'ADMIN', active: true } });
  }

  findDepartmentById(id: string) {
    return this.db.department.findUnique({
      where: { id },
      include: { college: true },
    });
  }
}
