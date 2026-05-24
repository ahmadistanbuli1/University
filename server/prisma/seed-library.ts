import type { LibraryBookCategory, PrismaClient } from '@prisma/client';

const PLACEHOLDER = '/uploads/sample-placeholder.pdf';

type BookSeed = {
  title: string;
  category: LibraryBookCategory;
  publishYear: number;
  author: string;
  publisher: string;
  keywords: string[];
};

const DEMO_BOOKS: BookSeed[] = [
  {
    title: 'Clinical Pharmacology Essentials',
    category: 'MEDICAL',
    publishYear: 2023,
    author: 'Dr. Lina Al-Masri',
    publisher: 'SPU Medical Press',
    keywords: ['pharmacy', 'clinical'],
  },
  {
    title: 'Anesthesia Practice Handbook',
    category: 'MEDICAL',
    publishYear: 2022,
    author: 'Dr. Samir Haddad',
    publisher: 'Health Sciences Editions',
    keywords: ['anesthesia', 'health'],
  },
  {
    title: 'Public Administration & Policy',
    category: 'ADMINISTRATIVE',
    publishYear: 2021,
    author: 'Prof. Nadia Rahman',
    publisher: 'Admin Studies House',
    keywords: ['management', 'policy'],
  },
  {
    title: 'Organizational Behavior',
    category: 'ADMINISTRATIVE',
    publishYear: 2020,
    author: 'Dr. James Porter',
    publisher: 'Business Bridge',
    keywords: ['hr', 'leadership'],
  },
  {
    title: 'University Physics — Volume I',
    category: 'SCIENTIFIC',
    publishYear: 2024,
    author: 'Dr. Hana Saleh',
    publisher: 'Science & Tech Books',
    keywords: ['physics', 'science'],
  },
  {
    title: 'General Chemistry Principles',
    category: 'SCIENTIFIC',
    publishYear: 2023,
    author: 'Dr. Omar Faris',
    publisher: 'Science & Tech Books',
    keywords: ['chemistry'],
  },
  {
    title: 'Introduction to Algorithms',
    category: 'PROGRAMMING',
    publishYear: 2022,
    author: 'Thomas Cormen et al.',
    publisher: 'MIT Press',
    keywords: ['algorithms', 'cs'],
  },
  {
    title: 'Clean Code: A Handbook',
    category: 'PROGRAMMING',
    publishYear: 2019,
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    keywords: ['software', 'craft'],
  },
  {
    title: 'Modern JavaScript for the Web',
    category: 'FRONTEND_WEB',
    publishYear: 2024,
    author: 'Eva Chen',
    publisher: 'WebCraft Publishing',
    keywords: ['javascript', 'dom'],
  },
  {
    title: 'CSS Grid & Flexbox Layout',
    category: 'FRONTEND_WEB',
    publishYear: 2023,
    author: 'Maya Torres',
    publisher: 'WebCraft Publishing',
    keywords: ['css', 'ui'],
  },
  {
    title: 'Node.js API Design Patterns',
    category: 'BACKEND_WEB',
    publishYear: 2023,
    author: 'Marco Russo',
    publisher: 'Backend Works',
    keywords: ['nodejs', 'api'],
  },
  {
    title: 'Database Systems for Web Apps',
    category: 'BACKEND_WEB',
    publishYear: 2022,
    author: 'Dr. Yara Nasser',
    publisher: 'Backend Works',
    keywords: ['sql', 'backend'],
  },
  {
    title: 'Machine Learning Foundations',
    category: 'ARTIFICIAL_INTELLIGENCE',
    publishYear: 2024,
    author: 'Prof. Alex Kim',
    publisher: 'AI Horizon',
    keywords: ['ml', 'ai'],
  },
  {
    title: 'Deep Learning — Practical Guide',
    category: 'ARTIFICIAL_INTELLIGENCE',
    publishYear: 2023,
    author: 'Dr. Sara Ibrahim',
    publisher: 'AI Horizon',
    keywords: ['neural', 'ai'],
  },
  {
    title: 'مشروع تخرج: نظام إدارة مستشفى ذكي',
    category: 'GRADUATION_PROJECT',
    publishYear: 2025,
    author: 'أحمد خليل — قسم هندسة المعلوماتية',
    publisher: 'مكتبة مشاريع التخرج — SPU',
    keywords: ['graduation', 'hospital', 'iot'],
  },
  {
    title: 'Graduation Project: E-Learning Analytics Dashboard',
    category: 'GRADUATION_PROJECT',
    publishYear: 2024,
    author: 'Layla Mansour — Computer Science',
    publisher: 'SPU Graduation Archive',
    keywords: ['graduation', 'analytics', 'education'],
  },
  {
    title: 'مشروع تخرج: تصميم محطة طاقة شمسية مصغرة',
    category: 'GRADUATION_PROJECT',
    publishYear: 2023,
    author: 'Karim Saleh — Alternative Energy Engineering',
    publisher: 'مكتبة مشاريع التخرج — SPU',
    keywords: ['graduation', 'solar', 'energy'],
  },
];

export async function seedLibraryBooks(prisma: PrismaClient) {
  const librarian = await prisma.user.findFirst({ where: { role: 'LIBRARIAN' } });
  if (!librarian) {
    console.log('Library seed skipped (no librarian).');
    return;
  }

  for (const seed of DEMO_BOOKS) {
    const existing = await prisma.book.findFirst({
      where: { title: seed.title, category: seed.category },
    });
    if (existing) {
      await prisma.book.update({
        where: { id: existing.id },
        data: {
          category: seed.category,
          publishYear: seed.publishYear,
          author: seed.author,
          publisher: seed.publisher,
        },
      });
      continue;
    }
    await prisma.book.create({
      data: {
        title: seed.title,
        filePath: PLACEHOLDER,
        category: seed.category,
        addedById: librarian.id,
        publishYear: seed.publishYear,
        author: seed.author,
        publisher: seed.publisher,
        keywords: { create: seed.keywords.map((keyword) => ({ keyword })) },
      },
    });
  }

  console.log(`Library demo: ensured ${DEMO_BOOKS.length} books across all categories.`);
}
