import type { PrismaClient } from '@prisma/client';
import {
  ensureCollegeTuitionConfigs,
  ensureStudentTuitionInstallments,
} from '../src/lib/tuition-bootstrap.js';

export async function seedTuitionAndDiscounts(prisma: PrismaClient) {
  await ensureCollegeTuitionConfigs(prisma);

  const students = await prisma.student.findMany({
    include: { department: true, user: true },
  });

  for (const s of students) {
    await ensureStudentTuitionInstallments(
      prisma,
      s.id,
      s.department.collegeId,
      s.academicYear
    );
  }

  const firstStudent = students[0];
  if (firstStudent) {
    const inst1 = await prisma.studentTuitionInstallment.findFirst({
      where: { studentId: firstStudent.id, semesterKey: 'semester-1' },
    });
    const demoRef = 'SPU-PAY-DEMO-SEM1-PARTIAL';
    if (inst1) {
      await prisma.tuitionPayment.upsert({
        where: { referenceCode: demoRef },
        create: {
          studentId: firstStudent.id,
          installmentId: inst1.id,
          amount: 250,
          referenceCode: demoRef,
        },
        update: {
          studentId: firstStudent.id,
          installmentId: inst1.id,
          amount: 250,
        },
      });
      if (Number(inst1.amountPaid) < 250) {
        await prisma.studentTuitionInstallment.update({
          where: { id: inst1.id },
          data: { amountPaid: 250, status: 'PARTIAL' },
        });
      }
    }

    const existingDiscount = await prisma.discountRequest.findFirst({
      where: { studentId: firstStudent.id },
    });
    if (!existingDiscount) {
      await prisma.discountRequest.create({
        data: {
          studentId: firstStudent.id,
          type: 'ACADEMIC_EXCELLENCE',
          notes: 'Dean’s list certificate attached (demo).',
          status: 'PENDING',
        },
      });
    }
  }

  const secondStudent = students[1];
  if (secondStudent) {
    const approved = await prisma.discountRequest.findFirst({
      where: { studentId: secondStudent.id, status: 'APPROVED' },
    });
    if (!approved) {
      await prisma.discountRequest.create({
        data: {
          studentId: secondStudent.id,
          type: 'HUMANITARIAN',
          notes: 'Family hardship documentation (demo).',
          status: 'APPROVED',
          discountPercent: 10,
          discountAmount: 100,
          adminResponse: 'Approved 10% tuition reduction for this academic year.',
          reviewedAt: new Date(),
        },
      });
      await ensureStudentTuitionInstallments(
        prisma,
        secondStudent.id,
        secondStudent.department.collegeId,
        secondStudent.academicYear
      );
    }
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    const tuitionNews = await prisma.news.findFirst({
      where: { category: 'TUITION', title: { contains: 'Second semester' } },
    });
    if (!tuitionNews) {
      await prisma.news.create({
        data: {
          title: 'Second semester tuition payment is open',
          summary: 'Tuition for the second semester ($500) is now due via the student portal.',
          content:
            'Tuition for the second semester ($500) is now due. Please complete payment through the student portal.',
          category: 'TUITION',
          enablePayNow: true,
          tuitionSemesterKey: 'semester-2',
          authorId: admin.id,
        },
      });
      await prisma.news.create({
        data: {
          title: 'بدأ تسديد أقساط الفصل الثاني',
          summary: 'بدء فترة تسديد أقساط الفصل الدراسي الثاني عبر بوابة الطالب.',
          content:
            'يسر الجامعة إعلام الطلبة ببدء فترة تسديد أقساط الفصل الدراسي الثاني. يمكنكم الدفع عبر بوابة الطالب.',
          category: 'TUITION',
          enablePayNow: true,
          tuitionSemesterKey: 'semester-2',
          authorId: admin.id,
        },
      });
    }
  }

  console.log('Tuition, payments, discounts, and tuition news seeded.');
}
