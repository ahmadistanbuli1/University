import type { StudyTerm, UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { AcademicRepository } from './academic.repository.js';
import type { AuditService } from '../audit/audit.service.js';
import type { NotificationDispatchService } from '../notifications/notification.service.js';
import { computeGpaFromLatestAttempts } from './gpa.js';
import {
  averageCourseTotals,
  courseTotalScore,
  examScoresByCourseCode,
  isCourseReachable,
  isCurrentTermFullyGraded,
  isPracticalPass,
  studyYearFromSemester,
  termFromSemester,
} from './study-plan.js';

import { groupEnrollmentsForCurrentYear } from '../../lib/student-enrollment.js';
import { DEPT_MAX_STUDY_YEARS } from '../../lib/dept-study-years.js';

export class AcademicService {
  constructor(
    private readonly repo: AcademicRepository,
    private readonly audit: AuditService | null,
    private readonly notify: NotificationDispatchService | null
  ) {}

  async getMyEnrollments(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentWithDepartment(userId);
    if (!student) {
      return { studyYear: 1, terms: [] };
    }
    const enrollments = await this.repo.listEnrollments(student.id);
    return groupEnrollmentsForCurrentYear(enrollments, student.currentSemester);
  }

  async getMyResults(userId: string, role: UserRole) {
    if (role !== 'STUDENT' && role !== 'FACULTY') {
      throw new AppError(403, 'Forbidden');
    }
    const student = await this.repo.findStudentWithDepartment(userId);
    if (!student) {
      return { results: [], gpa: null, pendingCurrentTerm: true };
    }

    const studyYear = studyYearFromSemester(student.currentSemester);
    const currentTerm = termFromSemester(student.currentSemester);
    const curriculum = await this.repo.listCurriculumCourses(student.departmentId, studyYear);
    const currentTermCodes = curriculum
      .filter((c) => c.term === currentTerm)
      .map((c) => c.code);

    const allResults = await this.repo.listExamResults(student.id);
    const examRows = allResults.map((r) => ({
      courseCode: r.facultyCourse.course.code,
      practicalScore:
        r.practicalScore != null ? Number(r.practicalScore) : null,
      theoryScore: r.theoryScore != null ? Number(r.theoryScore) : null,
    }));

    const termComplete = isCurrentTermFullyGraded(
      currentTermCodes,
      examRows,
      studyYear,
      currentTerm
    );

    if (!termComplete) {
      return { results: [], gpa: null, pendingCurrentTerm: true };
    }

    const completeResults = allResults.filter(
      (r) => r.practicalScore != null && r.theoryScore != null
    );
    const gpa = computeGpaFromLatestAttempts(
      completeResults.map((r) => ({
        facultyCourseId: r.facultyCourseId,
        attemptNumber: r.attemptNumber,
        score: r.score,
      }))
    );
    return { results: completeResults, gpa, pendingCurrentTerm: false };
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
    facultyCourseId: string;
    academicNumber: string;
    practicalScore: number;
    theoryScore: number;
    role?: UserRole;
  }) {
    if (input.role === 'FACULTY') {
      throw new AppError(
        403,
        'Faculty must submit grades via the grade submission workflow for exam officer review'
      );
    }
    const fc = await this.repo.findFacultyCourse(input.facultyCourseId);
    if (!fc || fc.facultyId !== input.facultyUserId) {
      throw new AppError(403, 'Not assigned to this course');
    }

    const student = await this.repo.findStudentByAcademicNumber(input.academicNumber.trim());
    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    const roster = await this.repo.listStudentsEnrolledInCourse(fc.courseId);
    if (!roster.some((e) => e.student.id === student.id)) {
      throw new AppError(400, 'Student is not enrolled in this course');
    }

    const total =
      Math.round((input.practicalScore + input.theoryScore) * 100) / 100;

    const created = await this.repo.upsertExamResult({
      studentId: student.id,
      facultyCourseId: input.facultyCourseId,
      score: total,
      practicalScore: input.practicalScore,
      theoryScore: input.theoryScore,
      semester: fc.semester,
      academicYear: fc.academicYear,
    });

    const curriculum = await this.repo.findCurriculumCourseByCode(fc.course.code);
    if (curriculum) {
      await this.repo.upsertCurriculumGrade({
        studentId: student.id,
        curriculumCourseId: curriculum.id,
        practicalScore: input.practicalScore,
        theoryScore: input.theoryScore,
      });
    }

    await this.audit?.log({
      userId: input.facultyUserId,
      action: 'CREATE_GRADE',
      entity: 'exam_results',
      entityId: created.id,
      details: {
        score: total,
        studentId: student.id,
        academicNumber: input.academicNumber,
      },
    });
    await this.notify?.notifyGradePublished(student.userId, fc.course.name);
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

    const allExam = await this.repo.listExamResults(student.id);
    const examByCode = examScoresByCourseCode(
      allExam.map((r) => ({
        courseCode: r.facultyCourse.course.code,
        practicalScore:
          r.practicalScore != null ? Number(r.practicalScore) : null,
        theoryScore: r.theoryScore != null ? Number(r.theoryScore) : null,
      }))
    );

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

        let practicalNum =
          grade?.practicalScore != null ? Number(grade.practicalScore) : null;
        let theoryNum = grade?.theoryScore != null ? Number(grade.theoryScore) : null;
        const fromExam = examByCode.get(course.code);
        if (practicalNum == null && fromExam?.practical != null) {
          practicalNum = fromExam.practical;
        }
        if (theoryNum == null && fromExam?.theory != null) {
          theoryNum = fromExam.theory;
        }

        const practicalPublished = reachable && practicalNum != null;
        const theoryPublished = reachable && theoryNum != null;
        const practicalFailed =
          practicalPublished && !isPracticalPass(practicalNum!);
        const theoryBlocked =
          practicalPublished && (practicalFailed || !theoryPublished);
        const hasFullGrade = practicalPublished && theoryPublished;

        const total =
          hasFullGrade && practicalNum != null && theoryNum != null
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
          practicalDisplay: practicalPublished ? String(practicalNum) : '—',
          theoryDisplay: theoryPublished
            ? String(theoryNum)
            : practicalFailed
              ? '—'
              : '—',
          hasGrade: hasFullGrade,
          practicalPublished,
          theoryPublished,
          practicalFailed,
          theoryBlocked,
        };
      });

      const termTotals = courseRows
        .filter((r) => r.hasGrade && r.totalScore != null)
        .map((r) => r.totalScore as number);
      const termGpa = averageCourseTotals(termTotals);

      return { term, courses: courseRows, termGpa };
    });

    const yearTotals = termBlocks
      .flatMap((t) => t.courses)
      .filter((c) => c.hasGrade && c.totalScore != null)
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
