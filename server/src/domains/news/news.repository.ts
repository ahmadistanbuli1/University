import type { NewsCategory, Prisma, PrismaClient } from '@prisma/client';

const listInclude = {
  author: { select: { id: true, name: true } },
  college: { select: { id: true, name: true } },
} as const;

const detailInclude = {
  ...listInclude,
  galleryImages: { orderBy: { sortOrder: 'asc' as const } },
} as const;

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
        select: {
          id: true,
          title: true,
          summary: true,
          imageUrl: true,
          category: true,
          enablePayNow: true,
          tuitionSemesterKey: true,
          collegeId: true,
          createdAt: true,
          author: listInclude.author,
          college: listInclude.college,
        },
      }),
      this.db.news.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.db.news.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  create(data: Prisma.NewsCreateInput, gallery?: Array<{ imageUrl: string; sortOrder: number }>) {
    return this.db.news.create({
      data: {
        ...data,
        galleryImages: gallery?.length
          ? { create: gallery.map((g) => ({ imageUrl: g.imageUrl, sortOrder: g.sortOrder })) }
          : undefined,
      },
      include: detailInclude,
    });
  }

  update(id: string, data: Prisma.NewsUpdateInput) {
    return this.db.news.update({
      where: { id },
      data,
      include: detailInclude,
    });
  }

  addGalleryImages(newsId: string, images: Array<{ imageUrl: string; sortOrder: number }>) {
    if (!images.length) return Promise.resolve();
    return this.db.newsImage.createMany({
      data: images.map((img) => ({
        newsId,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder,
      })),
    });
  }

  deleteGalleryImages(ids: string[]) {
    if (!ids.length) return Promise.resolve({ count: 0 });
    return this.db.newsImage.deleteMany({ where: { id: { in: ids } } });
  }

  maxGallerySortOrder(newsId: string) {
    return this.db.newsImage.aggregate({
      where: { newsId },
      _max: { sortOrder: true },
    });
  }

  delete(id: string) {
    return this.db.news.delete({ where: { id } });
  }
}
