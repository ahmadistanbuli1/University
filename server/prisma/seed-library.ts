import type { LibraryBookCategory, PrismaClient } from '@prisma/client';

const PLACEHOLDER = '/uploads/sample-placeholder.pdf';

type BookSeed = {
  title: string;
  category: LibraryBookCategory;
  publishYear: number;
  keywords: string[];
};

const DEMO_BOOKS: BookSeed[] = [
  { title: 'Clinical Pharmacology Essentials', category: 'MEDICAL', publishYear: 2023, keywords: ['pharmacy', 'clinical'] },
  { title: 'Anesthesia Practice Handbook', category: 'MEDICAL', publishYear: 2022, keywords: ['anesthesia', 'health'] },
  { title: 'Public Administration & Policy', category: 'ADMINISTRATIVE', publishYear: 2021, keywords: ['management', 'policy'] },
  { title: 'Organizational Behavior', category: 'ADMINISTRATIVE', publishYear: 2020, keywords: ['hr', 'leadership'] },
  { title: 'University Physics — Volume I', category: 'SCIENTIFIC', publishYear: 2024, keywords: ['physics', 'science'] },
  { title: 'General Chemistry Principles', category: 'SCIENTIFIC', publishYear: 2023, keywords: ['chemistry'] },
  { title: 'Introduction to Algorithms', category: 'PROGRAMMING', publishYear: 2022, keywords: ['algorithms', 'cs'] },
  { title: 'Clean Code: A Handbook', category: 'PROGRAMMING', publishYear: 2019, keywords: ['software', 'craft'] },
  { title: 'Modern JavaScript for the Web', category: 'FRONTEND_WEB', publishYear: 2024, keywords: ['javascript', 'dom'] },
  { title: 'CSS Grid & Flexbox Layout', category: 'FRONTEND_WEB', publishYear: 2023, keywords: ['css', 'ui'] },
  { title: 'Node.js API Design Patterns', category: 'BACKEND_WEB', publishYear: 2023, keywords: ['nodejs', 'api'] },
  { title: 'Database Systems for Web Apps', category: 'BACKEND_WEB', publishYear: 2022, keywords: ['sql', 'backend'] },
  { title: 'Machine Learning Foundations', category: 'ARTIFICIAL_INTELLIGENCE', publishYear: 2024, keywords: ['ml', 'ai'] },
  { title: 'Deep Learning — Practical Guide', category: 'ARTIFICIAL_INTELLIGENCE', publishYear: 2023, keywords: ['neural', 'ai'] },
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
        data: { category: seed.category, publishYear: seed.publishYear },
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
        keywords: { create: seed.keywords.map((keyword) => ({ keyword })) },
      },
    });
  }

  console.log('Library category books seeded.');
}
