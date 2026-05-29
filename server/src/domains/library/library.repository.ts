import type { LibraryBookCategory, Prisma, PrismaClient } from '@prisma/client';

export class LibraryRepository {
  constructor(private readonly db: PrismaClient) {}

  async listBooks(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    category?: LibraryBookCategory;
    publishYear?: number;
    author?: string;
    publisher?: string;
    userId?: string;
    favoritesOnly?: boolean;
  }) {
    const { page, pageSize, keyword, category, publishYear, author, publisher, userId, favoritesOnly } =
      params;
    const skip = (page - 1) * pageSize;
    const conditions: Prisma.BookWhereInput[] = [];

    if (category) conditions.push({ category });
    if (publishYear) conditions.push({ publishYear });
    if (author?.trim()) {
      conditions.push({ author: { contains: author.trim(), mode: 'insensitive' } });
    }
    if (publisher?.trim()) {
      conditions.push({ publisher: { contains: publisher.trim(), mode: 'insensitive' } });
    }
    if (keyword?.trim()) {
      const q = keyword.trim();
      conditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { publisher: { contains: q, mode: 'insensitive' } },
          { keywords: { some: { keyword: { contains: q, mode: 'insensitive' } } } },
        ],
      });
    }
    if (favoritesOnly && userId) {
      conditions.push({ favorites: { some: { userId } } });
    }

    const where: Prisma.BookWhereInput = conditions.length ? { AND: conditions } : {};

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
    author?: string | null;
    publisher?: string | null;
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
        author: data.author?.trim() || null,
        publisher: data.publisher?.trim() || null,
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
          author: true,
          publisher: true,
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
      author?: string | null;
      publisher?: string | null;
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
          author: data.author !== undefined ? data.author : undefined,
          publisher: data.publisher !== undefined ? data.publisher : undefined,
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

  listFavoriteBookIds(userId: string) {
    return this.db.bookFavorite.findMany({
      where: { userId },
      select: { bookId: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findFavorite(userId: string, bookId: string) {
    return this.db.bookFavorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  addFavorite(userId: string, bookId: string) {
    return this.db.bookFavorite.create({
      data: { userId, bookId },
    });
  }

  removeFavorite(userId: string, bookId: string) {
    return this.db.bookFavorite.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }
}
