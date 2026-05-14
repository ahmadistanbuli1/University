import { AppError } from '../../utils/AppError.js';
import type { LibraryRepository } from './library.repository.js';
import type { AuditService } from '../audit/audit.service.js';

export class LibraryService {
  constructor(
    private readonly repo: LibraryRepository,
    private readonly audit: AuditService | null
  ) {}

  async listBooks(params: { page: number; pageSize: number; keyword?: string }) {
    return this.repo.listBooks(params);
  }

  async createBook(input: {
    librarianId: string;
    title: string;
    filePath: string;
    departmentId: string;
    publishYear: number;
    keywords: string[];
  }) {
    const book = await this.repo.createBook({
      title: input.title,
      filePath: input.filePath,
      departmentId: input.departmentId,
      addedById: input.librarianId,
      publishYear: input.publishYear,
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
}
