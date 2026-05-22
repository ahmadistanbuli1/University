import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { StudentServicesRepository } from './studentServices.repository.js';
import type { AuditService } from '../audit/audit.service.js';

export class StudentServicesService {
  constructor(
    private readonly repo: StudentServicesRepository,
    private readonly audit: AuditService | null
  ) {}

  async submitAppeal(userId: string, role: UserRole, input: { examResultId: string; reason: string }) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) {
      throw new AppError(403, 'Student profile required');
    }
    const exam = await this.repo.findExamResult(input.examResultId);
    if (!exam || exam.studentId !== student.id) {
      throw new AppError(403, 'Invalid exam result');
    }
    const appeal = await this.repo.createAppeal({
      studentId: student.id,
      examResultId: input.examResultId,
      reason: input.reason,
    });
    await this.audit?.log({
      userId,
      action: 'CREATE_APPEAL',
      entity: 'grade_appeals',
      entityId: appeal.id,
    });
    return appeal;
  }

  async listAppeals(_adminId: string) {
    return this.repo.listAppeals('PENDING');
  }

  async listMyAppeals(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) return [];
    return this.repo.listAppealsForStudent(student.id);
  }

  async updateAppealStatus(
    adminId: string,
    appealId: string,
    input: { status: 'APPROVED' | 'REJECTED'; adminResponse?: string }
  ) {
    const appeal = await this.repo.findAppeal(appealId);
    if (!appeal) {
      throw new AppError(404, 'Appeal not found');
    }
    if (appeal.status !== 'PENDING') {
      throw new AppError(400, 'Appeal already processed');
    }
    const updated = await this.repo.updateAppeal(appealId, {
      status: input.status,
      adminResponse: input.adminResponse ?? null,
    });
    await this.audit?.log({
      userId: adminId,
      action: 'UPDATE_APPEAL',
      entity: 'grade_appeals',
      entityId: appealId,
      details: { status: input.status },
    });
    return updated;
  }

  async requestTranscript(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) {
      throw new AppError(403, 'Student profile required');
    }
    const req = await this.repo.createTranscriptRequest(student.id);
    await this.audit?.log({
      userId,
      action: 'REQUEST_TRANSCRIPT',
      entity: 'transcript_requests',
      entityId: req.id,
    });
    return req;
  }

  async fulfillTranscript(
    affairsUserId: string,
    role: UserRole,
    id: string,
    input: { filePath: string; status: 'DELIVERED' | 'PROCESSED' }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const tr = await this.repo.findTranscript(id);
    if (!tr) {
      throw new AppError(404, 'Transcript request not found');
    }
    const updated = await this.repo.updateTranscript(id, {
      filePath: input.filePath,
      status: input.status,
      processedAt: new Date(),
    });
    await this.audit?.log({
      userId: affairsUserId,
      action: 'UPDATE_TRANSCRIPT',
      entity: 'transcript_requests',
      entityId: id,
    });
    return updated;
  }

  async listMyTranscripts(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) {
      return [];
    }
    return this.repo.listTranscriptsForStudent(student.id);
  }

  async listAllTranscripts(role: UserRole) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.listAllTranscripts();
  }

  async listStudents(
    role: UserRole,
    params: { page: number; pageSize: number; search?: string; departmentId?: string }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const [items, total] = await this.repo.listStudents(params);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async updateStudentProfile(
    role: UserRole,
    studentId: string,
    updates: {
      departmentId?: string;
      academicNumber?: string;
      currentSemester?: number;
      academicYear?: string;
    }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentById(studentId);
    if (!student) {
      throw new AppError(404, 'Student not found');
    }
    if (updates.academicNumber && updates.academicNumber !== student.academicNumber) {
      const dup = await this.repo.findStudentByAcademicNumber(updates.academicNumber);
      if (dup && dup.id !== studentId) {
        throw new AppError(409, 'Academic number already in use');
      }
    }
    if (updates.departmentId) {
      const dept = await this.repo.findDepartment(updates.departmentId);
      if (!dept) {
        throw new AppError(400, 'Invalid department');
      }
    }
    return this.repo.updateStudent(studentId, updates);
  }
}
