import type { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { UNIVERSITY_STRUCTURE } from './structure-data.js';

const MANAGER_PASSWORD_PLAIN = 'Password123!';

/** Stable manager email per college (not derived from truncated slug). */
const MANAGER_EMAIL_BY_COLLEGE: Record<string, string> = {
  'College of Information Engineering': 'manager.infoeng@university.edu',
  'College of Medical Engineering': 'manager.medeng@university.edu',
  'College of Alternative Energy Engineering': 'manager.altenergy@university.edu',
  'College of Health Sciences — Anesthesia': 'manager.anesthesia@university.edu',
  'College of Administrative Sciences': 'manager.admin@university.edu',
  'College of Pharmaceutical Sciences': 'manager.pharmacy@university.edu',
  'College of English Language & Literature': 'manager.english@university.edu',
};

/** One college manager account per college (upsert by email). */
export async function seedCollegeManagers(prisma: PrismaClient, passwordHash: string) {
  const managers: { email: string; name: string; collegeName: string }[] = [];

  for (const collegeSeed of UNIVERSITY_STRUCTURE) {
    const college = await prisma.college.findFirst({ where: { name: collegeSeed.name } });
    if (!college) continue;

    const email =
      MANAGER_EMAIL_BY_COLLEGE[collegeSeed.name] ??
      `manager.${collegeSeed.departments[0]?.code.toLowerCase() ?? 'college'}@university.edu`;
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
