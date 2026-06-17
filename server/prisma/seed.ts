import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedCollegeManagers } from './seed-managers.js';
import { seedUniversityStructure } from './seed-structure.js';
import { SEED_STUDENT_PASSWORD } from './seed-students-data.js';
import { seedStudentsAndAcademics } from './seed-students.js';
import { seedTuitionAndDiscounts } from './seed-tuition.js';
import { seedLibraryBooks } from './seed-library.js';
import { seedCurriculum } from './seed-curriculum.js';
import { seedNewsDemo } from './seed-news.js';
import { seedExamOfficer } from './seed-exam-officer.js';

const prisma = new PrismaClient();

function ensureSampleLibraryPdf() {
  const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
  const targetDir = path.join(uploadRoot, 'public', 'library');
  fs.mkdirSync(targetDir, { recursive: true });
  const target = path.join(targetDir, 'sample-placeholder.pdf');
  if (!fs.existsSync(target)) {
    fs.writeFileSync(
      target,
      Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n')
    );
  }
}

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
      filePath: '/uploads/library/sample-placeholder.pdf',
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
      summary: 'The university web system is now live.',
      content: 'The university web system is now live.',
      category: 'ANNOUNCEMENT',
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
        summary: 'Join us this Friday for the college town hall.',
        content: 'Join us this Friday.',
        category: 'ANNOUNCEMENT',
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
  ensureSampleLibraryPdf();
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

  await seedCurriculum(prisma);

  const studentCreds = await seedStudentsAndAcademics(prisma, password);

  await seedTuitionAndDiscounts(prisma);
  await seedNewsDemo(prisma);
  await seedLibraryBooks(prisma);

  const examOfficer = await seedExamOfficer(prisma, password);
  console.log('\nExam officer (password: Password123!):');
  console.log(`  ${examOfficer.email}`);

  console.log(`\n${studentCreds.length} student accounts seeded (see docs/accounts/md/student-accounts.md).`);
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
