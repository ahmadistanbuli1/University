import type { Request, Response } from 'express';
import { paramId } from '../../utils/paramId.js';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  listUsersQuerySchema,
} from './users.schemas.js';
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
    const q = listUsersQuerySchema.parse(req.query);
    const result = await this.users.listUsers({
      page: q.page,
      pageSize: q.pageSize,
      search: q.search,
      role: q.role,
      collegeId: q.collegeId,
      departmentId: q.departmentId,
      active: q.active,
    });
    res.json(result);
  };

  getUser = async (req: Request, res: Response) => {
    const user = await this.users.getUserForAdmin(req.authUser!.role, paramId(req));
    res.json(user);
  };

  createUser = async (req: Request, res: Response) => {
    const body = adminCreateUserSchema.parse(req.body);
    const created = await this.users.createUser(req.authUser!.role, body);
    res.status(201).json(created);
  };

  patchUser = async (req: Request, res: Response) => {
    const body = adminUpdateUserSchema.parse(req.body);
    const updated = await this.users.updateUser(req.authUser!.role, paramId(req), body);
    res.json(updated);
  };

  deactivateUser = async (req: Request, res: Response) => {
    const updated = await this.users.updateUser(req.authUser!.role, paramId(req), { active: false });
    res.json(updated);
  };
}
