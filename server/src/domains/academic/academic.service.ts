import type { StudyTerm, UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { AcademicRepository } from './academic.repository.js';
import type { AuditService } from '../audit/audit.service.js';
import { computeGpaFromLatestAttempts } from './gpa.js';
import {
  averageCourseTotals,
  courseTotalScore,
  isCourseReachable,
  studyYearFromSemester,
  termFromSemester,
} from './study-plan.js';

const DEPT_MAX_STUDY_YEARS: Record<string, number> = {
  INFO_ENG: 5,
  MED_ENG: 5,
  ALT_ENERGY_ENG: 5,
  ANESTHESIA: 4,
  ADMIN_SCI: 4,
  PHARMACY: 4,
  ENGLISH_LIT: 4,
};

export class AcademicService {
  constructor(
    private readonly repo: AcademicRepository,
    private readonly audit: AuditService | null
  ) {}

  async getMyEnrollments(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) {
      return [];
    }
    return this.repo.listEnrollments(student.id);
  }

  async getMyResults(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentByUserId(userId);
    if (!student) {
      return { results: [], gpa: 0 };
    }
    const results = await this.repo.listExamResults(student.id);
    const gpa = computeGpaFromLatestAttempts(
      results.map((r) => ({
        facultyCourseId: r.facultyCourseId,
        attemptNumber: r.attemptNumber,
        score: r.score,
      }))
    );
    return { results, gpa };
  }

  async getSectionRoster(facultyUserId: string, role: UserRole, facultyCourseId: string) {
    const fc = await this.repo.findFacultyCourse(facultyCourseId);
    if (!fc) {
      throw new AppError(404, 'Course section not found');
    }
    if (role === 'FACULTY' && fc.facultyId !== facultyUserId) {
      throw new AppError(403, 'Forbidden');
    }
    if (role !== 'FACULTY' && role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const enrollments = await this.repo.listStudentsEnrolledInCourse(fc.courseId);
    return enrollments.map((e) => ({
      studentId: e.student.id,
      academicNumber: e.student.academicNumber,
      name: e.student.user.name,
      email: e.student.user.email,
      department: e.student.department.name,
      currentSemester: e.student.currentSemester,
    }));
  }

  async submitResult(input: {
    facultyUserId: string;
    studentId: string;
    facultyCourseId: string;
    score: number;
    semester: string;
    academicYear: string;
    attemptNumber?: number;
  }) {
    const fc = await this.repo.findFacultyCourse(input.facultyCourseId);
    if (!fc || fc.facultyId !== input.facultyUserId) {
      throw new AppError(403, 'Not assigned to this course section');
    }
    const roster = await this.repo.listStudentsEnrolledInCourse(fc.courseId);
    if (!roster.some((e) => e.student.id === input.studentId)) {
      throw new AppError(400, 'Student is not enrolled in this course');
    }
    const attempt = input.attemptNumber ?? 1;
    const created = await this.repo.createExamResult({
      studentId: input.studentId,
      facultyCourseId: input.facultyCourseId,
      score: input.score,
      attemptNumber: attempt,
      semester: input.semester,
      academicYear: input.academicYear,
    });
    await this.audit?.log({
      userId: input.facultyUserId,
      action: 'CREATE_GRADE',
      entity: 'exam_results',
      entityId: created.id,
      details: { score: input.score, studentId: input.studentId },
    });
    return created;
  }

  async getAnalytics(params: { requesterId: string; role: UserRole; facultyCourseId: string }) {
    const fc = await this.repo.findFacultyCourse(params.facultyCourseId);
    if (!fc) {
      throw new AppError(404, 'Course section not found');
    }
    if (params.role === 'FACULTY' && fc.facultyId !== params.requesterId) {
      throw new AppError(403, 'Forbidden');
    }
    if (params.role !== 'FACULTY' && params.role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden');
    }
    const rows = await this.repo.analyticsForFacultyCourse(params.facultyCourseId);
    const scores = rows.map((r) => Number(r.score.toString()));
    const count = scores.length;
    const average = count === 0 ? 0 : Math.round((scores.reduce((a, b) => a + b, 0) / count) * 100) / 100;
    const passCount = scores.filter((s) => s >= 50).length;
    const passRate = count === 0 ? 0 : Math.round((passCount / count) * 10000) / 100;
    const bands = [
      { range: '0–49', min: 0, max: 49 },
      { range: '50–59', min: 50, max: 59 },
      { range: '60–69', min: 60, max: 69 },
      { range: '70–79', min: 70, max: 79 },
      { range: '80–89', min: 80, max: 89 },
      { range: '90–100', min: 90, max: 100 },
    ];
    const scoreDistribution = bands.map(({ range, min, max }) => ({
      range,
      count: scores.filter((s) => s >= min && s <= max).length,
    }));
    return {
      facultyCourseId: params.facultyCourseId,
      averageScore: average,
      passRatePercent: passRate,
      sampleSize: count,
      scoreDistribution,
    };
  }

  async getMyStudyPlan(userId: string, role: UserRole, requestedStudyYear?: number) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentWithDepartment(userId);
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const deptCode = student.department.code;
    const maxStudyYears = DEPT_MAX_STUDY_YEARS[deptCode] ?? 4;
    const currentStudyYear = studyYearFromSemester(student.currentSemester);
    const currentTerm = termFromSemester(student.currentSemester);
    const studyYear = requestedStudyYear ?? currentStudyYear;

    if (studyYear < 1 || studyYear > maxStudyYears) {
      throw new AppError(400, 'Invalid study year');
    }

    const courses = await this.repo.listCurriculumCourses(student.departmentId, studyYear);
    const grades = await this.repo.listCurriculumGradesForYear(student.id, studyYear);
    const gradeByCourseId = new Map(grades.map((g) => [g.curriculumCourseId, g]));

    const terms: StudyTerm[] = ['FIRST', 'SECOND'];
    const termBlocks = terms.map((term) => {
      const termCourses = courses.filter((c) => c.term === term);
      const courseRows = termCourses.map((course) => {
        const grade = gradeByCourseId.get(course.id);
        const reachable = isCourseReachable(
          student.currentSemester,
          course.studyYear,
          course.term
        );
        const hasGrade =
          reachable &&
          grade?.practicalScore != null &&
          grade?.theoryScore != null;
        const practicalNum = hasGrade ? Number(grade!.practicalScore!.toString()) : null;
        const theoryNum = hasGrade ? Number(grade!.theoryScore!.toString()) : null;
        const total =
          practicalNum != null && theoryNum != null
            ? courseTotalScore(practicalNum, theoryNum)
            : null;

        return {
          id: course.id,
          code: course.code,
          name: course.name,
          practicalPass: course.practicalPass,
          theoryPass: course.theoryPass,
          practicalScore: practicalNum,
          theoryScore: theoryNum,
          totalScore: total,
          practicalDisplay: hasGrade ? String(practicalNum) : '—',
          theoryDisplay: hasGrade ? String(theoryNum) : '—',
          hasGrade,
        };
      });

      const termTotals = courseRows
        .filter((r) => r.totalScore != null)
        .map((r) => r.totalScore as number);
      const termGpa = averageCourseTotals(termTotals);

      return { term, courses: courseRows, termGpa };
    });

    const yearTotals = termBlocks
      .flatMap((t) => t.courses)
      .filter((c) => c.totalScore != null)
      .map((c) => c.totalScore as number);
    const yearGpa = averageCourseTotals(yearTotals);

    return {
      departmentCode: deptCode,
      maxStudyYears,
      currentStudyYear,
      currentTerm,
      selectedStudyYear: studyYear,
      yearGpa,
      terms: termBlocks,
    };
  }
}
