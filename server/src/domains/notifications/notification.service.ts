import type { NotificationKind, UserRole } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import type { CreateNotificationInput, NotificationRepository } from './notification.repository.js';

export class NotificationDispatchService {
  constructor(private readonly repo: NotificationRepository) {}

  private async push(items: CreateNotificationInput[]) {
    await this.repo.createMany(items);
  }

  private itemsForUserIds(
    userIds: string[],
    payload: Omit<CreateNotificationInput, 'userId'>
  ): CreateNotificationInput[] {
    const unique = [...new Set(userIds)];
    return unique.map((userId) => ({ userId, ...payload }));
  }

  async notifyUser(
    userId: string,
    payload: Omit<CreateNotificationInput, 'userId'>
  ) {
    await this.push([{ userId, ...payload }]);
  }

  async notifyRoles(
    roles: UserRole[],
    payload: Omit<CreateNotificationInput, 'userId'>,
    excludeUserId?: string
  ) {
    const users = await this.repo.findUserIdsByRoles(roles, excludeUserId);
    await this.push(this.itemsForUserIds(users.map((u) => u.id), payload));
  }

  async notifyNewsPublished(input: {
    authorId: string;
    title: string;
    collegeId: string | null;
    category: 'ANNOUNCEMENT' | 'WORKSHOP' | 'TRAINING' | 'TUITION';
  }) {
    const linkPath = input.category === 'TUITION' ? '/student/tuition' : '/news';
    const payload = {
      kind: 'NEWS' as NotificationKind,
      title: 'New announcement',
      body: input.title,
      linkPath,
      meta: { newsTitle: input.title },
    };

    if (input.collegeId) {
      const studentIds = await this.repo.findStudentUserIdsByCollege(
        input.collegeId,
        input.authorId
      );
      const managerIds = (
        await this.repo.findManagerUserIdsByCollege(input.collegeId, input.authorId)
      ).map((u) => u.id);
      await this.push(
        this.itemsForUserIds([...studentIds, ...managerIds], payload)
      );
    } else {
      const users = await this.repo.findAllActiveUserIds(input.authorId);
      await this.push(this.itemsForUserIds(users.map((u) => u.id), payload));
    }
  }

  async notifyTranscriptRequested(studentName: string) {
    const payload = {
      kind: 'TRANSCRIPT_REQUEST' as NotificationKind,
      title: 'Transcript request',
      body: `${studentName} requested an official transcript`,
      meta: { studentName },
    };
    const affairs = await this.repo.findUserIdsByRoles(['AFFAIRS']);
    const admins = await this.repo.findUserIdsByRoles(['ADMIN']);
    await this.push([
      ...this.itemsForUserIds(
        affairs.map((u) => u.id),
        { ...payload, linkPath: '/affairs/transcripts' }
      ),
      ...this.itemsForUserIds(
        admins.map((u) => u.id),
        { ...payload, linkPath: '/admin/transcripts' }
      ),
    ]);
  }

  async notifyTranscriptReady(userId: string) {
    await this.notifyUser(userId, {
      kind: 'TRANSCRIPT_READY',
      title: 'Transcript ready',
      body: 'Your grade transcript was approved. You can download the PDF.',
      linkPath: '/student/transcripts',
    });
  }

  async notifyTranscriptRejected(userId: string, reason: string, feeAmount: number) {
    await this.notifyUser(userId, {
      kind: 'TRANSCRIPT_REJECTED',
      title: 'Transcript request rejected',
      body: `${reason} Your payment of $${feeAmount.toFixed(2)} has been refunded (demo).`,
      linkPath: '/student/transcripts',
      meta: { reason, feeRefunded: true, feeAmount },
    });
  }

  async notifyClearanceRequested(studentName: string) {
    const payload = {
      kind: 'CLEARANCE_REQUEST' as NotificationKind,
      title: 'Clearance certificate request',
      body: `${studentName} requested a clearance certificate (براءة ذمة)`,
      meta: { studentName },
    };
    const affairs = await this.repo.findUserIdsByRoles(['AFFAIRS']);
    const admins = await this.repo.findUserIdsByRoles(['ADMIN']);
    await this.push([
      ...this.itemsForUserIds(
        affairs.map((u) => u.id),
        { ...payload, linkPath: '/affairs/clearances' }
      ),
      ...this.itemsForUserIds(
        admins.map((u) => u.id),
        { ...payload, linkPath: '/affairs/clearances' }
      ),
    ]);
  }

  async notifyClearanceReady(userId: string) {
    await this.notifyUser(userId, {
      kind: 'CLEARANCE_READY',
      title: 'Clearance certificate ready',
      body: 'Your clearance certificate (براءة ذمة) is ready. You can download the PDF.',
      linkPath: '/student/clearances',
    });
  }

  async notifyClearanceRejected(userId: string, reason: string, feeAmount: number) {
    await this.notifyUser(userId, {
      kind: 'CLEARANCE_REJECTED',
      title: 'Clearance request rejected',
      body: `${reason} Your payment of $${feeAmount.toFixed(2)} has been refunded (demo).`,
      linkPath: '/student/clearances',
      meta: { reason, feeRefunded: true, feeAmount },
    });
  }

  async notifyTranscriptAffairsApproved(userId: string) {
    await this.notifyUser(userId, {
      kind: 'TRANSCRIPT_REQUEST',
      title: 'Transcript approved by student affairs',
      body: 'Your request was forwarded to the exam office to generate your PDF.',
      linkPath: '/student/transcripts',
    });
  }

  async notifyExamOfficerTranscriptQueued(studentName: string, studentEmail: string) {
    const payload = {
      kind: 'TRANSCRIPT_REQUEST' as NotificationKind,
      title: 'Generate transcript PDF',
      body: `${studentName} (${studentEmail}) — affairs approved, ready for PDF.`,
      meta: { studentName, studentEmail },
    };
    const officers = await this.repo.findUserIdsByRoles(['EXAM_OFFICER']);
    const admins = await this.repo.findUserIdsByRoles(['ADMIN']);
    await this.push([
      ...this.itemsForUserIds(
        officers.map((u) => u.id),
        { ...payload, linkPath: '/exam-officer/transcripts' }
      ),
      ...this.itemsForUserIds(
        admins.map((u) => u.id),
        { ...payload, linkPath: '/exam-officer/transcripts' }
      ),
    ]);
  }

  async notifyAppealSubmitted(studentName: string) {
    await this.notifyRoles(['ADMIN'], {
      kind: 'APPEAL_SUBMITTED',
      title: 'Grade appeal',
      body: `${studentName} submitted a grade appeal`,
      linkPath: '/admin/appeals',
      meta: { studentName },
    });
  }

  async notifyAppealResolved(userId: string, status: 'APPROVED' | 'REJECTED') {
    await this.notifyUser(userId, {
      kind: 'APPEAL_RESOLVED',
      title: status === 'APPROVED' ? 'Appeal approved' : 'Appeal rejected',
      body:
        status === 'APPROVED'
          ? 'Your grade appeal was approved.'
          : 'Your grade appeal was rejected. See appeals for details.',
      linkPath: '/student/appeals',
      meta: { status },
    });
  }

  async notifyDiscountRequested(studentName: string) {
    await this.notifyRoles(['ADMIN'], {
      kind: 'DISCOUNT_REQUEST',
      title: 'Discount request',
      body: `${studentName} submitted a tuition discount request`,
      linkPath: '/admin/discounts',
      meta: { studentName },
    });
  }

  async notifyDiscountResolved(userId: string, status: 'APPROVED' | 'REJECTED') {
    await this.notifyUser(userId, {
      kind: 'DISCOUNT_RESOLVED',
      title: status === 'APPROVED' ? 'Discount approved' : 'Discount rejected',
      body:
        status === 'APPROVED'
          ? 'Your discount request was approved.'
          : 'Your discount request was rejected.',
      linkPath: '/student/discounts',
      meta: { status },
    });
  }

  async notifyGradePublished(userId: string, courseName: string) {
    await this.notifyUser(userId, {
      kind: 'GRADE_PUBLISHED',
      title: 'New grade',
      body: `Your grade for ${courseName} is now available. View your result.`,
      linkPath: '/student/grades',
      meta: { courseName },
    });
  }

  async notifyPracticalGradePublished(userId: string, courseName: string) {
    await this.notifyUser(userId, {
      kind: 'PRACTICAL_GRADE_PUBLISHED',
      title: 'Practical grade available',
      body: `Your practical grade for ${courseName} is now available.`,
      linkPath: '/student/grades',
      meta: { courseName },
    });
  }

  async notifyExamOfficerGradeSubmission(
    courseName: string,
    facultyName: string,
    submissionId: string,
    phase: 'PRACTICAL' | 'THEORY' = 'PRACTICAL'
  ) {
    const phaseLabel = phase === 'PRACTICAL' ? 'practical' : 'theory';
    const payload = {
      kind: 'GRADE_SUBMISSION' as NotificationKind,
      title: 'Grades awaiting publication',
      body: `${facultyName} submitted ${phaseLabel} grades for ${courseName}`,
      meta: { courseName, facultyName, submissionId, phase },
    };
    const officers = await this.repo.findUserIdsByRoles(['EXAM_OFFICER']);
    const admins = await this.repo.findUserIdsByRoles(['ADMIN']);
    await this.push([
      ...this.itemsForUserIds(
        officers.map((u) => u.id),
        { ...payload, linkPath: '/exam-officer/grades' }
      ),
      ...this.itemsForUserIds(
        admins.map((u) => u.id),
        { ...payload, linkPath: '/exam-officer/grades' }
      ),
    ]);
  }

  async notifyFacultyGradeSubmissionRejected(
    facultyUserId: string,
    courseName: string,
    reason: string,
    phase: 'PRACTICAL' | 'THEORY' = 'PRACTICAL'
  ) {
    const phaseLabel = phase === 'PRACTICAL' ? 'practical' : 'theory';
    await this.notifyUser(facultyUserId, {
      kind: 'GRADE_SUBMISSION_REJECTED',
      title: 'Grade submission rejected',
      body: `${courseName} (${phaseLabel}): ${reason}. You can edit and resubmit.`,
      linkPath: '/faculty/grades',
      meta: { courseName, reason, phase },
    });
  }
}

export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  listMine(userId: string) {
    return this.repo.listForUser(userId);
  }

  unreadCount(userId: string) {
    return this.repo.countUnread(userId);
  }

  async markRead(userId: string, notificationId: string) {
    const result = await this.repo.markRead(notificationId, userId);
    if (result.count === 0) {
      throw new AppError(404, 'Notification not found');
    }
    return { ok: true };
  }

  markAllRead(userId: string) {
    return this.repo.markAllRead(userId);
  }
}
