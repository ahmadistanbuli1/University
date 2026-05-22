import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { NewsRepository } from './news.repository.js';
import type { AuditService } from '../audit/audit.service.js';

export class NewsService {
  constructor(
    private readonly repo: NewsRepository,
    private readonly audit: AuditService | null
  ) {}

  async listPublic(page: number, pageSize: number) {
    const [items, total] = await this.repo.listPublic({ page, pageSize });
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError(404, 'News not found');
    }
    return item;
  }

  async createNews(input: {
    authorId: string;
    role: UserRole;
    collegeId: string | null | undefined;
    title: string;
    content: string;
    imageUrl?: string | null;
    authorCollegeId: string | null;
    category?: 'GENERAL' | 'TUITION';
    enablePayNow?: boolean;
  }) {
    if (input.role === 'ADMIN') {
      const news = await this.repo.create({
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl ?? undefined,
        category: input.category ?? 'GENERAL',
        enablePayNow: input.enablePayNow ?? false,
        author: { connect: { id: input.authorId } },
        college: input.collegeId ? { connect: { id: input.collegeId } } : undefined,
      });
      await this.audit?.log({
        userId: input.authorId,
        action: 'CREATE_NEWS',
        entity: 'news',
        entityId: news.id,
      });
      return news;
    }
    if (input.role === 'MANAGER') {
      if (!input.authorCollegeId) {
        throw new AppError(403, 'Manager must belong to a college');
      }
      const collegeId = input.collegeId ?? input.authorCollegeId;
      if (collegeId !== input.authorCollegeId) {
        throw new AppError(403, 'Managers can only post for their college');
      }
      const news = await this.repo.create({
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl ?? undefined,
        category: input.category ?? 'GENERAL',
        enablePayNow: input.enablePayNow ?? false,
        author: { connect: { id: input.authorId } },
        college: { connect: { id: collegeId } },
      });
      await this.audit?.log({
        userId: input.authorId,
        action: 'CREATE_NEWS',
        entity: 'news',
        entityId: news.id,
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
      content?: string;
      imageUrl?: string | null;
      collegeId?: string | null;
      category?: 'GENERAL' | 'TUITION';
      enablePayNow?: boolean;
    }
  ) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(404, 'News not found');
    }
    if (actor.role === 'ADMIN') {
      const updated = await this.repo.update(id, {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        category: data.category,
        enablePayNow: data.enablePayNow,
        ...(data.collegeId !== undefined
          ? data.collegeId
            ? { college: { connect: { id: data.collegeId } } }
            : { college: { disconnect: true } }
          : {}),
      });
      await this.audit?.log({
        userId: actor.id,
        action: 'UPDATE_NEWS',
        entity: 'news',
        entityId: id,
      });
      return updated;
    }
    if (actor.role === 'MANAGER') {
      if (!actor.collegeId || existing.collegeId !== actor.collegeId) {
        throw new AppError(403, 'Forbidden');
      }
      const updated = await this.repo.update(id, {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        category: data.category,
        enablePayNow: data.enablePayNow,
      });
      await this.audit?.log({
        userId: actor.id,
        action: 'UPDATE_NEWS',
        entity: 'news',
        entityId: id,
      });
      return updated;
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
