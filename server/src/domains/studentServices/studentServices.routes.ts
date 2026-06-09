import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { StudentServicesController } from './studentServices.controller.js';

export function createStudentServicesRouter(
  controller: StudentServicesController,
  authenticate: RequestHandler,
  _uploadRoot: string
) {
  const r = Router();

  r.use(authenticate);
  r.post(
    '/appeals',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.createAppeal.bind(controller))
  );
  r.get(
    '/appeals/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myAppeals.bind(controller))
  );
  r.get('/appeals', requireRoles('ADMIN'), asyncHandler(controller.listAppeals.bind(controller)));
  r.patch(
    '/appeals/:id/status',
    requireRoles('ADMIN'),
    asyncHandler(controller.patchAppeal.bind(controller))
  );
  r.post(
    '/transcripts',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.requestTranscript.bind(controller))
  );
  r.get(
    '/transcripts/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myTranscripts.bind(controller))
  );
  r.get(
    '/transcripts',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.listTranscripts.bind(controller))
  );
  r.patch(
    '/transcripts/:id',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.patchTranscript.bind(controller))
  );
  r.get(
    '/transcripts/exam-queue',
    requireRoles('EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.listExamOfficerTranscripts.bind(controller))
  );
  r.post(
    '/transcripts/:id/fulfill',
    requireRoles('EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.fulfillTranscript.bind(controller))
  );
  r.get(
    '/transcripts/:id/file',
    requireRoles('STUDENT', 'FACULTY', 'AFFAIRS', 'ADMIN', 'EXAM_OFFICER'),
    asyncHandler(controller.downloadTranscript.bind(controller))
  );
  r.post(
    '/clearances',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.requestClearance.bind(controller))
  );
  r.get(
    '/clearances/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myClearances.bind(controller))
  );
  r.get(
    '/clearances',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.listClearances.bind(controller))
  );
  r.patch(
    '/clearances/:id',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.patchClearance.bind(controller))
  );
  r.post(
    '/clearances/:id/deliver',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.deliverClearance.bind(controller))
  );
  r.get(
    '/clearances/:id/file',
    requireRoles('STUDENT', 'FACULTY', 'AFFAIRS', 'ADMIN'),
    asyncHandler(controller.downloadClearance.bind(controller))
  );
  r.get(
    '/service-fees',
    requireRoles('STUDENT', 'FACULTY', 'ADMIN', 'AFFAIRS'),
    asyncHandler(controller.serviceFees.bind(controller))
  );
  r.get(
    '/affairs/dashboard',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.affairsDashboard.bind(controller))
  );
  r.get(
    '/students',
    requireRoles('AFFAIRS', 'ADMIN', 'MANAGER', 'EXAM_OFFICER'),
    asyncHandler(controller.listStudents.bind(controller))
  );
  r.post(
    '/students',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.createStudent.bind(controller))
  );
  r.patch(
    '/students/:id',
    requireRoles('AFFAIRS', 'ADMIN', 'MANAGER'),
    asyncHandler(controller.patchStudent.bind(controller))
  );
  r.delete(
    '/students/:id',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.deleteStudent.bind(controller))
  );
  r.get(
    '/students/:id/profile-pdf',
    requireRoles('AFFAIRS', 'ADMIN', 'MANAGER'),
    asyncHandler(controller.downloadStudentProfile.bind(controller))
  );
  return r;
}
