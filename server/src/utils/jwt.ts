import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import type { Env } from '../config.js';

export type JwtPayload = {
  sub: string;
  role: UserRole;
  email: string;
  collegeId?: string | null;
};

export function signToken(env: Env, payload: JwtPayload): string {
  const options = { expiresIn: env.JWT_EXPIRES_IN } as SignOptions;
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(env: Env, token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token payload');
  }
  const { sub, role, email, collegeId } = decoded as Record<string, unknown>;
  if (typeof sub !== 'string' || typeof role !== 'string' || typeof email !== 'string') {
    throw new Error('Invalid token shape');
  }
  const college =
    collegeId === undefined || collegeId === null
      ? null
      : typeof collegeId === 'string'
        ? collegeId
        : null;
  return { sub, role: role as JwtPayload['role'], email, collegeId: college };
}
