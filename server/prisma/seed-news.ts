import type { NewsCategory, PrismaClient } from '@prisma/client';

/** Demo news across categories and colleges. */
export async function seedNewsDemo(prisma: PrismaClient) {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) return;

  const colleges = await prisma.college.findMany({ include: { departments: true } });
  const existing = await prisma.news.count();
  if (existing > 15) {
    console.log('News demo: skipped (already seeded).');
    return;
  }

  const samples: Array<{
    category: NewsCategory;
    title: string;
    content: string;
    collegeId?: string | null;
  }> = [
    {
      category: 'ANNOUNCEMENT',
      title: 'إعلان عام: بدء الفصل الدراسي الثاني',
      content:
        'تعلن الجامعة عن بدء الفصل الدراسي الثاني وفق الجدول الرسمي. يرجى من الطلبة مراجعة جداول المحاضرات على البوابة.',
      collegeId: null,
    },
    {
      category: 'ANNOUNCEMENT',
      title: 'University-wide library hours extended',
      content:
        'The central digital library will remain available 24/7 during exam season for all students and faculty.',
      collegeId: null,
    },
    {
      category: 'WORKSHOP',
      title: 'ورشة عمل: مهارات العرض التقديمي',
      content:
        'ورشة تفاعلية لطلاب السنة الثالثة وما فوق. التسجيل عبر شؤون الطلاب حتى نهاية الأسبوع.',
      collegeId: null,
    },
    {
      category: 'WORKSHOP',
      title: 'Workshop: Git & teamwork for developers',
      content:
        'Hands-on session covering branching, pull requests, and code review. Bring your laptop.',
      collegeId: null,
    },
    {
      category: 'TRAINING',
      title: 'دورة تدريبية: الإسعافات الأولية',
      content:
        'دورة معتمدة لمدة أسبوعين للطلبة والموظفين. الشهادة من وزارة الصحة الشريكة.',
      collegeId: null,
    },
    {
      category: 'TRAINING',
      title: 'Training course: Academic writing in English',
      content:
        'Improve research papers and citations. Limited seats — register through student affairs.',
      collegeId: null,
    },
  ];

  for (const college of colleges) {
    samples.push(
      {
        category: 'ANNOUNCEMENT',
        title: `إعلان ${college.name}: جدول الامتحانات`,
        content: `تُنشر جداول امتحانات نهاية الفصل لطلاب ${college.name} على لوحة الإعلانات في البوابة.`,
        collegeId: college.id,
      },
      {
        category: 'WORKSHOP',
        title: `ورشة ${college.name}: ريادة الأعمال`,
        content: `ورشة مخصصة لطلاب ${college.name} بالتعاون مع حاضنة الأعمال الجامعية.`,
        collegeId: college.id,
      },
      {
        category: 'TRAINING',
        title: `دورة ${college.name}: مهارات المقابلات الوظيفية`,
        content: `دورة قصيرة لتحضير السيرة الذاتية والمقابلة الشخصية لخريجي ${college.name}.`,
        collegeId: college.id,
      }
    );
  }

  for (const item of samples) {
    const dup = await prisma.news.findFirst({
      where: { title: item.title, collegeId: item.collegeId ?? null },
    });
    if (dup) continue;
    await prisma.news.create({
      data: {
        title: item.title,
        content: item.content,
        category: item.category,
        authorId: admin.id,
        collegeId: item.collegeId ?? undefined,
      },
    });
  }

  console.log(`News demo: ensured ${samples.length} sample definitions.`);
}
