import type { LibraryBookCategory, Prisma, PrismaClient } from '@prisma/client';

export class LibraryRepository {
  constructor(private readonly db: PrismaClient) {}

  async listBooks(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    category?: LibraryBookCategory;
  }) {
    const { page, pageSize, keyword, category } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.BookWhereInput = category ? { category } : {};
    if (keyword) {
      where.AND = [
        {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { keywords: { some: { keyword: { contains: keyword, mode: 'insensitive' } } } },
          ],
        },
      ];
    }
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
    category: LibraryBookCategory;
    departmentId?: string;
    addedById: string;
    publishYear: number;
    keywords: string[];
  }) {
    return this.db.book.create({
      data: {
        title: data.title,
        filePath: data.filePath,
        category: data.category,
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

  async getDashboardStats() {
    const [totalBooks, sums, byCategory, topByReads] = await Promise.all([
      this.db.book.count(),
      this.db.book.aggregate({ _sum: { readsCount: true, downloadsCount: true } }),
      this.db.book.groupBy({
        by: ['category'],
        _count: { _all: true },
        _sum: { readsCount: true, downloadsCount: true },
      }),
      this.db.book.findMany({
        orderBy: [{ readsCount: 'desc' }, { downloadsCount: 'desc' }],
        take: 10,
        select: {
          id: true,
          title: true,
          category: true,
          readsCount: true,
          downloadsCount: true,
          publishYear: true,
        },
      }),
    ]);

    return {
      totalBooks,
      totalReads: sums._sum.readsCount ?? 0,
      totalDownloads: sums._sum.downloadsCount ?? 0,
      byCategory: byCategory.map((row) => ({
        category: row.category,
        count: row._count._all,
        reads: row._sum.readsCount ?? 0,
        downloads: row._sum.downloadsCount ?? 0,
      })),
      topByReads,
    };
  }

  updateBook(
    id: string,
    data: {
      title?: string;
      category?: LibraryBookCategory;
      publishYear?: number;
      keywords?: string[];
    }
  ) {
    return this.db.$transaction(async (tx) => {
      if (data.keywords) {
        await tx.bookKeyword.deleteMany({ where: { bookId: id } });
      }
      return tx.book.update({
        where: { id },
        data: {
          title: data.title,
          category: data.category,
          publishYear: data.publishYear,
          ...(data.keywords
            ? { keywords: { create: data.keywords.map((keyword) => ({ keyword })) } }
            : {}),
        },
        include: { keywords: true, department: true },
      });
    });
  }

  deleteBook(id: string) {
    return this.db.book.delete({ where: { id } });
  }
}
