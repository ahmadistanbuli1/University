import type { UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { AuditService } from '../audit/audit.service.js';
import type { CurriculumRepository } from './curriculum.repository.js';

export class CurriculumService {
  constructor(
    private readonly repo: CurriculumRepository,
    private readonly audit: AuditService
  ) {}

  async list(
    role: UserRole,
    collegeId: string | null,
    params: { departmentId?: string; studyYear?: number }
  ) {
    if (role === 'ADMIN') {
      const rows = await this.repo.listCurriculum(params);
      return { grouped: this.repo.groupByYearAndTerm(rows), flat: rows };
    }
    if (role === 'MANAGER') {
      if (!collegeId) {
        throw new AppError(403, 'College not assigned to manager');
      }
      if (params.departmentId) {
        const dept = await this.repo.findDepartment(params.departmentId);
        if (!dept || dept.collegeId !== collegeId) {
          throw new AppError(403, 'Department not in your college');
        }
      }
      const rows = await this.repo.listCurriculum({ ...params, collegeId });
      return { grouped: this.repo.groupByYearAndTerm(rows), flat: rows };
    }
    throw new AppError(403, 'Forbidden');
  }

  async updateName(actorId: string, role: UserRole, id: string, name: string) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const row = await this.repo.findCurriculumById(id);
    if (!row) {
      throw new AppError(404, 'Curriculum course not found');
    }
    const updated = await this.repo.updateCurriculumName(id, name, row.code);
    await this.audit.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'CurriculumCourse',
      entityId: id,
      details: { name, code: row.code },
    });
    return updated;
  }

  async delete(actorId: string, role: UserRole, id: string) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const row = await this.repo.findCurriculumById(id);
    if (!row) {
      throw new AppError(404, 'Curriculum course not found');
    }
    await this.repo.deleteCurriculum(id, row.code);
    await this.audit.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'CurriculumCourse',
      entityId: id,
      details: { code: row.code, name: row.name },
    });
    return { ok: true };
  }
}
