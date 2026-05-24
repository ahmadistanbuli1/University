import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';

const EXAM_OFFICER_EMAIL = 'exams@university.edu';

export async function seedExamOfficer(prisma: PrismaClient, passwordHash: string) {
  const existing = await prisma.user.findUnique({ where: { email: EXAM_OFFICER_EMAIL } });
  if (existing) {
    await prisma.user.update({
      where: { email: EXAM_OFFICER_EMAIL },
      data: { role: UserRole.EXAM_OFFICER, password: passwordHash, active: true },
    });
  } else {
    await prisma.user.create({
      data: {
        name: 'موظف الامتحانات',
        email: EXAM_OFFICER_EMAIL,
        password: passwordHash,
        role: UserRole.EXAM_OFFICER,
      },
    });
  }
  return { email: EXAM_OFFICER_EMAIL };
}
