import type { Env } from '../../config.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { prisma } from '../../lib/prisma.js';
import {
  normalizeRegistrationSemester,
  syncStudentDepartmentEnrollments,
} from '../../lib/student-enrollment.js';
import { ensureStudentTuitionInstallments } from '../../lib/tuition-bootstrap.js';
import { maxStudyYearsForDepartment } from '../../lib/dept-study-years.js';
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
    if (user.active === false) {
      throw new AppError(403, 'Account is deactivated');
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

  async register(input: {
    name: string;
    email: string;
    password: string;
    departmentId: string;
    academicNumber: string;
    currentSemester: number;
    academicYear: string;
  }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const department = await this.users.findDepartmentById(input.departmentId);
    if (!department) {
      throw new AppError(400, 'Invalid department');
    }

    const existingNumber = await this.users.findStudentByAcademicNumber(input.academicNumber);
    if (existingNumber) {
      throw new AppError(409, 'Academic number already registered');
    }

    const maxStudyYears = maxStudyYearsForDepartment(department.code);
    const currentSemester = normalizeRegistrationSemester(
      input.currentSemester,
      maxStudyYears
    );

    const hashed = await hashPassword(input.password);
    const user = await this.users.createStudentUser({
      name: input.name,
      email: input.email,
      password: hashed,
      collegeId: department.collegeId,
      departmentId: input.departmentId,
      academicNumber: input.academicNumber,
      currentSemester,
      academicYear: input.academicYear,
    });
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (student) {
      await syncStudentDepartmentEnrollments(prisma, {
        studentId: student.id,
        departmentId: input.departmentId,
        academicYear: input.academicYear,
      });
      await ensureStudentTuitionInstallments(
        prisma,
        student.id,
        department.collegeId,
        input.academicYear
      );
    }
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
