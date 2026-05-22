import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedCollegeManagers } from './seed-managers.js';
import { seedUniversityStructure } from './seed-structure.js';
import { SEED_STUDENT_PASSWORD } from './seed-students-data.js';
import { seedStudentsAndAcademics } from './seed-students.js';
import { seedTuitionAndDiscounts } from './seed-tuition.js';
import { seedLibraryBooks } from './seed-library.js';
import { seedCurriculum } from './seed-curriculum.js';

const prisma = new PrismaClient();

async function seedStaffAndContent(password: string) {
  const deptInfoEng = await prisma.department.findUniqueOrThrow({ where: { code: 'INFO_ENG' } });
  const collegeInfoEng = await prisma.college.findFirstOrThrow({
    where: { name: 'College of Information Engineering' },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@university.edu',
      password,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Student Affairs',
      email: 'affairs@university.edu',
      password,
      role: UserRole.AFFAIRS,
    },
  });

  const librarian = await prisma.user.create({
    data: {
      name: 'Head Librarian',
      email: 'librarian@university.edu',
      password,
      role: UserRole.LIBRARIAN,
    },
  });

  await prisma.book.create({
    data: {
      title: 'Introduction to Algorithms',
      filePath: '/uploads/sample-placeholder.pdf',
      category: 'PROGRAMMING',
      departmentId: deptInfoEng.id,
      addedById: librarian.id,
      publishYear: 2022,
      keywords: {
        create: [{ keyword: 'algorithms' }, { keyword: 'cs' }],
      },
    },
  });

  await prisma.news.create({
    data: {
      title: 'Welcome to the new portal',
      content: 'The university web system is now live.',
      authorId: admin.id,
    },
  });

  const infoEngManager = await prisma.user.findFirst({
    where: { role: UserRole.MANAGER, collegeId: collegeInfoEng.id },
  });

  if (infoEngManager) {
    await prisma.news.create({
      data: {
        title: 'Information Engineering town hall',
        content: 'Join us this Friday.',
        authorId: infoEngManager.id,
        collegeId: collegeInfoEng.id,
      },
    });
  }

  console.log('Staff & content seeded.');
  console.log({
    admin: admin.email,
    librarian: librarian.email,
    affairs: 'affairs@university.edu',
    faculty: 'faculty@university.edu',
  });
}

async function main() {
  await seedUniversityStructure(prisma);

  const password = await bcrypt.hash(SEED_STUDENT_PASSWORD, 10);

  const managers = await seedCollegeManagers(prisma, password);
  console.log('\nCollege managers (password: Password123!):');
  for (const m of managers) {
    console.log(`  ${m.email} — ${m.collegeName}`);
  }

  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    await seedStaffAndContent(password);
  } else {
    console.log('Staff seed skipped (users already exist).');
  }

  const studentCreds = await seedStudentsAndAcademics(prisma, password);

  await seedCurriculum(prisma);

  await seedTuitionAndDiscounts(prisma);
  await seedLibraryBooks(prisma);

  console.log('\nStudent accounts (password: Password123!):');
  for (const s of studentCreds) {
    console.log(`  ${s.email} — ${s.name} (${s.department}) · ${s.academicNumber}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
