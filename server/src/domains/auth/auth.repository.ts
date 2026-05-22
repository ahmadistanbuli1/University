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

  findDepartmentById(id: string) {
    return this.db.department.findUnique({
      where: { id },
      include: { college: true },
    });
  }

  findStudentByAcademicNumber(academicNumber: string) {
    return this.db.student.findUnique({ where: { academicNumber } });
  }

  createStudentUser(input: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
    departmentId: string;
    academicNumber: string;
    currentSemester: number;
    academicYear: string;
  }) {
    return this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
          role: 'STUDENT',
          college: { connect: { id: input.collegeId } },
        },
      });
      await tx.student.create({
        data: {
          userId: user.id,
          departmentId: input.departmentId,
          academicNumber: input.academicNumber,
          currentSemester: input.currentSemester,
          academicYear: input.academicYear,
        },
      });
      return user;
    });
  }
}
