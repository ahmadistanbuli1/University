import type { ClearanceRequestStatus, GradeAppealStatus, PrismaClient, TranscriptRequestStatus } from '@prisma/client';
import { studyYearFromSemester } from '../academic/study-plan.js';

export class StudentServicesRepository {
  constructor(private readonly db: PrismaClient) {}

  findStudentByUserId(userId: string) {
    return this.db.student.findUnique({ where: { userId } });
  }

  findStudentWithUser(studentId: string) {
    return this.db.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  findStudentByUserIdWithUser(userId: string) {
    return this.db.student.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  findExamResult(id: string) {
    return this.db.examResult.findUnique({ where: { id }, include: { student: true } });
  }

  createAppeal(data: { studentId: string; examResultId: string; reason: string }) {
    return this.db.gradeAppeal.create({
      data: {
        student: { connect: { id: data.studentId } },
        examResult: { connect: { id: data.examResultId } },
        reason: data.reason,
        status: 'PENDING',
      },
    });
  }

  listAppeals(status?: GradeAppealStatus) {
    return this.db.gradeAppeal.findMany({
      where: status ? { status } : undefined,
      orderBy: { submittedAt: 'desc' },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } },
        examResult: true,
      },
    });
  }

  updateAppeal(id: string, data: { status: GradeAppealStatus; adminResponse?: string | null }) {
    return this.db.gradeAppeal.update({
      where: { id },
      data: { status: data.status, adminResponse: data.adminResponse },
    });
  }

  findAppeal(id: string) {
    return this.db.gradeAppeal.findUnique({
      where: { id },
      include: { student: { include: { user: { select: { id: true, name: true } } } } },
    });
  }

  listAppealsForStudent(studentId: string) {
    return this.db.gradeAppeal.findMany({
      where: { studentId },
      orderBy: { submittedAt: 'desc' },
      include: {
        examResult: {
          include: {
            facultyCourse: { include: { course: { select: { name: true, code: true } } } },
          },
        },
      },
    });
  }

  createTranscriptRequest(data: {
    studentId: string;
    feeAmount: number;
    feePaid: boolean;
    paymentReference: string;
    paidAt: Date;
  }) {
    return this.db.transcriptRequest.create({
      data: {
        student: { connect: { id: data.studentId } },
        status: 'PENDING',
        feeAmount: data.feeAmount,
        feePaid: data.feePaid,
        paymentReference: data.paymentReference,
        paidAt: data.paidAt,
      },
    });
  }

  findActiveTranscriptForStudent(studentId: string) {
    return this.db.transcriptRequest.findFirst({
      where: {
        studentId,
        status: { in: ['PENDING', 'AFFAIRS_APPROVED'] },
      },
    });
  }

  findTranscript(id: string) {
    return this.db.transcriptRequest.findUnique({ where: { id }, include: { student: true } });
  }

  findTranscriptWithStudent(id: string) {
    return this.db.transcriptRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { include: { college: true } },
            curriculumGrades: {
              where: {
                practicalScore: { not: null },
                theoryScore: { not: null },
              },
              include: { curriculumCourse: true },
            },
          },
        },
      },
    });
  }

  findTranscriptForDownload(id: string) {
    return this.db.transcriptRequest.findUnique({
      where: { id },
      include: { student: { select: { userId: true } } },
    });
  }

  listTranscriptsByStatus(status: TranscriptRequestStatus) {
    return this.db.transcriptRequest.findMany({
      where: { status },
      orderBy: { requestedAt: 'asc' },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
  }

  updateTranscript(
    id: string,
    data: {
      status?: TranscriptRequestStatus;
      filePath?: string | null;
      rejectionReason?: string | null;
      processedAt?: Date | null;
      affairsReviewedAt?: Date | null;
      feeRefunded?: boolean;
    }
  ) {
    return this.db.transcriptRequest.update({
      where: { id },
      data,
    });
  }

  listTranscriptsForStudent(studentId: string) {
    return this.db.transcriptRequest.findMany({
      where: { studentId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  listAllTranscripts() {
    return this.db.transcriptRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
  }

  listStudents(params: {
    page: number;
    pageSize: number;
    search?: string;
    departmentId?: string;
    collegeId?: string;
    studyYear?: number;
  }) {
    const skip = (params.page - 1) * params.pageSize;
    const where: {
      departmentId?: string;
      currentSemester?: { gte: number; lte: number };
      department?: { collegeId: string };
      OR?: Array<{
        academicNumber?: { contains: string; mode: 'insensitive' };
        user?: { name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } };
      }>;
    } = {};
    if (params.departmentId) where.departmentId = params.departmentId;
    if (params.collegeId) where.department = { collegeId: params.collegeId };
    if (params.studyYear) {
      const minSem = (params.studyYear - 1) * 2 + 1;
      const maxSem = params.studyYear * 2;
      where.currentSemester = { gte: minSem, lte: maxSem };
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { academicNumber: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }
    return Promise.all([
      this.db.student.findMany({
        where,
        skip,
        take: params.pageSize,
        orderBy: { academicNumber: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true, active: true } },
          department: { include: { college: true } },
          enrollments: {
            include: { course: { select: { id: true, name: true, code: true } } },
          },
        },
      }),
      this.db.student.count({ where }),
    ]);
  }

  findStudentById(id: string) {
    return this.db.student.findUnique({
      where: { id },
      include: {
        user: true,
        department: { include: { college: true } },
        enrollments: { include: { course: true } },
      },
    });
  }

  async updateStudent(
    id: string,
    data: Partial<{
      departmentId: string;
      academicNumber: string;
      currentSemester: number;
      academicYear: string;
      userName: string;
    }>
  ) {
    const { userName, ...studentData } = data;
    if (userName) {
      const row = await this.db.student.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (row) {
        await this.db.user.update({ where: { id: row.userId }, data: { name: userName } });
      }
    }
    return this.db.student.update({
      where: { id },
      data: studentData,
      include: {
        user: { select: { id: true, name: true, email: true, active: true } },
        department: { include: { college: true } },
        enrollments: { include: { course: { select: { id: true, name: true, code: true } } } },
      },
    });
  }

  findDepartmentInCollege(departmentId: string, collegeId: string) {
    return this.db.department.findFirst({
      where: { id: departmentId, collegeId },
    });
  }

  findStudentByAcademicNumber(academicNumber: string) {
    return this.db.student.findUnique({ where: { academicNumber } });
  }

  findDepartment(id: string) {
    return this.db.department.findUnique({ where: { id } });
  }

  findUserByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  async createStudentAccount(data: {
    name: string;
    email: string;
    passwordHash: string;
    collegeId: string;
    departmentId: string;
    academicNumber: string;
    currentSemester: number;
    academicYear: string;
  }) {
    return this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.passwordHash,
          role: 'STUDENT',
          active: true,
          college: { connect: { id: data.collegeId } },
        },
      });
      const student = await tx.student.create({
        data: {
          userId: user.id,
          departmentId: data.departmentId,
          academicNumber: data.academicNumber,
          currentSemester: data.currentSemester,
          academicYear: data.academicYear,
        },
        include: {
          user: { select: { id: true, name: true, email: true, active: true } },
          department: { include: { college: true } },
          enrollments: { include: { course: { select: { id: true, name: true, code: true } } } },
        },
      });
      return student;
    });
  }

  async deactivateStudent(studentId: string) {
    const student = await this.db.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) return null;
    await this.db.user.update({
      where: { id: student.userId },
      data: { active: false },
    });
    return this.findStudentById(studentId);
  }

  async getAffairsDashboardStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalStudents, recentlyRegistered, pendingClearances, pendingTranscripts, students] =
      await Promise.all([
        this.db.student.count({ where: { user: { active: true } } }),
        this.db.user.count({
          where: { role: 'STUDENT', active: true, createdAt: { gte: thirtyDaysAgo } },
        }),
        this.db.clearanceCertificateRequest.count({ where: { status: 'PENDING' } }),
        this.db.transcriptRequest.count({ where: { status: 'PENDING' } }),
        this.db.student.findMany({
          where: { user: { active: true } },
          select: {
            currentSemester: true,
            department: {
              select: {
                collegeId: true,
                college: { select: { name: true } },
              },
            },
          },
        }),
      ]);

    const byCollege = new Map<string, { collegeId: string; collegeName: string; count: number }>();
    const byCollegeYear = new Map<
      string,
      { collegeId: string; collegeName: string; studyYear: number; count: number }
    >();

    for (const row of students) {
      const collegeId = row.department.collegeId;
      const collegeName = row.department.college.name;
      const collegeHit = byCollege.get(collegeId) ?? { collegeId, collegeName, count: 0 };
      collegeHit.count += 1;
      byCollege.set(collegeId, collegeHit);

      const studyYear = studyYearFromSemester(row.currentSemester);
      const key = `${collegeId}:${studyYear}`;
      const yearHit =
        byCollegeYear.get(key) ?? { collegeId, collegeName, studyYear, count: 0 };
      yearHit.count += 1;
      byCollegeYear.set(key, yearHit);
    }

    return {
      totalStudents,
      recentlyRegistered,
      pendingClearances,
      pendingTranscripts,
      studentsByCollege: [...byCollege.values()].sort((a, b) =>
        a.collegeName.localeCompare(b.collegeName)
      ),
      studentsByCollegeYear: [...byCollegeYear.values()].sort((a, b) =>
        a.collegeName === b.collegeName
          ? a.studyYear - b.studyYear
          : a.collegeName.localeCompare(b.collegeName)
      ),
    };
  }

  createClearanceRequest(data: {
    studentId: string;
    feeAmount: number;
    feePaid: boolean;
    paymentReference: string;
    paidAt: Date;
  }) {
    return this.db.clearanceCertificateRequest.create({
      data: {
        student: { connect: { id: data.studentId } },
        status: 'PENDING',
        feeAmount: data.feeAmount,
        feePaid: data.feePaid,
        paymentReference: data.paymentReference,
        paidAt: data.paidAt,
      },
    });
  }

  findActiveClearanceForStudent(studentId: string) {
    return this.db.clearanceCertificateRequest.findFirst({
      where: { studentId, status: 'PENDING' },
    });
  }

  findClearance(id: string) {
    return this.db.clearanceCertificateRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { include: { college: true } },
          },
        },
      },
    });
  }

  findClearanceForDownload(id: string) {
    return this.db.clearanceCertificateRequest.findUnique({
      where: { id },
      include: { student: { select: { userId: true } } },
    });
  }

  listClearancesForStudent(studentId: string) {
    return this.db.clearanceCertificateRequest.findMany({
      where: { studentId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  listAllClearances() {
    return this.db.clearanceCertificateRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { include: { college: true } },
          },
        },
      },
    });
  }

  updateClearance(
    id: string,
    data: {
      status?: ClearanceRequestStatus;
      filePath?: string | null;
      rejectionReason?: string | null;
      processedAt?: Date | null;
      processedById?: string | null;
      feeRefunded?: boolean;
    }
  ) {
    return this.db.clearanceCertificateRequest.update({
      where: { id },
      data,
    });
  }
}
