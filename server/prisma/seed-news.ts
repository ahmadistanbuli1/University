import type { NewsCategory, PrismaClient } from '@prisma/client';

const DEMO_IMAGES: Record<NewsCategory, string> = {
  ANNOUNCEMENT:
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop&q=80',
  WORKSHOP:
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop&q=80',
  TRAINING:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop&q=80',
  TUITION:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop&q=80',
};

function autoSummary(content: string) {
  return content.length > 220 ? `${content.slice(0, 220).trim()}…` : content;
}

/** Demo news across categories and colleges — most with cover images, some without. */
export async function seedNewsDemo(prisma: PrismaClient) {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) return;

  const colleges = await prisma.college.findMany({ include: { departments: true } });

  const samples: Array<{
    category: NewsCategory;
    title: string;
    content: string;
    collegeId?: string | null;
    withImage?: boolean;
  }> = [
    {
      category: 'ANNOUNCEMENT',
      title: 'إعلان عام: بدء الفصل الدراسي الثاني',
      content:
        'تعلن الجامعة عن بدء الفصل الدراسي الثاني وفق الجدول الرسمي. يرجى من الطلبة مراجعة جداول المحاضرات على البوابة.',
      collegeId: null,
      withImage: true,
    },
    {
      category: 'ANNOUNCEMENT',
      title: 'University-wide library hours extended',
      content:
        'The central digital library will remain available 24/7 during exam season for all students and faculty.',
      collegeId: null,
      withImage: false,
    },
    {
      category: 'WORKSHOP',
      title: 'ورشة عمل: مهارات العرض التقديمي',
      content:
        'ورشة تفاعلية لطلاب السنة الثالثة وما فوق. التسجيل عبر شؤون الطلاب حتى نهاية الأسبوع.',
      collegeId: null,
      withImage: true,
    },
    {
      category: 'WORKSHOP',
      title: 'Workshop: Git & teamwork for developers',
      content:
        'Hands-on session covering branching, pull requests, and code review. Bring your laptop.',
      collegeId: null,
      withImage: true,
    },
    {
      category: 'TRAINING',
      title: 'دورة تدريبية: الإسعافات الأولية',
      content:
        'دورة معتمدة لمدة أسبوعين للطلبة والموظفين. الشهادة من وزارة الصحة الشريكة.',
      collegeId: null,
      withImage: true,
    },
    {
      category: 'TRAINING',
      title: 'Training course: Academic writing in English',
      content:
        'Improve research papers and citations. Limited seats — register through student affairs.',
      collegeId: null,
      withImage: false,
    },
  ];

  for (const college of colleges) {
    samples.push(
      {
        category: 'ANNOUNCEMENT',
        title: `إعلان ${college.name}: جدول الامتحانات`,
        content: `تُنشر جداول امتحانات نهاية الفصل لطلاب ${college.name} على لوحة الإعلانات في البوابة.`,
        collegeId: college.id,
        withImage: true,
      },
      {
        category: 'WORKSHOP',
        title: `ورشة ${college.name}: ريادة الأعمال`,
        content: `ورشة مخصصة لطلاب ${college.name} بالتعاون مع حاضنة الأعمال الجامعية.`,
        collegeId: college.id,
        withImage: true,
      },
      {
        category: 'TRAINING',
        title: `دورة ${college.name}: مهارات المقابلات الوظيفية`,
        content: `دورة قصيرة لتحضير السيرة الذاتية والمقابلة الشخصية لخريجي ${college.name}.`,
        collegeId: college.id,
        withImage: false,
      }
    );
  }

  let created = 0;
  for (const item of samples) {
    const dup = await prisma.news.findFirst({
      where: { title: item.title, collegeId: item.collegeId ?? null },
    });
    const imageUrl = item.withImage !== false ? DEMO_IMAGES[item.category] : null;
    const summary = autoSummary(item.content);

    if (dup) {
      await prisma.news.update({
        where: { id: dup.id },
        data: {
          summary: dup.summary || summary,
          ...( !dup.imageUrl && imageUrl ? { imageUrl } : {}),
        },
      });
      continue;
    }
    await prisma.news.create({
      data: {
        title: item.title,
        summary,
        content: item.content,
        category: item.category,
        authorId: admin.id,
        collegeId: item.collegeId ?? undefined,
        imageUrl: imageUrl ?? undefined,
      },
    });
    created++;
  }

  const withoutImage = await prisma.news.findMany({
    where: { imageUrl: null },
    orderBy: { createdAt: 'asc' },
  });
  let idx = 0;
  for (const row of withoutImage) {
    if (idx % 3 === 2) {
      idx++;
      continue;
    }
    await prisma.news.update({
      where: { id: row.id },
      data: { imageUrl: DEMO_IMAGES[row.category] },
    });
    idx++;
  }

  console.log(`News demo: created ${created} items; backfilled images where missing.`);
}
