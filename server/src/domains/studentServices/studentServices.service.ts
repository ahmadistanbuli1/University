import path from 'node:path';
import fs from 'node:fs';
import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import { buildTranscriptPdfData } from '../../lib/transcript-data.js';
import { getServiceFees } from '../../lib/financial-settings.js';
import { generateTranscriptPdf } from '../../lib/transcript-pdf.js';
import { generateClearancePdf } from '../../lib/clearance-pdf.js';
import { generateStudentProfilePdf } from '../../lib/student-profile-pdf.js';
import { prisma } from '../../lib/prisma.js';
import { maxStudyYearsForDepartment } from '../../lib/dept-study-years.js';
import {
  normalizeRegistrationSemester,
  syncStudentDepartmentEnrollments,
} from '../../lib/student-enrollment.js';
import { ensureStudentTuitionInstallments } from '../../lib/tuition-bootstrap.js';
import { hashPassword } from '../../utils/password.js';
import { studyYearFromSemester } from '../academic/study-plan.js';
import type { StudentServicesRepository } from './studentServices.repository.js';
import type { AuditService } from '../audit/audit.service.js';
import type { NotificationDispatchService } from '../notifications/notification.service.js';

export class StudentServicesService {
  constructor(
    private readonly repo: StudentServicesRepository,
    private readonly audit: AuditService | null,
    private readonly uploadDir: string,
    private readonly notify: NotificationDispatchService | null
  ) {}

  async submitAppeal(userId: string, role: UserRole, input: { examResultId: string; reason: string }) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserIdWithUser(userId);
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
    await this.notify?.notifyAppealSubmitted(student.user.name);
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
    await this.notify?.notifyAppealResolved(appeal.student.userId, input.status);
    return updated;
  }

  async requestTranscript(
    userId: string,
    role: UserRole,
    input: { confirmPayment: true }
  ) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    if (!input.confirmPayment) {
      throw new AppError(400, 'Payment confirmation required');
    }
    const student = await this.repo.findStudentByUserIdWithUser(userId);
    if (!student) {
      throw new AppError(403, 'Student profile required');
    }
    const active = await this.repo.findActiveTranscriptForStudent(student.id);
    if (active) {
      throw new AppError(409, 'You already have an active transcript request');
    }
    const paymentReference = `TR-${Date.now().toString(36).toUpperCase()}`;
    const paidAt = new Date();
    const { transcriptFee } = await getServiceFees(prisma);
    const req = await this.repo.createTranscriptRequest({
      studentId: student.id,
      feeAmount: transcriptFee,
      feePaid: true,
      paymentReference,
      paidAt,
    });
    await this.audit?.log({
      userId,
      action: 'REQUEST_TRANSCRIPT',
      entity: 'transcript_requests',
      entityId: req.id,
      details: { feeAmount: transcriptFee, paymentReference },
    });
    await this.notify?.notifyTranscriptRequested(student.user.name);
    return req;
  }

  async processTranscript(
    processorUserId: string,
    role: UserRole,
    id: string,
    input: { action: 'approve' | 'reject'; rejectionReason?: string }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }

    const tr = await this.repo.findTranscriptWithStudent(id);
    if (!tr) {
      throw new AppError(404, 'Transcript request not found');
    }
    if (tr.status !== 'PENDING') {
      throw new AppError(400, 'Request already processed');
    }
    if (!tr.feePaid) {
      throw new AppError(400, 'Transcript fee not paid');
    }

    if (input.action === 'reject') {
      const reason = input.rejectionReason?.trim();
      if (!reason || reason.length < 3) {
        throw new AppError(400, 'Rejection reason is required');
      }
      const updated = await this.repo.updateTranscript(id, {
        status: 'REJECTED',
        rejectionReason: reason,
        affairsReviewedAt: new Date(),
        processedAt: new Date(),
        filePath: null,
        feeRefunded: true,
      });
      await this.audit?.log({
        userId: processorUserId,
        action: 'REJECT_TRANSCRIPT',
        entity: 'transcript_requests',
        entityId: id,
      });
      await this.notify?.notifyTranscriptRejected(
        tr.student.userId,
        reason,
        tr.feeAmount
      );
      return updated;
    }

    if (tr.student.curriculumGrades.length === 0) {
      throw new AppError(
        400,
        'No graded courses on record. Student must have curriculum grades before approval.'
      );
    }

    const updated = await this.repo.updateTranscript(id, {
      status: 'AFFAIRS_APPROVED',
      rejectionReason: null,
      affairsReviewedAt: new Date(),
    });

    await this.audit?.log({
      userId: processorUserId,
      action: 'APPROVE_TRANSCRIPT_AFFAIRS',
      entity: 'transcript_requests',
      entityId: id,
    });
    await this.notify?.notifyTranscriptAffairsApproved(tr.student.userId);
    await this.notify?.notifyExamOfficerTranscriptQueued(
      tr.student.user.name,
      tr.student.user.email
    );

    return updated;
  }

  async fulfillTranscript(processorUserId: string, role: UserRole, id: string) {
    if (role !== 'EXAM_OFFICER' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }

    const tr = await this.repo.findTranscriptWithStudent(id);
    if (!tr) {
      throw new AppError(404, 'Transcript request not found');
    }
    if (tr.status !== 'AFFAIRS_APPROVED') {
      throw new AppError(400, 'Request is not ready for transcript generation');
    }

    if (tr.student.curriculumGrades.length === 0) {
      throw new AppError(400, 'No graded courses on record for this student');
    }

    const pdfData = buildTranscriptPdfData({
      academicNumber: tr.student.academicNumber,
      academicYear: tr.student.academicYear,
      currentSemester: tr.student.currentSemester,
      user: { name: tr.student.user.name },
      department: {
        name: tr.student.department.name,
        college: { name: tr.student.department.college.name },
      },
      curriculumGrades: tr.student.curriculumGrades.map((g) => ({
        practicalScore: g.practicalScore!,
        theoryScore: g.theoryScore!,
        curriculumCourse: g.curriculumCourse,
      })),
    });
    const fileName = `transcript-${id}.pdf`;
    const transcriptsDir = path.join(this.uploadDir, 'transcripts');
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true });
    }
    const absolutePath = path.join(transcriptsDir, fileName);
    await generateTranscriptPdf(pdfData, absolutePath);

    const filePath = `/uploads/transcripts/${fileName}`;
    const updated = await this.repo.updateTranscript(id, {
      status: 'DELIVERED',
      filePath,
      processedAt: new Date(),
    });

    await this.audit?.log({
      userId: processorUserId,
      action: 'DELIVER_TRANSCRIPT',
      entity: 'transcript_requests',
      entityId: id,
      details: { filePath },
    });
    await this.notify?.notifyTranscriptReady(tr.student.userId);

    return updated;
  }

  async getTranscriptFile(
    userId: string,
    role: UserRole,
    requestId: string
  ): Promise<{ absolutePath: string; fileName: string }> {
    const tr = await this.repo.findTranscriptForDownload(requestId);
    if (!tr) {
      throw new AppError(404, 'Transcript request not found');
    }
    if (tr.status !== 'DELIVERED' || !tr.filePath) {
      throw new AppError(400, 'Transcript file is not available');
    }

    const isOwner = tr.student.userId === userId;
    const isStaff =
      role === 'AFFAIRS' || role === 'ADMIN' || role === 'EXAM_OFFICER';
    if (!isOwner && !isStaff) {
      throw new AppError(403, 'Forbidden');
    }

    const relative = tr.filePath.replace(/^\/uploads\/?/, '');
    const absolutePath = path.resolve(this.uploadDir, relative);
    if (!absolutePath.startsWith(path.resolve(this.uploadDir))) {
      throw new AppError(400, 'Invalid file path');
    }
    if (!fs.existsSync(absolutePath)) {
      throw new AppError(404, 'Transcript file missing on server');
    }

    return { absolutePath, fileName: path.basename(absolutePath) };
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

  async listExamOfficerTranscripts(role: UserRole) {
    if (role !== 'EXAM_OFFICER' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.listTranscriptsByStatus('AFFAIRS_APPROVED');
  }

  async listStudents(
    role: UserRole,
    collegeId: string | null,
    params: {
      page: number;
      pageSize: number;
      search?: string;
      departmentId?: string;
      studyYear?: number;
    }
  ) {
    if (role === 'MANAGER') {
      if (!collegeId) {
        throw new AppError(403, 'College not assigned');
      }
      if (params.departmentId) {
        const inCollege = await this.repo.findDepartmentInCollege(
          params.departmentId,
          collegeId
        );
        if (!inCollege) {
          throw new AppError(403, 'Department not in your college');
        }
      }
      const [items, total] = await this.repo.listStudents({ ...params, collegeId });
      return { items, total, page: params.page, pageSize: params.pageSize };
    }
    if (role !== 'AFFAIRS' && role !== 'ADMIN' && role !== 'EXAM_OFFICER') {
      throw new AppError(403, 'Forbidden');
    }
    const [items, total] = await this.repo.listStudents(params);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async updateStudentProfile(
    actorUserId: string,
    role: UserRole,
    collegeId: string | null,
    studentId: string,
    updates: {
      name?: string;
      departmentId?: string;
      academicNumber?: string;
      currentSemester?: number;
      academicYear?: string;
    }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN' && role !== 'MANAGER') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentById(studentId);
    if (!student) {
      throw new AppError(404, 'Student not found');
    }
    if (role === 'MANAGER') {
      if (!collegeId || student.department.collegeId !== collegeId) {
        throw new AppError(403, 'Student not in your college');
      }
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
      if (role === 'MANAGER' && collegeId && dept.collegeId !== collegeId) {
        throw new AppError(403, 'Cannot move student outside your college');
      }
    }
    const { name, ...rest } = updates;
    const updated = await this.repo.updateStudent(studentId, {
      ...rest,
      userName: name,
    });

    if (updates.departmentId && updates.departmentId !== student.departmentId) {
      await syncStudentDepartmentEnrollments(prisma, {
        studentId,
        departmentId: updates.departmentId,
        academicYear: updates.academicYear ?? student.academicYear,
      });
    }

    if (role === 'AFFAIRS' || role === 'ADMIN' || role === 'MANAGER') {
      await this.audit?.log({
        userId: actorUserId,
        action: 'UPDATE_STUDENT_RECORD',
        entity: 'students',
        entityId: studentId,
        details: {
          studentName: updated.user?.name ?? name,
          academicNumber: updated.academicNumber,
          fields: Object.keys(updates),
        },
      });
    }

    return updated;
  }

  async getAffairsDashboard(role: UserRole) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.getAffairsDashboardStats();
  }

  async createStudent(
    actorUserId: string,
    role: UserRole,
    input: {
      name: string;
      email: string;
      password: string;
      departmentId: string;
      academicNumber: string;
      currentSemester: number;
      academicYear: string;
    }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }

    const existingEmail = await this.repo.findUserByEmail(input.email);
    if (existingEmail) {
      throw new AppError(409, 'Email already registered');
    }
    const dup = await this.repo.findStudentByAcademicNumber(input.academicNumber);
    if (dup) {
      throw new AppError(409, 'Academic number already in use');
    }
    const dept = await this.repo.findDepartment(input.departmentId);
    if (!dept) {
      throw new AppError(400, 'Invalid department');
    }

    const currentSemester = normalizeRegistrationSemester(
      input.currentSemester,
      maxStudyYearsForDepartment(dept.code)
    );
    const passwordHash = await hashPassword(input.password);

    const student = await this.repo.createStudentAccount({
      name: input.name,
      email: input.email,
      passwordHash,
      collegeId: dept.collegeId,
      departmentId: dept.id,
      academicNumber: input.academicNumber,
      currentSemester,
      academicYear: input.academicYear,
    });

    await syncStudentDepartmentEnrollments(prisma, {
      studentId: student.id,
      departmentId: dept.id,
      academicYear: input.academicYear,
    });
    await ensureStudentTuitionInstallments(
      prisma,
      student.id,
      dept.collegeId,
      input.academicYear
    );

    await this.audit?.log({
      userId: actorUserId,
      action: 'CREATE_STUDENT',
      entity: 'students',
      entityId: student.id,
      details: {
        studentName: input.name,
        academicNumber: input.academicNumber,
        departmentId: dept.id,
      },
    });

    const refreshed = await this.repo.findStudentById(student.id);
    return refreshed ?? student;
  }

  async deleteStudent(actorUserId: string, role: UserRole, studentId: string) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentById(studentId);
    if (!student) {
      throw new AppError(404, 'Student not found');
    }
    if (!student.user.active) {
      throw new AppError(400, 'Student account is already inactive');
    }

    const updated = await this.repo.deactivateStudent(studentId);
    await this.audit?.log({
      userId: actorUserId,
      action: 'DEACTIVATE_STUDENT',
      entity: 'students',
      entityId: studentId,
      details: {
        studentName: student.user.name,
        academicNumber: student.academicNumber,
      },
    });
    return updated;
  }

  async getStudentProfilePdf(
    role: UserRole,
    collegeId: string | null,
    studentId: string
  ): Promise<{ absolutePath: string; fileName: string }> {
    if (role !== 'AFFAIRS' && role !== 'ADMIN' && role !== 'MANAGER') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentById(studentId);
    if (!student) {
      throw new AppError(404, 'Student not found');
    }
    if (role === 'MANAGER') {
      if (!collegeId || student.department.collegeId !== collegeId) {
        throw new AppError(403, 'Student not in your college');
      }
    }

    const studyYear = studyYearFromSemester(student.currentSemester);
    const profilesDir = path.join(this.uploadDir, 'profiles');
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }
    const fileName = `student-profile-${student.academicNumber}.pdf`;
    const absolutePath = path.join(profilesDir, fileName);

    await generateStudentProfilePdf(
      {
        universityName: 'University Web System',
        studentName: student.user.name,
        email: student.user.email,
        academicNumber: student.academicNumber,
        collegeName: student.department.college.name,
        departmentName: student.department.name,
        academicYear: student.academicYear,
        studyYearLabel: `Year ${studyYear}`,
        currentSemester: student.currentSemester,
        enrolledCourses: student.enrollments.map(
          (e) => `${e.course.code} — ${e.course.name}`
        ),
        accountActive: student.user.active,
        issuedAt: new Date(),
      },
      absolutePath
    );

    return { absolutePath, fileName };
  }

  async requestClearance(userId: string, role: UserRole, input: { confirmPayment: true }) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    if (!input.confirmPayment) {
      throw new AppError(400, 'Payment confirmation required');
    }
    const student = await this.repo.findStudentByUserIdWithUser(userId);
    if (!student) {
      throw new AppError(403, 'Student profile required');
    }
    const active = await this.repo.findActiveClearanceForStudent(student.id);
    if (active) {
      throw new AppError(409, 'You already have an active clearance request');
    }
    const paymentReference = `CL-${Date.now().toString(36).toUpperCase()}`;
    const paidAt = new Date();
    const { clearanceFee } = await getServiceFees(prisma);
    const req = await this.repo.createClearanceRequest({
      studentId: student.id,
      feeAmount: clearanceFee,
      feePaid: true,
      paymentReference,
      paidAt,
    });
    await this.audit?.log({
      userId,
      action: 'REQUEST_CLEARANCE',
      entity: 'clearance_certificate_requests',
      entityId: req.id,
      details: { feeAmount: clearanceFee, paymentReference },
    });
    await this.notify?.notifyClearanceRequested(student.user.name);
    return req;
  }

  async listMyClearances(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) return [];
    return this.repo.listClearancesForStudent(student.id);
  }

  async listAllClearances(role: UserRole) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.listAllClearances();
  }

  async processClearance(
    processorUserId: string,
    role: UserRole,
    id: string,
    input: { action: 'reject'; rejectionReason?: string }
  ) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const row = await this.repo.findClearance(id);
    if (!row) {
      throw new AppError(404, 'Clearance request not found');
    }
    if (row.status !== 'PENDING') {
      throw new AppError(400, 'Request already processed');
    }
    if (!row.feePaid) {
      throw new AppError(400, 'Clearance fee not paid');
    }

    const reason = input.rejectionReason?.trim();
    if (!reason || reason.length < 3) {
      throw new AppError(400, 'Rejection reason is required');
    }

    const updated = await this.repo.updateClearance(id, {
      status: 'REJECTED',
      rejectionReason: reason,
      processedAt: new Date(),
      processedById: processorUserId,
      filePath: null,
      feeRefunded: true,
    });
    await this.audit?.log({
      userId: processorUserId,
      action: 'REJECT_CLEARANCE',
      entity: 'clearance_certificate_requests',
      entityId: id,
    });
    await this.notify?.notifyClearanceRejected(
      row.student.userId,
      reason,
      row.feeAmount
    );
    return updated;
  }

  async deliverClearance(processorUserId: string, role: UserRole, id: string) {
    if (role !== 'AFFAIRS' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const row = await this.repo.findClearance(id);
    if (!row) {
      throw new AppError(404, 'Clearance request not found');
    }
    if (row.status !== 'PENDING') {
      throw new AppError(400, 'Request already processed');
    }
    if (!row.feePaid) {
      throw new AppError(400, 'Clearance fee not paid');
    }

    const clearancesDir = path.join(this.uploadDir, 'clearances');
    if (!fs.existsSync(clearancesDir)) {
      fs.mkdirSync(clearancesDir, { recursive: true });
    }
    const fileName = `clearance-${id}.pdf`;
    const absolutePath = path.join(clearancesDir, fileName);
    const issuedAt = new Date();

    await generateClearancePdf(
      {
        studentName: row.student.user.name,
        academicNumber: row.student.academicNumber,
        collegeName: row.student.department.college.name,
        departmentName: row.student.department.name,
        academicYear: row.student.academicYear,
        currentSemester: row.student.currentSemester,
        issuedAt,
      },
      absolutePath
    );

    const filePath = `/uploads/clearances/${fileName}`;
    const updated = await this.repo.updateClearance(id, {
      status: 'DELIVERED',
      filePath,
      rejectionReason: null,
      processedAt: issuedAt,
      processedById: processorUserId,
    });
    await this.audit?.log({
      userId: processorUserId,
      action: 'DELIVER_CLEARANCE',
      entity: 'clearance_certificate_requests',
      entityId: id,
      details: { filePath },
    });
    await this.notify?.notifyClearanceReady(row.student.userId);
    return updated;
  }

  async getClearanceFile(
    userId: string,
    role: UserRole,
    requestId: string
  ): Promise<{ absolutePath: string; fileName: string }> {
    const row = await this.repo.findClearanceForDownload(requestId);
    if (!row) {
      throw new AppError(404, 'Clearance request not found');
    }
    if (row.status !== 'DELIVERED' || !row.filePath) {
      throw new AppError(400, 'Clearance file is not available');
    }

    const isOwner = row.student.userId === userId;
    const isStaff = role === 'AFFAIRS' || role === 'ADMIN';
    if (!isOwner && !isStaff) {
      throw new AppError(403, 'Forbidden');
    }

    const relative = row.filePath.replace(/^\/uploads\/?/, '');
    const absolutePath = path.resolve(this.uploadDir, relative);
    if (!absolutePath.startsWith(path.resolve(this.uploadDir))) {
      throw new AppError(400, 'Invalid file path');
    }
    if (!fs.existsSync(absolutePath)) {
      throw new AppError(404, 'Clearance file missing on server');
    }

    return { absolutePath, fileName: path.basename(absolutePath) };
  }

  getServiceFees() {
    return getServiceFees(prisma);
  }
}
