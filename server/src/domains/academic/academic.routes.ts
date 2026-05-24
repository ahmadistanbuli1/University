import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { AcademicController } from './academic.controller.js';

export function createAcademicRouter(controller: AcademicController, authenticate: RequestHandler) {
  const r = Router();
  r.use(authenticate);
  r.get(
    '/enrollments/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myEnrollments.bind(controller))
  );
  r.get(
    '/results/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myResults.bind(controller))
  );
  r.get(
    '/study-plan/me',
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.myStudyPlan.bind(controller))
  );
  r.get(
    '/faculty-courses/:id/roster',
    requireRoles('FACULTY'),
    asyncHandler(controller.sectionRoster.bind(controller))
  );
  r.post('/results', requireRoles('ADMIN'), asyncHandler(controller.createResult.bind(controller)));
  r.get(
    '/results/analytics',
    requireRoles('FACULTY', 'ADMIN'),
    asyncHandler(controller.analytics.bind(controller))
  );
  return r;
}
