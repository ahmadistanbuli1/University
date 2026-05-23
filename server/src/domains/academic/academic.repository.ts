import type { PrismaClient } from '@prisma/client';

export class AcademicRepository {
  constructor(private readonly db: PrismaClient) {}

  findStudentByUserId(userId: string) {
    return this.db.student.findUnique({ where: { userId } });
  }

  findStudentUserId(studentId: string) {
    return this.db.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
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

  findStudentByAcademicNumber(academicNumber: string) {
    return this.db.student.findUnique({
      where: { academicNumber },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  findCurriculumCourseByCode(code: string) {
    return this.db.curriculumCourse.findUnique({ where: { code } });
  }

  upsertCurriculumGrade(data: {
    studentId: string;
    curriculumCourseId: string;
    practicalScore: number;
    theoryScore: number;
  }) {
    return this.db.studentCurriculumGrade.upsert({
      where: {
        studentId_curriculumCourseId: {
          studentId: data.studentId,
          curriculumCourseId: data.curriculumCourseId,
        },
      },
      create: {
        studentId: data.studentId,
        curriculumCourseId: data.curriculumCourseId,
        practicalScore: data.practicalScore,
        theoryScore: data.theoryScore,
      },
      update: {
        practicalScore: data.practicalScore,
        theoryScore: data.theoryScore,
      },
    });
  }

  upsertExamResult(data: {
    studentId: string;
    facultyCourseId: string;
    score: number;
    practicalScore: number;
    theoryScore: number;
    semester: string;
    academicYear: string;
  }) {
    return this.db.examResult.upsert({
      where: {
        studentId_facultyCourseId_attemptNumber: {
          studentId: data.studentId,
          facultyCourseId: data.facultyCourseId,
          attemptNumber: 1,
        },
      },
      create: {
        studentId: data.studentId,
        facultyCourseId: data.facultyCourseId,
        score: data.score,
        practicalScore: data.practicalScore,
        theoryScore: data.theoryScore,
        attemptNumber: 1,
        semester: data.semester,
        academicYear: data.academicYear,
      },
      update: {
        score: data.score,
        practicalScore: data.practicalScore,
        theoryScore: data.theoryScore,
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

  findStudentWithDepartment(userId: string) {
    return this.db.student.findUnique({
      where: { userId },
      include: { department: true },
    });
  }

  listCurriculumCourses(departmentId: string, studyYear: number) {
    return this.db.curriculumCourse.findMany({
      where: { departmentId, studyYear },
      orderBy: [{ term: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  listCurriculumGradesForYear(studentId: string, studyYear: number) {
    return this.db.studentCurriculumGrade.findMany({
      where: {
        studentId,
        curriculumCourse: { studyYear },
      },
      include: { curriculumCourse: true },
    });
  }
}
