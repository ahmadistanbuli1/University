import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { UsersRepository } from './users.repository.js';

export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    const { password: _p, ...rest } = user;
    return rest;
  }

  async listFaculty() {
    return this.users.listFaculty();
  }

  async listUsers(page: number, pageSize: number) {
    const [items, total] = await this.users.listUsers({ page, pageSize });
    return { items, total, page, pageSize };
  }

  async updateUserRole(
    actorRole: UserRole,
    targetUserId: string,
    updates: { role?: UserRole; collegeId?: string | null }
  ) {
    if (actorRole !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    return this.users.updateUser(targetUserId, {
      ...(updates.role ? { role: updates.role } : {}),
      ...(updates.collegeId !== undefined ? { collegeId: updates.collegeId } : {}),
    });
  }
}
