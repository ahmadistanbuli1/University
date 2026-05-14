import type { Prisma, PrismaClient } from '@prisma/client';

export class LibraryRepository {
  constructor(private readonly db: PrismaClient) {}

  async listBooks(params: { page: number; pageSize: number; keyword?: string }) {
    const { page, pageSize, keyword } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.BookWhereInput = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { keywords: { some: { keyword: { contains: keyword, mode: 'insensitive' } } } },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      this.db.book.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          department: { include: { college: true } },
          keywords: true,
          addedBy: { select: { id: true, name: true } },
        },
      }),
      this.db.book.count({ where }),
    ]);
    return { items, total };
  }

  createBook(data: {
    title: string;
    filePath: string;
    departmentId: string;
    addedById: string;
    publishYear: number;
    keywords: string[];
  }) {
    return this.db.book.create({
      data: {
        title: data.title,
        filePath: data.filePath,
        departmentId: data.departmentId,
        addedById: data.addedById,
        publishYear: data.publishYear,
        keywords: {
          create: data.keywords.map((keyword) => ({ keyword })),
        },
      },
      include: { keywords: true },
    });
  }

  findBook(id: string) {
    return this.db.book.findUnique({ where: { id } });
  }

  incrementReads(id: string) {
    return this.db.book.update({
      where: { id },
      data: { readsCount: { increment: 1 } },
    });
  }

  incrementDownloads(id: string) {
    return this.db.book.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });
  }
}
