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
    '/students',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.listStudents.bind(controller))
  );
  r.patch(
    '/students/:id',
    requireRoles('AFFAIRS', 'ADMIN'),
    asyncHandler(controller.patchStudent.bind(controller))
  );
  return r;
}
