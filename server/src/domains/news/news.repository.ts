import type { Prisma, PrismaClient } from '@prisma/client';

export class NewsRepository {
  constructor(private readonly db: PrismaClient) {}

  listPublic(params: { page: number; pageSize: number }) {
    const skip = (params.page - 1) * params.pageSize;
    return Promise.all([
      this.db.news.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.pageSize,
        include: {
          author: { select: { id: true, name: true } },
          college: true,
        },
      }),
      this.db.news.count(),
    ]);
  }

  findById(id: string) {
    return this.db.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } }, college: true },
    });
  }

  create(data: Prisma.NewsCreateInput) {
    return this.db.news.create({ data });
  }

  update(id: string, data: Prisma.NewsUpdateInput) {
    return this.db.news.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.db.news.delete({ where: { id } });
  }
}
