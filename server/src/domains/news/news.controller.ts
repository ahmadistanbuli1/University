import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  newsPaginationSchema,
  parseNewsFormBody,
  parseNewsUpdateBody,
} from './news.schemas.js';
import { parseNewsMultipartUploads } from './news-uploads.js';
import type { NewsService } from './news.service.js';

export class NewsController {
  constructor(private readonly news: NewsService) {}

  list = async (req: Request, res: Response) => {
    const q = newsPaginationSchema.parse(req.query);
    const data = await this.news.listPublic(q.page, q.pageSize, {
      collegeId: q.collegeId,
      category: q.category,
    });
    res.json(data);
  };

  getById = async (req: Request, res: Response) => {
    const item = await this.news.getById(paramId(req));
    res.json(item);
  };

  create = async (req: Request, res: Response) => {
    const uploads = parseNewsMultipartUploads(req);
    const body = parseNewsFormBody({
      ...(req.body as Record<string, unknown>),
      ...(uploads.coverUrl ? { imageUrl: uploads.coverUrl } : {}),
    });
    const created = await this.news.createNews({
      authorId: req.authUser!.id,
      role: req.authUser!.role,
      collegeId: body.collegeId,
      title: body.title,
      summary: body.summary,
      content: body.content,
      imageUrl: body.imageUrl,
      gallery: uploads.gallery,
      authorCollegeId: req.authUser!.collegeId ?? null,
      category: body.category,
      enablePayNow: body.enablePayNow,
      tuitionSemesterKey: body.tuitionSemesterKey ?? null,
      scope: body.scope,
    });
    res.status(201).json(created);
  };

  update = async (req: Request, res: Response) => {
    const uploads = parseNewsMultipartUploads(req);
    const body = parseNewsUpdateBody({
      ...(req.body as Record<string, unknown>),
      ...(uploads.coverUrl ? { imageUrl: uploads.coverUrl } : {}),
    });
    const updated = await this.news.updateNews(
      paramId(req),
      {
        id: req.authUser!.id,
        role: req.authUser!.role,
        collegeId: req.authUser!.collegeId ?? null,
      },
      {
        ...body,
        gallery: uploads.gallery.length ? uploads.gallery : undefined,
        removedGalleryIds: body.removedGalleryIds,
      }
    );
    res.json(updated);
  };

  remove = async (req: Request, res: Response) => {
    const result = await this.news.deleteNews(paramId(req), {
      id: req.authUser!.id,
      role: req.authUser!.role,
      collegeId: req.authUser!.collegeId ?? null,
    });
    res.json(result);
  };
}
