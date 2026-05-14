import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const result = await this.auth.login(body.email, body.password);
    res.json(result);
  };

  register = async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);
    const result = await this.auth.register(body);
    res.status(201).json(result);
  };
}
