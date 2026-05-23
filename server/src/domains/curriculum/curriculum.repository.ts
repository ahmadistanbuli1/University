import type { PrismaClient, StudyTerm } from '@prisma/client';

export class CurriculumRepository {
  constructor(private readonly db: PrismaClient) {}

  findDepartment(id: string) {
    return this.db.department.findUnique({
      where: { id },
      include: { college: true },
    });
  }

  listDepartmentsByCollege(collegeId: string) {
    return this.db.department.findMany({
      where: { collegeId },
      orderBy: { name: 'asc' },
    });
  }

  listCurriculum(params: { departmentId?: string; studyYear?: number; collegeId?: string }) {
    const where: {
      departmentId?: string;
      studyYear?: number;
      department?: { collegeId: string };
    } = {};
    if (params.departmentId) where.departmentId = params.departmentId;
    if (params.studyYear) where.studyYear = params.studyYear;
    if (params.collegeId) where.department = { collegeId: params.collegeId };
    return this.db.curriculumCourse.findMany({
      where,
      orderBy: [{ studyYear: 'asc' }, { term: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        department: { include: { college: { select: { id: true, name: true } } } },
      },
    });
  }

  findCurriculumById(id: string) {
    return this.db.curriculumCourse.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  updateCurriculumName(id: string, name: string, code: string) {
    return this.db.$transaction(async (tx) => {
      const updated = await tx.curriculumCourse.update({
        where: { id },
        data: { name },
        include: {
          department: { include: { college: { select: { id: true, name: true } } } },
        },
      });
      await tx.course.updateMany({ where: { code }, data: { name } });
      return updated;
    });
  }

  async deleteCurriculum(id: string, code: string) {
    await this.db.$transaction(async (tx) => {
      const course = await tx.course.findUnique({ where: { code } });
      if (course) {
        const facultyCourses = await tx.facultyCourse.findMany({
          where: { courseId: course.id },
          select: { id: true },
        });
        const fcIds = facultyCourses.map((f) => f.id);
        if (fcIds.length > 0) {
          const results = await tx.examResult.findMany({
            where: { facultyCourseId: { in: fcIds } },
            select: { id: true },
          });
          const resultIds = results.map((r) => r.id);
          if (resultIds.length > 0) {
            await tx.gradeAppeal.deleteMany({ where: { examResultId: { in: resultIds } } });
            await tx.examResult.deleteMany({ where: { id: { in: resultIds } } });
          }
          await tx.facultyCourse.deleteMany({ where: { id: { in: fcIds } } });
        }
        await tx.enrollment.deleteMany({ where: { courseId: course.id } });
        await tx.course.delete({ where: { id: course.id } });
      }
      await tx.curriculumCourse.delete({ where: { id } });
    });
  }

  groupByYearAndTerm(
    rows: Awaited<ReturnType<CurriculumRepository['listCurriculum']>>
  ) {
    const years = new Map<
      number,
      { studyYear: number; terms: { term: StudyTerm; courses: typeof rows }[] }
    >();
    for (const row of rows) {
      let year = years.get(row.studyYear);
      if (!year) {
        year = { studyYear: row.studyYear, terms: [] };
        years.set(row.studyYear, year);
      }
      let termBlock = year.terms.find((t) => t.term === row.term);
      if (!termBlock) {
        termBlock = { term: row.term, courses: [] };
        year.terms.push(termBlock);
      }
      termBlock.courses.push(row);
    }
    return [...years.values()].sort((a, b) => a.studyYear - b.studyYear);
  }
}
