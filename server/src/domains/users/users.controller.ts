import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import { adminUpdateUserSchema, paginationQuerySchema } from './users.schemas.js';
import type { UsersService } from './users.service.js';

export class UsersController {
  constructor(private readonly users: UsersService) {}

  me = async (req: Request, res: Response) => {
    const userId = req.authUser!.id;
    const profile = await this.users.getMe(userId);
    res.json(profile);
  };

  facultyDirectory = async (_req: Request, res: Response) => {
    const list = await this.users.listFaculty();
    res.json(list);
  };

  listUsers = async (req: Request, res: Response) => {
    const q = paginationQuerySchema.parse(req.query);
    const result = await this.users.listUsers(q.page, q.pageSize);
    res.json(result);
  };

  patchUser = async (req: Request, res: Response) => {
    const body = adminUpdateUserSchema.parse(req.body);
    const updated = await this.users.updateUserRole(req.authUser!.role, paramId(req), body);
    res.json(updated);
  };
}
