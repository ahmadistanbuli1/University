import type { NewsCategory, UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { NewsRepository } from './news.repository.js';
import type { AuditService } from '../audit/audit.service.js';
import type { NotificationDispatchService } from '../notifications/notification.service.js';

type NewsCategoryInput = NewsCategory;

type GalleryInput = Array<{ imageUrl: string; sortOrder: number }>;

export class NewsService {
  constructor(
    private readonly repo: NewsRepository,
    private readonly audit: AuditService | null,
    private readonly notify: NotificationDispatchService | null
  ) {}

  async listPublic(
    page: number,
    pageSize: number,
    filters?: { collegeId?: string; category?: NewsCategory }
  ) {
    const [items, total] = await this.repo.listPublic({
      page,
      pageSize,
      collegeId: filters?.collegeId,
      category: filters?.category,
    });
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError(404, 'News not found');
    }
    return item;
  }

  private async applyGalleryChanges(
    newsId: string,
    gallery: GalleryInput | undefined,
    removedGalleryIds: string[] | undefined
  ) {
    if (removedGalleryIds?.length) {
      await this.repo.deleteGalleryImages(removedGalleryIds);
    }
    if (gallery?.length) {
      const max = await this.repo.maxGallerySortOrder(newsId);
      const base = (max._max.sortOrder ?? -1) + 1;
      await this.repo.addGalleryImages(
        newsId,
        gallery.map((img, index) => ({
          imageUrl: img.imageUrl,
          sortOrder: base + index,
        }))
      );
    }
    return this.repo.findById(newsId);
  }

  async createNews(input: {
    authorId: string;
    role: UserRole;
    collegeId: string | null | undefined;
    title: string;
    summary: string;
    content: string;
    imageUrl?: string | null;
    gallery?: GalleryInput;
    authorCollegeId: string | null;
    category?: NewsCategoryInput;
    enablePayNow?: boolean;
    tuitionSemesterKey?: 'semester-1' | 'semester-2' | null;
    scope?: 'COLLEGE' | 'UNIVERSITY';
  }) {
    if (input.role === 'ADMIN') {
      const category = input.category ?? 'ANNOUNCEMENT';
      const enablePayNow = category === 'TUITION' ? Boolean(input.enablePayNow) : false;
      const tuitionSemesterKey =
        enablePayNow && input.tuitionSemesterKey ? input.tuitionSemesterKey : null;

      const news = await this.repo.create(
        {
          title: input.title,
          summary: input.summary,
          content: input.content,
          imageUrl: input.imageUrl ?? undefined,
          category,
          enablePayNow,
          tuitionSemesterKey,
          author: { connect: { id: input.authorId } },
          college: input.collegeId ? { connect: { id: input.collegeId } } : undefined,
        },
        input.gallery
      );
      await this.audit?.log({
        userId: input.authorId,
        action: 'CREATE_NEWS',
        entity: 'news',
        entityId: news.id,
      });
      await this.notify?.notifyNewsPublished({
        authorId: input.authorId,
        title: input.title,
        collegeId: input.collegeId ?? null,
        category,
      });
      return news;
    }

    if (input.role === 'MANAGER') {
      if (!input.authorCollegeId) {
        throw new AppError(403, 'Manager must belong to a college');
      }

      const scope = input.scope ?? 'COLLEGE';
      let collegeId: string | null;
      let category: NewsCategoryInput;

      if (scope === 'COLLEGE') {
        collegeId = input.authorCollegeId;
        category = input.category ?? 'ANNOUNCEMENT';
      } else {
        collegeId = null;
        category = input.category ?? 'ANNOUNCEMENT';
        if (category === 'TUITION') {
          throw new AppError(400, 'Managers cannot publish tuition payment announcements');
        }
      }

      const news = await this.repo.create(
        {
          title: input.title,
          summary: input.summary,
          content: input.content,
          imageUrl: input.imageUrl ?? undefined,
          category,
          enablePayNow: false,
          tuitionSemesterKey: null,
          author: { connect: { id: input.authorId } },
          college: collegeId ? { connect: { id: collegeId } } : undefined,
        },
        input.gallery
      );
      await this.audit?.log({
        userId: input.authorId,
        action: 'CREATE_NEWS',
        entity: 'news',
        entityId: news.id,
      });
      await this.notify?.notifyNewsPublished({
        authorId: input.authorId,
        title: input.title,
        collegeId,
        category,
      });
      return news;
    }

    throw new AppError(403, 'Forbidden');
  }

  async updateNews(
    id: string,
    actor: { id: string; role: UserRole; collegeId: string | null },
    data: {
      title?: string;
      summary?: string;
      content?: string;
      imageUrl?: string | null;
      collegeId?: string | null;
      category?: NewsCategoryInput;
      enablePayNow?: boolean;
      tuitionSemesterKey?: 'semester-1' | 'semester-2' | null;
      gallery?: GalleryInput;
      removedGalleryIds?: string[];
    }
  ) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(404, 'News not found');
    }
    if (actor.role === 'ADMIN') {
      const category = data.category ?? existing.category;
      const enablePayNow =
        category === 'TUITION'
          ? data.enablePayNow ?? existing.enablePayNow
          : false;
      await this.repo.update(id, {
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        category: data.category,
        enablePayNow: data.enablePayNow !== undefined ? enablePayNow : undefined,
        tuitionSemesterKey:
          data.tuitionSemesterKey !== undefined ? data.tuitionSemesterKey : undefined,
        ...(data.collegeId !== undefined
          ? data.collegeId
            ? { college: { connect: { id: data.collegeId } } }
            : { college: { disconnect: true } }
          : {}),
      });
      const refreshed = await this.applyGalleryChanges(id, data.gallery, data.removedGalleryIds);
      await this.audit?.log({
        userId: actor.id,
        action: 'UPDATE_NEWS',
        entity: 'news',
        entityId: id,
      });
      return refreshed!;
    }
    if (actor.role === 'MANAGER') {
      if (!actor.collegeId || existing.collegeId !== actor.collegeId) {
        throw new AppError(403, 'Forbidden');
      }
      await this.repo.update(id, {
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        category: data.category === 'TUITION' ? undefined : data.category,
      });
      const refreshed = await this.applyGalleryChanges(id, data.gallery, data.removedGalleryIds);
      await this.audit?.log({
        userId: actor.id,
        action: 'UPDATE_NEWS',
        entity: 'news',
        entityId: id,
      });
      return refreshed!;
    }
    throw new AppError(403, 'Forbidden');
  }

  async deleteNews(id: string, actor: { id: string; role: UserRole; collegeId: string | null }) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(404, 'News not found');
    }
    if (actor.role === 'ADMIN') {
      await this.repo.delete(id);
      await this.audit?.log({
        userId: actor.id,
        action: 'DELETE_NEWS',
        entity: 'news',
        entityId: id,
      });
      return { ok: true };
    }
    if (actor.role === 'MANAGER') {
      if (!actor.collegeId || existing.collegeId !== actor.collegeId) {
        throw new AppError(403, 'Forbidden');
      }
      await this.repo.delete(id);
      await this.audit?.log({
        userId: actor.id,
        action: 'DELETE_NEWS',
        entity: 'news',
        entityId: id,
      });
      return { ok: true };
    }
    throw new AppError(403, 'Forbidden');
  }
}
