import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  createBookFieldsSchema,
  listBooksQuerySchema,
  updateBookSchema,
} from './library.schemas.js';
import type { LibraryService } from './library.service.js';

export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  listBooks = async (req: Request, res: Response) => {
    const q = listBooksQuerySchema.parse(req.query);
    const result = await this.library.listBooks({
      page: q.page,
      pageSize: q.pageSize,
      keyword: q.keyword,
      category: q.category,
      publishYear: q.publishYear,
      author: q.author,
      publisher: q.publisher,
    });
    res.json(result);
  };

  createBook = async (req: Request, res: Response) => {
    const body = createBookFieldsSchema.parse(req.body);
    const keywords = body.keywords
      ? body.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }
    const filePath = `/uploads/${file.filename}`;
    const book = await this.library.createBook({
      librarianId: req.authUser!.id,
      title: body.title,
      filePath,
      category: body.category,
      departmentId: body.departmentId,
      publishYear: body.publishYear,
      author: body.author,
      publisher: body.publisher,
      keywords,
    });
    res.status(201).json(book);
  };

  patchRead = async (req: Request, res: Response) => {
    const updated = await this.library.incrementRead(paramId(req));
    res.json(updated);
  };

  patchDownload = async (req: Request, res: Response) => {
    const updated = await this.library.incrementDownload(paramId(req));
    res.json(updated);
  };

  stats = async (_req: Request, res: Response) => {
    const data = await this.library.getLibrarianStats();
    res.json(data);
  };

  updateBook = async (req: Request, res: Response) => {
    const body = updateBookSchema.parse(req.body);
    const updated = await this.library.updateBook(req.authUser!.id, paramId(req), body);
    res.json(updated);
  };

  deleteBook = async (req: Request, res: Response) => {
    const result = await this.library.deleteBook(req.authUser!.id, paramId(req));
    res.json(result);
  };

  listFavoriteIds = async (req: Request, res: Response) => {
    const bookIds = await this.library.listFavoriteBookIds(req.authUser!.id);
    res.json({ bookIds });
  };

  listFavorites = async (req: Request, res: Response) => {
    const q = listBooksQuerySchema.parse(req.query);
    const result = await this.library.listFavoriteBooks(req.authUser!.id, {
      page: q.page,
      pageSize: q.pageSize,
      keyword: q.keyword,
      category: q.category,
      publishYear: q.publishYear,
      author: q.author,
      publisher: q.publisher,
    });
    res.json(result);
  };

  toggleFavorite = async (req: Request, res: Response) => {
    const result = await this.library.toggleFavorite(req.authUser!.id, paramId(req));
    res.json(result);
  };

  removeFavorite = async (req: Request, res: Response) => {
    const result = await this.library.removeFavorite(req.authUser!.id, paramId(req));
    res.json(result);
  };
}
