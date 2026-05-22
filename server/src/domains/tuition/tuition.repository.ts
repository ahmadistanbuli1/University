import type { PrismaClient, TuitionInstallmentStatus } from '@prisma/client';

export class TuitionRepository {
  constructor(private readonly db: PrismaClient) {}

  findStudentByUserId(userId: string) {
    return this.db.student.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { include: { college: true } },
      },
    });
  }

  findCollegeTuitionConfig(collegeId: string) {
    return this.db.collegeTuitionConfig.findUnique({ where: { collegeId } });
  }

  listMyDiscountRequests(studentId: string) {
    return this.db.discountRequest.findMany({
      where: { studentId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  findInstallment(id: string) {
    return this.db.studentTuitionInstallment.findUnique({
      where: { id },
      include: { student: true },
    });
  }

  listInstallments(studentId: string) {
    return this.db.studentTuitionInstallment.findMany({
      where: { studentId },
      orderBy: [{ academicYear: 'asc' }, { semesterKey: 'asc' }],
    });
  }

  listPayments(studentId: string) {
    return this.db.tuitionPayment.findMany({
      where: { studentId },
      orderBy: { paidAt: 'desc' },
      include: { installment: true },
    });
  }

  async updateInstallmentPaid(
    installmentId: string,
    addAmount: number,
    newStatus: TuitionInstallmentStatus
  ) {
    const inst = await this.db.studentTuitionInstallment.findUniqueOrThrow({
      where: { id: installmentId },
    });
    const newPaid = Number(inst.amountPaid) + addAmount;
    return this.db.studentTuitionInstallment.update({
      where: { id: installmentId },
      data: { amountPaid: newPaid, status: newStatus },
    });
  }

  createPayment(data: {
    studentId: string;
    installmentId: string;
    amount: number;
    referenceCode: string;
  }) {
    return this.db.tuitionPayment.create({
      data: {
        studentId: data.studentId,
        installmentId: data.installmentId,
        amount: data.amount,
        referenceCode: data.referenceCode,
      },
    });
  }

  createDiscountRequest(data: {
    studentId: string;
    type: 'MARTYR_RELATIVE' | 'ACADEMIC_EXCELLENCE' | 'HUMANITARIAN';
    notes?: string;
    proofFilePath?: string;
  }) {
    return this.db.discountRequest.create({ data });
  }

  listDiscountRequests(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.db.discountRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { submittedAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  findDiscountRequest(id: string) {
    return this.db.discountRequest.findUnique({
      where: { id },
      include: { student: true },
    });
  }

  updateDiscountRequest(
    id: string,
    data: {
      status: 'APPROVED' | 'REJECTED';
      discountPercent?: number | null;
      discountAmount?: number | null;
      adminResponse?: string | null;
      reviewedAt: Date;
    }
  ) {
    return this.db.discountRequest.update({ where: { id }, data });
  }

  async reducePendingInstallmentDues(studentId: string, totalDiscount: number) {
    const pending = await this.db.studentTuitionInstallment.findMany({
      where: { studentId, status: { in: ['PENDING', 'PARTIAL'] } },
      orderBy: { semesterKey: 'asc' },
    });
    let remaining = totalDiscount;
    for (const inst of pending) {
      if (remaining <= 0) break;
      const due = Number(inst.amountDue) - Number(inst.amountPaid);
      const cut = Math.min(remaining, due);
      const newDue = Math.max(0, Number(inst.amountDue) - cut);
      remaining -= cut;
      await this.db.studentTuitionInstallment.update({
        where: { id: inst.id },
        data: { amountDue: newDue },
      });
    }
  }
}
