import type { UserRole } from '@prisma/client';
import type { Env } from '../../config.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import type { AuthRepository } from './auth.repository.js';
import type { AuditService } from '../audit/audit.service.js';

export class AuthService {
  constructor(
    private readonly users: AuthRepository,
    private readonly audit: AuditService | null,
    private readonly env: Env
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      throw new AppError(401, 'Invalid credentials');
    }
    const token = signToken(this.env, {
      sub: user.id,
      role: user.role,
      email: user.email,
      collegeId: user.collegeId,
    });
    await this.audit?.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'users',
      entityId: user.id,
    });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(input: { name: string; email: string; password: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }
    const hashed = await hashPassword(input.password);
    const user = await this.users.createUser({
      name: input.name,
      email: input.email,
      password: hashed,
      role: 'STUDENT' as UserRole,
    });
    await this.audit?.log({
      userId: user.id,
      action: 'REGISTER',
      entity: 'users',
      entityId: user.id,
    });
    const token = signToken(this.env, {
      sub: user.id,
      role: user.role,
      email: user.email,
      collegeId: user.collegeId,
    });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
