import fs from 'node:fs/promises';
import path from 'node:path';
import type { LibraryBookCategory } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { LibraryRepository } from './library.repository.js';
import type { AuditService } from '../audit/audit.service.js';

export class LibraryService {
  constructor(
    private readonly repo: LibraryRepository,
    private readonly audit: AuditService | null,
    private readonly uploadDir: string
  ) {}

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
    return this.repo.listBooks(params);
  }

  async listFavoriteBookIds(userId: string) {
    const rows = await this.repo.listFavoriteBookIds(userId);
    return rows.map((r) => r.bookId);
  }

  async listFavoriteBooks(
    userId: string,
    params: {
      page: number;
      pageSize: number;
      keyword?: string;
      category?: LibraryBookCategory;
      publishYear?: number;
      author?: string;
      publisher?: string;
    }
  ) {
    return this.repo.listBooks({ ...params, userId, favoritesOnly: true });
  }

  async toggleFavorite(userId: string, bookId: string) {
    const book = await this.repo.findBook(bookId);
    if (!book) {
      throw new AppError(404, 'Book not found');
    }
    const existing = await this.repo.findFavorite(userId, bookId);
    if (existing) {
      await this.repo.removeFavorite(userId, bookId);
      return { saved: false, bookId };
    }
    await this.repo.addFavorite(userId, bookId);
    return { saved: true, bookId };
  }

  async removeFavorite(userId: string, bookId: string) {
    const existing = await this.repo.findFavorite(userId, bookId);
    if (!existing) {
      throw new AppError(404, 'Favorite not found');
    }
    await this.repo.removeFavorite(userId, bookId);
    return { saved: false, bookId };
  }

  async getLibrarianStats() {
    return this.repo.getDashboardStats();
  }

  async createBook(input: {
    librarianId: string;
    title: string;
    filePath: string;
    category: LibraryBookCategory;
    departmentId?: string;
    publishYear: number;
    author?: string;
    publisher?: string;
    keywords: string[];
  }) {
    const book = await this.repo.createBook({
      title: input.title,
      filePath: input.filePath,
      category: input.category,
      departmentId: input.departmentId,
      addedById: input.librarianId,
      publishYear: input.publishYear,
      author: input.author,
      publisher: input.publisher,
      keywords: input.keywords,
    });
    await this.audit?.log({
      userId: input.librarianId,
      action: 'UPLOAD_BOOK',
      entity: 'books',
      entityId: book.id,
      details: { title: input.title },
    });
    return book;
  }

  async incrementRead(bookId: string) {
    const book = await this.repo.findBook(bookId);
    if (!book) {
      throw new AppError(404, 'Book not found');
    }
    return this.repo.incrementReads(bookId);
  }

  async incrementDownload(bookId: string) {
    const book = await this.repo.findBook(bookId);
    if (!book) {
      throw new AppError(404, 'Book not found');
    }
    return this.repo.incrementDownloads(bookId);
  }

  async updateBook(
    librarianId: string,
    bookId: string,
    input: {
      title?: string;
      category?: LibraryBookCategory;
      publishYear?: number;
      author?: string | null;
      publisher?: string | null;
      keywords?: string;
    }
  ) {
    const book = await this.repo.findBook(bookId);
    if (!book) throw new AppError(404, 'Book not found');

    const keywords = input.keywords
      ? input.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : undefined;

    const updated = await this.repo.updateBook(bookId, {
      title: input.title,
      category: input.category,
      publishYear: input.publishYear,
      author: input.author !== undefined ? input.author?.trim() || null : undefined,
      publisher: input.publisher !== undefined ? input.publisher?.trim() || null : undefined,
      keywords,
    });

    await this.audit?.log({
      userId: librarianId,
      action: 'UPDATE_BOOK',
      entity: 'books',
      entityId: bookId,
    });

    return updated;
  }

  async deleteBook(librarianId: string, bookId: string) {
    const book = await this.repo.findBook(bookId);
    if (!book) throw new AppError(404, 'Book not found');

    await this.repo.deleteBook(bookId);

    const filename = book.filePath.replace(/^\/uploads\//, '');
    try {
      await fs.unlink(path.resolve(this.uploadDir, filename));
    } catch {
      /* file may be missing */
    }

    await this.audit?.log({
      userId: librarianId,
      action: 'DELETE_BOOK',
      entity: 'books',
      entityId: bookId,
      details: { title: book.title },
    });

    return { ok: true };
  }
}
