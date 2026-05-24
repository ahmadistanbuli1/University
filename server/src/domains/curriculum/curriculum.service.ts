import type { StudyTerm, UserRole } from '@prisma/client';
import { maxStudyYearsForDepartment } from '../../lib/dept-study-years.js';
import {
  curriculumCodeForSlot,
  nextCurriculumSlotIndex,
} from '../../lib/curriculum-code.js';
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

  async create(
    actorId: string,
    role: UserRole,
    input: {
      departmentId: string;
      studyYear: number;
      term: StudyTerm;
      name: string;
      code?: string;
    }
  ) {
    if (role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const dept = await this.repo.findDepartment(input.departmentId);
    if (!dept) {
      throw new AppError(400, 'Invalid department');
    }
    const maxYears = maxStudyYearsForDepartment(dept.code);
    if (input.studyYear < 1 || input.studyYear > maxYears) {
      throw new AppError(400, `Study year must be between 1 and ${maxYears} for this department`);
    }

    const slotRows = await this.repo.listCodesInSlot(
      input.departmentId,
      input.studyYear,
      input.term
    );
    const sortOrder =
      slotRows.length > 0 ? Math.max(...slotRows.map((r) => r.sortOrder)) + 1 : 0;

    let code = input.code?.trim().toUpperCase();
    if (code) {
      const existing = await this.repo.findCurriculumByCode(code);
      if (existing) {
        throw new AppError(409, `Course code already exists: ${code}`);
      }
    } else {
      let index = nextCurriculumSlotIndex(
        slotRows.map((r) => r.code),
        dept.code
      );
      do {
        code = curriculumCodeForSlot(dept.code, input.studyYear, input.term, index);
        const taken = await this.repo.findCurriculumByCode(code);
        if (!taken) break;
        index++;
      } while (index < 100);
      if (!code) {
        throw new AppError(500, 'Could not generate unique course code');
      }
    }

    const created = await this.repo.createCurriculum({
      departmentId: input.departmentId,
      studyYear: input.studyYear,
      term: input.term,
      name: input.name.trim(),
      code,
      sortOrder,
    });

    await this.audit.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'CurriculumCourse',
      entityId: created.id,
      details: { code, name: input.name, studyYear: input.studyYear, term: input.term },
    });

    return created;
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
