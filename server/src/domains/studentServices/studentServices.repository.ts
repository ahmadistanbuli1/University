import type { GradeAppealStatus, PrismaClient, TranscriptRequestStatus } from '@prisma/client';

export class StudentServicesRepository {
  constructor(private readonly db: PrismaClient) {}

  findStudentByUserId(userId: string) {
    return this.db.student.findUnique({ where: { userId } });
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
    return this.db.gradeAppeal.findUnique({ where: { id } });
  }

  createTranscriptRequest(studentId: string) {
    return this.db.transcriptRequest.create({
      data: {
        student: { connect: { id: studentId } },
        status: 'PENDING',
      },
    });
  }

  findTranscript(id: string) {
    return this.db.transcriptRequest.findUnique({ where: { id }, include: { student: true } });
  }

  updateTranscript(
    id: string,
    data: { status?: TranscriptRequestStatus; filePath?: string | null; processedAt?: Date | null }
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
}
