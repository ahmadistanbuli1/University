import type { PrismaClient } from '@prisma/client';

export class StructureRepository {
  constructor(private readonly db: PrismaClient) {}

  listColleges() {
    return this.db.college.findMany({ orderBy: { name: 'asc' } });
  }

  listDepartments(collegeId?: string) {
    return this.db.department.findMany({
      where: collegeId ? { collegeId } : undefined,
      orderBy: { name: 'asc' },
      include: { college: true },
    });
  }

  listCourses() {
    return this.db.course.findMany({
      orderBy: { code: 'asc' },
      include: { department: { include: { college: true } } },
    });
  }
}
