import type { NewsCategory, Prisma, PrismaClient } from '@prisma/client';

export class NewsRepository {
  constructor(private readonly db: PrismaClient) {}

  listPublic(params: {
    page: number;
    pageSize: number;
    collegeId?: string;
    category?: NewsCategory;
  }) {
    const skip = (params.page - 1) * params.pageSize;
    const where: Prisma.NewsWhereInput = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.collegeId) {
      where.OR = [{ collegeId: null }, { collegeId: params.collegeId }];
    }

    return Promise.all([
      this.db.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.pageSize,
        include: {
          author: { select: { id: true, name: true } },
          college: { select: { id: true, name: true } },
        },
      }),
      this.db.news.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.db.news.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        college: { select: { id: true, name: true } },
      },
    });
  }

  create(data: Prisma.NewsCreateInput) {
    return this.db.news.create({
      data,
      include: {
        author: { select: { id: true, name: true } },
        college: { select: { id: true, name: true } },
      },
    });
  }

  update(id: string, data: Prisma.NewsUpdateInput) {
    return this.db.news.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true } },
        college: { select: { id: true, name: true } },
      },
    });
  }

  delete(id: string) {
    return this.db.news.delete({ where: { id } });
  }
}
