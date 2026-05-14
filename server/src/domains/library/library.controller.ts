import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import { createBookFieldsSchema, listBooksQuerySchema } from './library.schemas.js';
import type { LibraryService } from './library.service.js';

export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  listBooks = async (req: Request, res: Response) => {
    const q = listBooksQuerySchema.parse(req.query);
    const result = await this.library.listBooks({
      page: q.page,
      pageSize: q.pageSize,
      keyword: q.keyword,
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
      departmentId: body.departmentId,
      publishYear: body.publishYear,
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
}
