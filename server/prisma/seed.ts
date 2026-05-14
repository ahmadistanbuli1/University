import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(
      'Seed skipped: database already has users. To re-seed, truncate tables or use a fresh database.'
    );
    return;
  }

  const password = await bcrypt.hash('Password123!', 10);

  const collegeA = await prisma.college.create({
    data: { name: 'College of Engineering', description: 'Engineering programs' },
  });
  const collegeB = await prisma.college.create({
    data: { name: 'College of Science', description: 'Science programs' },
  });

  const deptCS = await prisma.department.create({
    data: { name: 'Computer Science', collegeId: collegeA.id },
  });
  const deptMath = await prisma.department.create({
    data: { name: 'Mathematics', collegeId: collegeB.id },
  });

  const courseAlgo = await prisma.course.create({
    data: { name: 'Algorithms', code: 'CS301', departmentId: deptCS.id },
  });
  const courseDb = await prisma.course.create({
    data: { name: 'Databases', code: 'CS302', departmentId: deptCS.id },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@university.edu',
      password,
      role: UserRole.ADMIN,
    },
  });

  const affairs = await prisma.user.create({
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

  const manager = await prisma.user.create({
    data: {
      name: 'Engineering Manager',
      email: 'manager@university.edu',
      password,
      role: UserRole.MANAGER,
      collegeId: collegeA.id,
    },
  });

  const faculty = await prisma.user.create({
    data: {
      name: 'Dr. Faculty',
      email: 'faculty@university.edu',
      password,
      role: UserRole.FACULTY,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: 'Alex Student',
      email: 'student@university.edu',
      password,
      role: UserRole.STUDENT,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      departmentId: deptCS.id,
      academicNumber: 'STU-2025-001',
      currentSemester: 5,
    },
  });

  const fc1 = await prisma.facultyCourse.create({
    data: {
      facultyId: faculty.id,
      courseId: courseAlgo.id,
      semester: 'Fall 2025',
      academicYear: '2025-2026',
    },
  });

  await prisma.facultyCourse.create({
    data: {
      facultyId: faculty.id,
      courseId: courseDb.id,
      semester: 'Fall 2025',
      academicYear: '2025-2026',
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: courseAlgo.id,
      semester: 'Fall 2025',
      academicYear: '2025-2026',
    },
  });

  await prisma.examResult.create({
    data: {
      studentId: student.id,
      facultyCourseId: fc1.id,
      score: 88.5,
      attemptNumber: 1,
      semester: 'Fall 2025',
      academicYear: '2025-2026',
    },
  });

  await prisma.book.create({
    data: {
      title: 'Introduction to Algorithms',
      filePath: '/uploads/sample-placeholder.pdf',
      departmentId: deptCS.id,
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

  await prisma.news.create({
    data: {
      title: 'Engineering town hall',
      content: 'Join us this Friday.',
      authorId: manager.id,
      collegeId: collegeA.id,
    },
  });

  console.log('Seed complete. Sample credentials (password: Password123!):');
  console.log({
    admin: admin.email,
    student: studentUser.email,
    faculty: faculty.email,
    librarian: librarian.email,
    affairs: affairs.email,
    manager: manager.email,
  });
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
