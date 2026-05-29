import type { UserRole } from '@prisma/client';

import { AppError } from '../../utils/AppError.js';
import { normalizeOfferingTerm } from '../../lib/study-term.js';

import { computePublishedTotal } from '../academic/grade-rules.js';

import type { GradeSubmissionsRepository } from './grade-submissions.repository.js';

import {

  isGradeEntryOpenForTerm,

  parseOfferingMeta,

} from './grade-roster.js';

import {

  savePracticalDraftSchema,

  saveTheoryDraftSchema,

  updatePracticalLinesSchema,

  updateTheoryLinesSchema,

} from './grade-submissions.schemas.js';

import type { AuditService } from '../audit/audit.service.js';

import type { NotificationDispatchService } from '../notifications/notification.service.js';



export class GradeSubmissionsService {

  constructor(

    private readonly repo: GradeSubmissionsRepository,

    private readonly audit: AuditService | null,

    private readonly notify: NotificationDispatchService | null

  ) {}



  private async assertFacultyOwnsCourse(facultyUserId: string, facultyCourseId: string) {

    const fc = await this.repo.findFacultyCourse(facultyCourseId);

    if (!fc) throw new AppError(404, 'Course section not found');

    if (fc.facultyId !== facultyUserId) {

      throw new AppError(403, 'Not assigned to this course section');

    }

    return fc;

  }



  private assertOfferingOpen(courseCode: string) {

    const offering = parseOfferingMeta(courseCode);

    if (!offering) {

      throw new AppError(400, 'Course code does not include study year and term metadata');

    }

    if (!isGradeEntryOpenForTerm(offering.term)) {

      throw new AppError(

        400,

        'First-semester grades are closed. Only second-semester sections can receive grades now.'

      );

    }

    return offering;

  }



  private async validatePracticalLines(courseId: string, courseCode: string, lines: Array<{ studentId: string; practicalScore: number }>) {

    const roster = await this.repo.listEligibleStudentsForCourse(courseId, courseCode);

    const rosterIds = new Set(roster.map((e) => e.student.id));

    for (const line of lines) {

      if (!rosterIds.has(line.studentId)) {

        throw new AppError(400, 'Student is not eligible for this course section');

      }

    }

    if (lines.length === 0) {

      throw new AppError(400, 'At least one student grade is required');

    }

  }



  private async validateTheoryLines(

    courseId: string,

    courseCode: string,

    submissionId: string,

    lines: Array<{ studentId: string; theoryScore: number }>

  ) {

    const roster = await this.repo.listEligibleStudentsForCourse(courseId, courseCode);

    const rosterIds = new Set(roster.map((e) => e.student.id));

    const submission = await this.repo.findById(submissionId);

    if (!submission?.practicalPublishedAt) {

      throw new AppError(400, 'Practical grades must be published before entering theory grades');

    }

    const practicalByStudent = new Map(

      submission.lines.map((l) => [l.studentId, Number(l.practicalScore)])

    );

    for (const line of lines) {

      if (!rosterIds.has(line.studentId)) {

        throw new AppError(400, 'Student is not eligible for this course section');

      }

      if (!practicalByStudent.has(line.studentId)) {

        throw new AppError(400, 'Practical grade is missing for a student');

      }

    }

    if (lines.length === 0) {

      throw new AppError(400, 'At least one student grade is required');

    }

  }



  async getFacultyWorkspace(facultyUserId: string, role: UserRole, facultyCourseId: string) {

    if (role !== 'FACULTY' && role !== 'ADMIN') {

      throw new AppError(403, 'Forbidden');

    }

    const fc =

      role === 'ADMIN'

        ? await this.repo.findFacultyCourse(facultyCourseId)

        : await this.assertFacultyOwnsCourse(facultyUserId, facultyCourseId);

    if (!fc) throw new AppError(404, 'Course section not found');



    const offering = parseOfferingMeta(fc.course.code);

    const gradesOpen = offering ? isGradeEntryOpenForTerm(offering.term) : false;



    const roster = gradesOpen

      ? await this.repo.listEligibleStudentsForCourse(fc.courseId, fc.course.code)

      : [];



    let submission = await this.repo.findByFacultyCourseId(facultyCourseId);



    if (!submission && role === 'FACULTY' && gradesOpen) {

      submission = await this.repo.createDraft({

        facultyCourseId,

        facultyId: fc.facultyId,

      });

    }



    const lineByStudent = new Map(

      (submission?.lines ?? []).map((l) => [

        l.studentId,

        {

          practicalScore: Number(l.practicalScore),

          theoryScore: l.theoryScore != null ? Number(l.theoryScore) : null,

        },

      ])

    );



    const phase = submission?.phase ?? 'PRACTICAL';

    const practicalPublished = Boolean(submission?.practicalPublishedAt);

    const canEdit =

      gradesOpen &&

      (submission == null ||

        submission.status === 'DRAFT' ||

        submission.status === 'REJECTED');



    return {

      facultyCourse: {

        id: fc.id,

        semester: normalizeOfferingTerm(fc.semester, fc.course.code),

        academicYear: fc.academicYear,

        course: fc.course,

      },

      offering,

      gradesOpen,

      submission: submission

        ? {

            id: submission.id,

            status: submission.status,

            phase: submission.phase,

            rejectionReason: submission.rejectionReason,

            submittedAt: submission.submittedAt,

            publishedAt: submission.publishedAt,

            practicalPublishedAt: submission.practicalPublishedAt,

          }

        : null,

      roster: roster.map((e) => ({

        studentId: e.student.id,

        academicNumber: e.student.academicNumber,

        name: e.student.user.name,

        email: e.student.user.email,

        department: e.student.department.name,

        studyYear: offering?.studyYear ?? null,

        practicalScore: lineByStudent.get(e.student.id)?.practicalScore ?? null,

        theoryScore: lineByStudent.get(e.student.id)?.theoryScore ?? null,

      })),

      canEditPractical: canEdit && phase === 'PRACTICAL',

      canEditTheory: canEdit && phase === 'THEORY' && practicalPublished,

      practicalPublished,

      phase,

    };

  }



  async saveDraft(facultyUserId: string, facultyCourseId: string, body: unknown) {

    const fc = await this.assertFacultyOwnsCourse(facultyUserId, facultyCourseId);

    this.assertOfferingOpen(fc.course.code);



    let submission = await this.repo.findByFacultyCourseId(facultyCourseId);

    if (!submission) {

      submission = await this.repo.createDraft({

        facultyCourseId,

        facultyId: facultyUserId,

      });

    }



    if (submission.status === 'SUBMITTED') {

      throw new AppError(400, 'Submission is awaiting exam officer review');

    }

    if (submission.status === 'PUBLISHED') {

      throw new AppError(400, 'Grades for this section are already published');

    }



    if (submission.status === 'REJECTED') {

      submission = await this.repo.updateStatus(submission.id, {

        status: 'DRAFT',

        rejectionReason: null,

        submittedAt: null,

      });

    }



    if (submission.phase === 'PRACTICAL') {

      const { lines } = savePracticalDraftSchema.parse(body);

      await this.validatePracticalLines(fc.courseId, fc.course.code, lines);

      const updated = await this.repo.replaceLines(

        submission.id,

        lines.map((l) => ({ ...l, theoryScore: null }))

      );

      await this.audit?.log({

        userId: facultyUserId,

        action: 'SAVE_PRACTICAL_GRADE_DRAFT',

        entity: 'grade_submissions',

        entityId: submission.id,

      });

      return updated;

    }



    if (!submission.practicalPublishedAt) {

      throw new AppError(400, 'Practical grades must be published before entering theory grades');

    }



    const { lines: theoryLines } = saveTheoryDraftSchema.parse(body);

    await this.validateTheoryLines(fc.courseId, fc.course.code, submission.id, theoryLines);



    const existingPractical = new Map(

      submission.lines.map((l) => [l.studentId, Number(l.practicalScore)])

    );



    const merged = theoryLines.map((l) => ({

      studentId: l.studentId,

      practicalScore: existingPractical.get(l.studentId)!,

      theoryScore: l.theoryScore,

    }));



    const updated = await this.repo.replaceLines(submission.id, merged);

    await this.audit?.log({

      userId: facultyUserId,

      action: 'SAVE_THEORY_GRADE_DRAFT',

      entity: 'grade_submissions',

      entityId: submission.id,

    });

    return updated;

  }



  async submit(facultyUserId: string, facultyCourseId: string) {

    const fc = await this.assertFacultyOwnsCourse(facultyUserId, facultyCourseId);

    this.assertOfferingOpen(fc.course.code);



    const submission = await this.repo.findByFacultyCourseId(facultyCourseId);

    if (!submission) {

      throw new AppError(400, 'Save grades before submitting');

    }

    if (submission.status === 'PUBLISHED') {

      throw new AppError(400, 'Already published');

    }

    if (submission.status === 'SUBMITTED') {

      throw new AppError(400, 'Already submitted');

    }

    if (submission.lines.length === 0) {

      throw new AppError(400, 'Enter grades for at least one student');

    }



    if (submission.phase === 'PRACTICAL') {

      await this.validatePracticalLines(

        fc.courseId,

        fc.course.code,

        submission.lines.map((l) => ({

          studentId: l.studentId,

          practicalScore: Number(l.practicalScore),

        }))

      );

    } else {

      await this.validateTheoryLines(

        fc.courseId,

        fc.course.code,

        submission.id,

        submission.lines

          .filter((l) => l.theoryScore != null)

          .map((l) => ({

            studentId: l.studentId,

            theoryScore: Number(l.theoryScore),

          }))

      );

    }



    const updated = await this.repo.updateStatus(submission.id, {

      status: 'SUBMITTED',

      submittedAt: new Date(),

      rejectionReason: null,

    });



    await this.audit?.log({

      userId: facultyUserId,

      action: submission.phase === 'PRACTICAL' ? 'SUBMIT_PRACTICAL_GRADES' : 'SUBMIT_THEORY_GRADES',

      entity: 'grade_submissions',

      entityId: submission.id,

    });



    await this.notify?.notifyExamOfficerGradeSubmission(

      fc.course.name,

      fc.faculty.name,

      submission.id,

      submission.phase

    );



    return updated;

  }



  async listMySubmissions(facultyUserId: string, role: UserRole) {

    if (role !== 'FACULTY') throw new AppError(403, 'Forbidden');

    return this.repo.listByFaculty(facultyUserId);

  }



  async listQueue(role: UserRole) {

    if (role !== 'EXAM_OFFICER' && role !== 'ADMIN') {

      throw new AppError(403, 'Forbidden');

    }

    return this.repo.listSubmitted();

  }



  async getById(id: string, role: UserRole, userId: string) {

    const submission = await this.repo.findById(id);

    if (!submission) throw new AppError(404, 'Submission not found');



    if (role === 'FACULTY' && submission.facultyId !== userId) {

      throw new AppError(403, 'Forbidden');

    }

    if (role !== 'FACULTY' && role !== 'EXAM_OFFICER' && role !== 'ADMIN') {

      throw new AppError(403, 'Forbidden');

    }

    return submission;

  }



  async updateLinesAsExamOfficer(

    officerUserId: string,

    role: UserRole,

    id: string,

    body: unknown

  ) {

    if (role !== 'EXAM_OFFICER' && role !== 'ADMIN') {

      throw new AppError(403, 'Forbidden');

    }

    const submission = await this.repo.findById(id);

    if (!submission) throw new AppError(404, 'Submission not found');

    if (submission.status !== 'SUBMITTED') {

      throw new AppError(400, 'Only submitted batches can be edited');

    }



    const fc = submission.facultyCourse;



    if (submission.phase === 'PRACTICAL') {

      const { lines } = updatePracticalLinesSchema.parse(body);

      await this.validatePracticalLines(fc.courseId, fc.course.code, lines);

      const updated = await this.repo.replaceLines(

        id,

        lines.map((l) => ({ ...l, theoryScore: null }))

      );

      await this.audit?.log({

        userId: officerUserId,

        action: 'UPDATE_PRACTICAL_GRADE_SUBMISSION',

        entity: 'grade_submissions',

        entityId: id,

      });

      return updated;

    }



    const { lines: theoryLines } = updateTheoryLinesSchema.parse(body);

    await this.validateTheoryLines(fc.courseId, fc.course.code, id, theoryLines);

    const existingPractical = new Map(

      submission.lines.map((l) => [l.studentId, Number(l.practicalScore)])

    );

    const merged = theoryLines.map((l) => ({

      studentId: l.studentId,

      practicalScore: existingPractical.get(l.studentId)!,

      theoryScore: l.theoryScore,

    }));

    const updated = await this.repo.replaceLines(id, merged);

    await this.audit?.log({

      userId: officerUserId,

      action: 'UPDATE_THEORY_GRADE_SUBMISSION',

      entity: 'grade_submissions',

      entityId: id,

    });

    return updated;

  }



  async publish(officerUserId: string, role: UserRole, id: string) {

    if (role !== 'EXAM_OFFICER' && role !== 'ADMIN') {

      throw new AppError(403, 'Forbidden');

    }

    const submission = await this.repo.findById(id);

    if (!submission) throw new AppError(404, 'Submission not found');

    if (submission.status !== 'SUBMITTED') {

      throw new AppError(400, 'Only submitted batches can be published');

    }

    if (submission.lines.length === 0) {

      throw new AppError(400, 'No grade lines to publish');

    }



    const fc = submission.facultyCourse;

    const curriculum = await this.repo.findCurriculumCourseByCode(fc.course.code);

    const courseName = fc.course.name;



    if (submission.phase === 'PRACTICAL') {

      for (const line of submission.lines) {

        const practical = Number(line.practicalScore);



        await this.repo.upsertExamResult({

          studentId: line.studentId,

          facultyCourseId: fc.id,

          score: practical,

          practicalScore: practical,

          theoryScore: null,

          semester: normalizeOfferingTerm(fc.semester, fc.course.code),

          academicYear: fc.academicYear,

        });



        if (curriculum) {

          await this.repo.upsertCurriculumGrade({

            studentId: line.studentId,

            curriculumCourseId: curriculum.id,

            practicalScore: practical,

            theoryScore: null,

          });

        }



        const student = await this.repo.findStudentUserId(line.studentId);

        if (student) {

          await this.notify?.notifyPracticalGradePublished(student.userId, courseName);

        }

      }



      const updated = await this.repo.updateStatus(id, {

        status: 'DRAFT',

        phase: 'THEORY',

        practicalPublishedAt: new Date(),

        submittedAt: null,

        rejectionReason: null,

      });



      await this.audit?.log({

        userId: officerUserId,

        action: 'PUBLISH_PRACTICAL_GRADES',

        entity: 'grade_submissions',

        entityId: id,

        details: { studentCount: submission.lines.length },

      });



      return updated;

    }



    for (const line of submission.lines) {

      const practical = Number(line.practicalScore);

      const theory = Number(line.theoryScore);

      const { total } = computePublishedTotal(practical, theory);



      await this.repo.upsertExamResult({

        studentId: line.studentId,

        facultyCourseId: fc.id,

        score: total,

        practicalScore: practical,

        theoryScore: theory,

        semester: normalizeOfferingTerm(fc.semester, fc.course.code),

        academicYear: fc.academicYear,

      });



      if (curriculum) {

        await this.repo.upsertCurriculumGrade({

          studentId: line.studentId,

          curriculumCourseId: curriculum.id,

          practicalScore: practical,

          theoryScore: theory,

        });

      }



      const student = await this.repo.findStudentUserId(line.studentId);

      if (student) {

        await this.notify?.notifyGradePublished(student.userId, courseName);

      }

    }



    const updated = await this.repo.updateStatus(id, {

      status: 'PUBLISHED',

      publishedAt: new Date(),

      publishedById: officerUserId,

    });



    await this.audit?.log({

      userId: officerUserId,

      action: 'PUBLISH_THEORY_GRADES',

      entity: 'grade_submissions',

      entityId: id,

      details: { studentCount: submission.lines.length },

    });



    return updated;

  }



  async reject(

    officerUserId: string,

    role: UserRole,

    id: string,

    rejectionReason: string

  ) {

    if (role !== 'EXAM_OFFICER' && role !== 'ADMIN') {

      throw new AppError(403, 'Forbidden');

    }

    const submission = await this.repo.findById(id);

    if (!submission) throw new AppError(404, 'Submission not found');

    if (submission.status !== 'SUBMITTED') {

      throw new AppError(400, 'Only submitted batches can be rejected');

    }



    const updated = await this.repo.updateStatus(id, {

      status: 'REJECTED',

      rejectionReason,

      submittedAt: null,

    });



    await this.audit?.log({

      userId: officerUserId,

      action: 'REJECT_GRADE_SUBMISSION',

      entity: 'grade_submissions',

      entityId: id,

    });



    await this.notify?.notifyFacultyGradeSubmissionRejected(

      submission.facultyId,

      submission.facultyCourse.course.name,

      rejectionReason,

      submission.phase

    );



    return updated;

  }

}


