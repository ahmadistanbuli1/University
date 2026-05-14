import type { StructureRepository } from './structure.repository.js';

export class StructureService {
  constructor(private readonly repo: StructureRepository) {}

  getColleges() {
    return this.repo.listColleges();
  }

  getDepartments(collegeId?: string) {
    return this.repo.listDepartments(collegeId);
  }

  getCourses() {
    return this.repo.listCourses();
  }
}
