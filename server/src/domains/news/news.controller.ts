import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import { createNewsSchema, newsPaginationSchema, updateNewsSchema } from './news.schemas.js';
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
    const body = createNewsSchema.parse(req.body);
    const created = await this.news.createNews({
      authorId: req.authUser!.id,
      role: req.authUser!.role,
      collegeId: body.collegeId,
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl,
      authorCollegeId: req.authUser!.collegeId ?? null,
      category: body.category,
      enablePayNow: body.enablePayNow,
      tuitionSemesterKey: body.tuitionSemesterKey ?? null,
      scope: body.scope,
    });
    res.status(201).json(created);
  };

  update = async (req: Request, res: Response) => {
    const body = updateNewsSchema.parse(req.body);
    const updated = await this.news.updateNews(paramId(req), {
      id: req.authUser!.id,
      role: req.authUser!.role,
      collegeId: req.authUser!.collegeId ?? null,
    }, body);
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
