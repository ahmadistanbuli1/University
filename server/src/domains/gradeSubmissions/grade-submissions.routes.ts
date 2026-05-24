import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { GradeSubmissionsController } from './grade-submissions.controller.js';

export function createGradeSubmissionsRouter(
  controller: GradeSubmissionsController,
  authenticate: RequestHandler
) {
  const r = Router();
  r.use(authenticate);

  r.get(
    '/faculty/mine',
    requireRoles('FACULTY'),
    asyncHandler(controller.listMine.bind(controller))
  );
  r.get(
    '/faculty/workspace/:facultyCourseId',
    requireRoles('FACULTY'),
    asyncHandler(controller.facultyWorkspace.bind(controller))
  );
  r.put(
    '/faculty/workspace/:facultyCourseId/draft',
    requireRoles('FACULTY'),
    asyncHandler(controller.saveDraft.bind(controller))
  );
  r.post(
    '/faculty/workspace/:facultyCourseId/submit',
    requireRoles('FACULTY'),
    asyncHandler(controller.submit.bind(controller))
  );

  r.get(
    '/exam-officer/queue',
    requireRoles('EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.listQueue.bind(controller))
  );
  r.get(
    '/:id',
    requireRoles('FACULTY', 'EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.getById.bind(controller))
  );
  r.patch(
    '/:id/lines',
    requireRoles('EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.updateLines.bind(controller))
  );
  r.post(
    '/:id/publish',
    requireRoles('EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.publish.bind(controller))
  );
  r.post(
    '/:id/reject',
    requireRoles('EXAM_OFFICER', 'ADMIN'),
    asyncHandler(controller.reject.bind(controller))
  );

  return r;
}
