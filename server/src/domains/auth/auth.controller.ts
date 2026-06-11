import type { Request, Response } from 'express';
import type { Env } from '../../config.js';
import { clearAuthCookie, setAuthCookie } from '../../lib/auth-cookie.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly env: Env
  ) {}

  login = async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const result = await this.auth.login(body.email, body.password);
    setAuthCookie(res, result.token, this.env);
    res.json({ user: result.user });
  };

  register = async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);
    const result = await this.auth.register(body);
    setAuthCookie(res, result.token, this.env);
    res.status(201).json({ user: result.user });
  };

  logout = async (req: Request, res: Response) => {
    if (req.authUser) {
      await this.auth.logout(req.authUser.id);
    }
    clearAuthCookie(res, this.env);
    res.json({ success: true });
  };

  me = async (req: Request, res: Response) => {
    const user = await this.auth.getMe(req.authUser!.id);
    res.json({ user });
  };
}
