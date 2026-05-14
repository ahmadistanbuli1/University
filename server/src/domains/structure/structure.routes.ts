import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { StructureController } from './structure.controller.js';

export function createStructureRouter(controller: StructureController) {
  const r = Router();
  r.get('/colleges', asyncHandler(controller.colleges.bind(controller)));
  r.get('/departments', asyncHandler(controller.departments.bind(controller)));
  r.get('/courses', asyncHandler(controller.courses.bind(controller)));
  return r;
}
