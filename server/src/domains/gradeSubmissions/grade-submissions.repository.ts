import type { GradeSubmissionPhase, GradeSubmissionStatus, Prisma, PrismaClient } from '@prisma/client';

import {

  isStudentEligibleForCourseGrade,

  parseOfferingMeta,

} from './grade-roster.js';



const submissionInclude = {

  facultyCourse: {

    include: {

      course: { include: { department: { include: { college: true } } } },

      faculty: { select: { id: true, name: true, email: true } },

    },

  },

  lines: {

    include: {

      student: {

        include: {

          user: { select: { id: true, name: true, email: true } },

        },

      },

    },

    orderBy: { student: { academicNumber: 'asc' } },

  },

} satisfies Prisma.GradeSubmissionInclude;



export class GradeSubmissionsRepository {

  constructor(private readonly db: PrismaClient) {}



  findByFacultyCourseId(facultyCourseId: string) {

    return this.db.gradeSubmission.findUnique({

      where: { facultyCourseId },

      include: submissionInclude,

    });

  }



  findById(id: string) {

    return this.db.gradeSubmission.findUnique({

      where: { id },

      include: submissionInclude,

    });

  }



  createDraft(data: { facultyCourseId: string; facultyId: string }) {

    return this.db.gradeSubmission.create({

      data: {

        facultyCourseId: data.facultyCourseId,

        facultyId: data.facultyId,

        status: 'DRAFT',

        phase: 'PRACTICAL',

      },

      include: submissionInclude,

    });

  }



  listByFaculty(facultyId: string) {

    return this.db.gradeSubmission.findMany({

      where: { facultyId },

      orderBy: { updatedAt: 'desc' },

      include: submissionInclude,

    });

  }



  listSubmitted() {

    return this.db.gradeSubmission.findMany({

      where: { status: 'SUBMITTED' },

      orderBy: { submittedAt: 'asc' },

      include: submissionInclude,

    });

  }



  async replaceLines(

    submissionId: string,

    lines: Array<{ studentId: string; practicalScore: number; theoryScore: number | null }>

  ) {

    return this.db.$transaction(async (tx) => {

      await tx.gradeSubmissionLine.deleteMany({ where: { submissionId } });

      if (lines.length > 0) {

        await tx.gradeSubmissionLine.createMany({

          data: lines.map((l) => ({

            submissionId,

            studentId: l.studentId,

            practicalScore: l.practicalScore,

            theoryScore: l.theoryScore,

          })),

        });

      }

      return tx.gradeSubmission.update({

        where: { id: submissionId },

        data: { updatedAt: new Date() },

        include: submissionInclude,

      });

    });

  }



  updateStatus(

    id: string,

    data: {

      status: GradeSubmissionStatus;

      phase?: GradeSubmissionPhase;

      rejectionReason?: string | null;

      submittedAt?: Date | null;

      publishedAt?: Date | null;

      publishedById?: string | null;

      practicalPublishedAt?: Date | null;

    }

  ) {

    return this.db.gradeSubmission.update({

      where: { id },

      data,

      include: submissionInclude,

    });

  }



  findFacultyCourse(id: string) {

    return this.db.facultyCourse.findUnique({

      where: { id },

      include: { course: true, faculty: true },

    });

  }



  async listEligibleStudentsForCourse(courseId: string, courseCode: string) {

    const offering = parseOfferingMeta(courseCode);

    if (!offering) return [];



    const enrollments = await this.db.enrollment.findMany({

      where: { courseId },

      include: {

        student: {

          include: {

            user: { select: { id: true, name: true, email: true } },

            department: { select: { id: true, name: true } },

          },

        },

      },

      orderBy: { student: { academicNumber: 'asc' } },

    });



    return enrollments.filter((e) =>

      isStudentEligibleForCourseGrade(

        e.student.currentSemester,

        offering.studyYear,

        offering.term

      )

    );

  }



  findCurriculumCourseByCode(code: string) {

    return this.db.curriculumCourse.findUnique({ where: { code } });

  }



  upsertCurriculumGrade(data: {

    studentId: string;

    curriculumCourseId: string;

    practicalScore: number;

    theoryScore: number | null;

  }) {

    return this.db.studentCurriculumGrade.upsert({

      where: {

        studentId_curriculumCourseId: {

          studentId: data.studentId,

          curriculumCourseId: data.curriculumCourseId,

        },

      },

      create: {

        studentId: data.studentId,

        curriculumCourseId: data.curriculumCourseId,

        practicalScore: data.practicalScore,

        theoryScore: data.theoryScore,

      },

      update: {

        practicalScore: data.practicalScore,

        ...(data.theoryScore != null ? { theoryScore: data.theoryScore } : {}),

      },

    });

  }



  upsertExamResult(data: {

    studentId: string;

    facultyCourseId: string;

    score: number;

    practicalScore: number;

    theoryScore: number | null;

    semester: string;

    academicYear: string;

  }) {

    return this.db.examResult.upsert({

      where: {

        studentId_facultyCourseId_attemptNumber: {

          studentId: data.studentId,

          facultyCourseId: data.facultyCourseId,

          attemptNumber: 1,

        },

      },

      create: {

        studentId: data.studentId,

        facultyCourseId: data.facultyCourseId,

        score: data.score,

        practicalScore: data.practicalScore,

        theoryScore: data.theoryScore,

        attemptNumber: 1,

        semester: data.semester,

        academicYear: data.academicYear,

      },

      update: {

        score: data.score,

        practicalScore: data.practicalScore,

        theoryScore: data.theoryScore,

        semester: data.semester,

        academicYear: data.academicYear,

      },

    });

  }



  findStudentUserId(studentId: string) {

    return this.db.student.findUnique({

      where: { id: studentId },

      select: { userId: true },

    });

  }

}


