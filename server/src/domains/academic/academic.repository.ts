import type { PrismaClient } from '@prisma/client';

export class AcademicRepository {
  constructor(private readonly db: PrismaClient) {}

  findStudentByUserId(userId: string) {
    return this.db.student.findUnique({ where: { userId } });
  }

  listEnrollments(studentId: string) {
    return this.db.enrollment.findMany({
      where: { studentId },
      include: { course: { include: { department: { include: { college: true } } } } },
    });
  }

  listExamResults(studentId: string) {
    return this.db.examResult.findMany({
      where: { studentId },
      orderBy: [{ facultyCourseId: 'asc' }, { attemptNumber: 'desc' }],
      include: {
        facultyCourse: {
          include: {
            course: { include: { department: { include: { college: true } } } },
            faculty: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  findFacultyCourse(id: string) {
    return this.db.facultyCourse.findUnique({
      where: { id },
      include: { course: true, faculty: true },
    });
  }

  createExamResult(data: {
    studentId: string;
    facultyCourseId: string;
    score: number;
    attemptNumber: number;
    semester: string;
    academicYear: string;
  }) {
    return this.db.examResult.create({
      data: {
        student: { connect: { id: data.studentId } },
        facultyCourse: { connect: { id: data.facultyCourseId } },
        score: data.score,
        attemptNumber: data.attemptNumber,
        semester: data.semester,
        academicYear: data.academicYear,
      },
    });
  }

  listStudentsEnrolledInCourse(courseId: string) {
    return this.db.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { student: { academicNumber: 'asc' } },
    });
  }

  async analyticsForFacultyCourse(facultyCourseId: string) {
    const rows = await this.db.examResult.findMany({
      where: { facultyCourseId },
      select: { score: true, studentId: true },
    });
    return rows;
  }
}
