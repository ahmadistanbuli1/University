import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { StudentServicesController } from './studentServices.controller.js';

export function createStudentServicesRouter(
  controller: StudentServicesController,
  authenticate: RequestHandler
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
  r.get(
    '/students',
    requireRoles('AFFAIRS', 'ADMIN', 'MANAGER', 'EXAM_OFFICER'),
    asyncHandler(controller.listStudents.bind(controller))
  );
  r.patch(
    '/students/:id',
    requireRoles('AFFAIRS', 'ADMIN', 'MANAGER'),
    asyncHandler(controller.patchStudent.bind(controller))
  );
  return r;
}
