import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { UNIVERSITY_STRUCTURE } from './structure-data.js';

const MANAGER_PASSWORD_PLAIN = 'Password123!';

/** One college manager account per college (upsert by email). */
export async function seedCollegeManagers(prisma: PrismaClient, passwordHash: string) {
  const managers: { email: string; name: string; collegeName: string }[] = [];

  for (const collegeSeed of UNIVERSITY_STRUCTURE) {
    const college = await prisma.college.findFirst({ where: { name: collegeSeed.name } });
    if (!college) continue;

    const slug = collegeSeed.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);
    const email = `manager.${slug}@university.edu`;
    const name = `Manager — ${collegeSeed.name.replace('College of ', '')}`;

    await prisma.user.upsert({
      where: { email },
      create: {
        name,
        email,
        password: passwordHash,
        role: UserRole.MANAGER,
        collegeId: college.id,
        active: true,
      },
      update: {
        name,
        role: UserRole.MANAGER,
        collegeId: college.id,
        active: true,
      },
    });

    managers.push({ email, name, collegeName: collegeSeed.name });
  }

  return managers;
}

export { MANAGER_PASSWORD_PLAIN };
