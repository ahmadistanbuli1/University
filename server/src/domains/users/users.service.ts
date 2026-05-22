import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import { hashPassword } from '../../utils/password.js';
import type { UsersRepository } from './users.repository.js';
import type { ListUsersFilters } from './users.repository.js';

type StudentProfileInput = {
  departmentId: string;
  academicNumber: string;
  currentSemester: number;
  academicYear: string;
};

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

  async listUsers(filters: ListUsersFilters) {
    const [items, total] = await this.users.listUsers(filters);
    return { items, total, page: filters.page, pageSize: filters.pageSize };
  }

  async getUserForAdmin(actorRole: UserRole, targetUserId: string) {
    if (actorRole !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const user = await this.users.findById(targetUserId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    const { password: _p, ...rest } = user;
    return rest;
  }

  async createUser(
    actorRole: UserRole,
    input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      collegeId?: string | null;
      studentProfile?: StudentProfileInput;
    }
  ) {
    if (actorRole !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }

    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    if (input.role === 'MANAGER' && !input.collegeId) {
      throw new AppError(400, 'College manager requires a college');
    }

    if (input.role === 'STUDENT' && input.studentProfile) {
      const dup = await this.users.findStudentByAcademicNumber(input.studentProfile.academicNumber);
      if (dup) {
        throw new AppError(409, 'Academic number already in use');
      }
    }

    let collegeId = input.collegeId ?? null;
    if (input.role === 'STUDENT' && input.studentProfile) {
      const dept = await this.users.findDepartmentById(input.studentProfile.departmentId);
      if (!dept) {
        throw new AppError(400, 'Invalid department');
      }
      collegeId = dept.collegeId;
    }

    const hashed = await hashPassword(input.password);
    const user = await this.users.createUser({
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role,
      active: true,
      ...(collegeId ? { college: { connect: { id: collegeId } } } : {}),
    });

    if (input.role === 'STUDENT' && input.studentProfile) {
      await this.users.createStudentProfile({
        userId: user.id,
        ...input.studentProfile,
      });
    }

    const refreshed = await this.users.findById(user.id);
    if (!refreshed) throw new AppError(500, 'User create failed');
    const { password: _p, ...rest } = refreshed;
    return rest;
  }

  async updateUser(
    actorRole: UserRole,
    targetUserId: string,
    updates: {
      name?: string;
      email?: string;
      role?: UserRole;
      collegeId?: string | null;
      active?: boolean;
      password?: string;
      studentProfile?: Partial<StudentProfileInput>;
    }
  ) {
    if (actorRole !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }

    const target = await this.users.findById(targetUserId);
    if (!target) {
      throw new AppError(404, 'User not found');
    }

    if (updates.active === false && target.role === 'ADMIN') {
      const adminCount = await this.users.countAdmins();
      if (adminCount <= 1) {
        throw new AppError(400, 'Cannot deactivate the last active admin');
      }
    }

    if (updates.email && updates.email !== target.email) {
      const existing = await this.users.findByEmail(updates.email);
      if (existing && existing.id !== targetUserId) {
        throw new AppError(409, 'Email already registered');
      }
    }

    const newRole = updates.role ?? target.role;
    const newCollegeId = updates.collegeId !== undefined ? updates.collegeId : target.collegeId;
    if (newRole === 'MANAGER' && !newCollegeId) {
      throw new AppError(400, 'College manager requires a college');
    }

    if (updates.studentProfile?.academicNumber) {
      const dup = await this.users.findStudentByAcademicNumber(updates.studentProfile.academicNumber);
      if (dup && dup.userId !== targetUserId) {
        throw new AppError(409, 'Academic number already in use');
      }
    }

    const data: Parameters<UsersRepository['updateUser']>[1] = {};
    if (updates.name) data.name = updates.name;
    if (updates.email) data.email = updates.email;
    if (updates.role) data.role = updates.role;
    if (updates.active !== undefined) data.active = updates.active;
    if (updates.password) data.password = await hashPassword(updates.password);
    if (updates.collegeId !== undefined) {
      data.college =
        updates.collegeId === null
          ? { disconnect: true }
          : { connect: { id: updates.collegeId } };
    }

    await this.users.updateUser(targetUserId, data);

    if (updates.studentProfile && target.studentProfile) {
      await this.users.updateStudentProfile(target.studentProfile.id, updates.studentProfile);
    } else if (updates.studentProfile && newRole === 'STUDENT' && !target.studentProfile) {
      await this.users.createStudentProfile({
        userId: targetUserId,
        departmentId: updates.studentProfile.departmentId!,
        academicNumber: updates.studentProfile.academicNumber!,
        currentSemester: updates.studentProfile.currentSemester ?? 1,
        academicYear: updates.studentProfile.academicYear ?? '2025-2026',
      });
    }

    const refreshed = await this.users.findById(targetUserId);
    if (!refreshed) throw new AppError(404, 'User not found');
    const { password: _p, ...rest } = refreshed;
    return rest;
  }

  /** @deprecated use updateUser */
  async updateUserRole(
    actorRole: UserRole,
    targetUserId: string,
    updates: { role?: UserRole; collegeId?: string | null }
  ) {
    return this.updateUser(actorRole, targetUserId, updates);
  }
}
