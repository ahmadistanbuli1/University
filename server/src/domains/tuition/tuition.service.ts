import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { AuditService } from '../audit/audit.service.js';
import type { TuitionRepository } from './tuition.repository.js';

function installmentStatus(amountDue: number, amountPaid: number): 'PENDING' | 'PARTIAL' | 'PAID' {
  if (amountPaid <= 0) return 'PENDING';
  if (amountPaid >= amountDue - 0.01) return 'PAID';
  return 'PARTIAL';
}

function genReference() {
  return `SPU-PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export class TuitionService {
  constructor(
    private readonly repo: TuitionRepository,
    private readonly audit: AuditService | null
  ) {}

  async getMySummary(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) {
      return {
        totalDue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        overallStatus: 'PAID' as const,
        installments: [],
        collegeConfig: null,
      };
    }

    const installments = await this.repo.listInstallments(student.id);
    let totalDue = 0;
    let totalPaid = 0;
    const rows = installments.map((i: (typeof installments)[number]) => {
      const due = Number(i.amountDue);
      const paid = Number(i.amountPaid);
      totalDue += due;
      totalPaid += paid;
      return {
        id: i.id,
        academicYear: i.academicYear,
        semesterKey: i.semesterKey,
        label: i.label,
        amountDue: due,
        amountPaid: paid,
        remaining: Math.max(0, due - paid),
        status: i.status,
      };
    });

    const collegeConfig = await this.repo.findCollegeTuitionConfig(student.department.collegeId);

    const totalRemaining = Math.max(0, totalDue - totalPaid);
    const overallStatus =
      totalRemaining <= 0 ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'PENDING';

    return {
      totalDue,
      totalPaid,
      totalRemaining,
      overallStatus,
      installments: rows,
      collegeConfig: collegeConfig
        ? {
            totalAmount: Number(collegeConfig.totalAmount),
            semesterAmount: Number(collegeConfig.semesterAmount),
          }
        : { totalAmount: 1000, semesterAmount: 500 },
    };
  }

  async getInstallmentForPay(userId: string, role: UserRole, installmentId: string) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) throw new AppError(403, 'Student profile required');

    const inst = await this.repo.findInstallment(installmentId);
    if (!inst || inst.studentId !== student.id) {
      throw new AppError(404, 'Installment not found');
    }

    const due = Number(inst.amountDue);
    const paid = Number(inst.amountPaid);
    return {
      installment: {
        id: inst.id,
        label: inst.label,
        academicYear: inst.academicYear,
        amountDue: due,
        amountPaid: paid,
        remaining: Math.max(0, due - paid),
        status: inst.status,
      },
      student: {
        name: student.user.name,
        academicNumber: student.academicNumber,
      },
    };
  }

  async simulatePayment(userId: string, role: UserRole, installmentId: string) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) throw new AppError(403, 'Student profile required');

    const inst = await this.repo.findInstallment(installmentId);
    if (!inst || inst.studentId !== student.id) {
      throw new AppError(404, 'Installment not found');
    }

    const due = Number(inst.amountDue);
    const paid = Number(inst.amountPaid);
    const remaining = Math.max(0, due - paid);
    if (remaining <= 0) {
      throw new AppError(400, 'Installment already paid');
    }

    const referenceCode = genReference();
    await this.repo.createPayment({
      studentId: student.id,
      installmentId: inst.id,
      amount: remaining,
      referenceCode,
    });

    const newPaid = paid + remaining;
    const status = installmentStatus(due, newPaid);
    await this.repo.updateInstallmentPaid(inst.id, remaining, status);

    await this.audit?.log({
      userId,
      action: 'TUITION_PAYMENT',
      entity: 'tuition_payments',
      entityId: referenceCode,
      details: { installmentId, amount: remaining },
    });

    return {
      success: true,
      referenceCode,
      amountPaid: remaining,
      paidAt: new Date().toISOString(),
      installmentStatus: status,
    };
  }

  async submitDiscountRequest(
    userId: string,
    role: UserRole,
    input: { type: 'MARTYR_RELATIVE' | 'ACADEMIC_EXCELLENCE' | 'HUMANITARIAN'; notes?: string },
    proofFilePath?: string
  ) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) throw new AppError(403, 'Student profile required');

    const req = await this.repo.createDiscountRequest({
      studentId: student.id,
      type: input.type,
      notes: input.notes,
      proofFilePath,
    });

    await this.audit?.log({
      userId,
      action: 'DISCOUNT_REQUEST',
      entity: 'discount_requests',
      entityId: req.id,
    });

    return req;
  }

  async listDiscountRequests(role: UserRole) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.repo.listDiscountRequests();
  }

  async listMyDiscountRequests(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) return [];
    return this.repo.listMyDiscountRequests(student.id);
  }

  async reviewDiscountRequest(
    adminId: string,
    role: UserRole,
    id: string,
    input: {
      status: 'APPROVED' | 'REJECTED';
      discountPercent?: number;
      discountAmount?: number;
      adminResponse?: string;
    }
  ) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }

    const existing = await this.repo.findDiscountRequest(id);
    if (!existing) throw new AppError(404, 'Request not found');
    if (existing.status !== 'PENDING') {
      throw new AppError(400, 'Request already reviewed');
    }

    let discountAmount: number | null = null;
    let discountPercent: number | null = null;

    if (input.status === 'APPROVED') {
      discountPercent = input.discountPercent ?? null;
      discountAmount = input.discountAmount ?? null;
      if (discountPercent != null && discountAmount == null) {
        const installments = await this.repo.listInstallments(existing.studentId);
        const base = installments.reduce(
          (s: number, i: (typeof installments)[number]) => s + Number(i.amountDue),
          0
        );
        discountAmount = Math.round((base * discountPercent) / 100);
      }
      if (discountAmount != null && discountAmount > 0) {
        await this.repo.reducePendingInstallmentDues(existing.studentId, discountAmount);
      }
    }

    const updated = await this.repo.updateDiscountRequest(id, {
      status: input.status,
      discountPercent,
      discountAmount,
      adminResponse: input.adminResponse ?? null,
      reviewedAt: new Date(),
    });

    await this.audit?.log({
      userId: adminId,
      action: 'REVIEW_DISCOUNT',
      entity: 'discount_requests',
      entityId: id,
      details: { status: input.status },
    });

    return updated;
  }
}
