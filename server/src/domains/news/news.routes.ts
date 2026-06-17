import { Router } from 'express';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateUploadFieldsMagic } from '../../lib/file-magic.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { NewsController } from './news.controller.js';
import type { Env } from '../../config.js';
import { createNewsImageUpload } from './news-upload.js';

const IMAGE_MAGIC = ['jpeg', 'png', 'webp', 'gif'] as const;

export function createNewsRouter(
  controller: NewsController,
  authenticate: RequestHandler,
  env: Env
) {
  const r = Router();
  const upload = createNewsImageUpload(env);
  const validateImages = validateUploadFieldsMagic([...IMAGE_MAGIC]);
  const newsUpload = upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 20 },
  ]);

  r.get('/', asyncHandler(controller.list.bind(controller)));
  r.get('/:id', asyncHandler(controller.getById.bind(controller)));
  r.post(
    '/',
    authenticate,
    requireRoles('ADMIN', 'MANAGER'),
    newsUpload,
    validateImages,
    asyncHandler(controller.create.bind(controller))
  );
  r.patch(
    '/:id',
    authenticate,
    requireRoles('ADMIN', 'MANAGER'),
    newsUpload,
    validateImages,
    asyncHandler(controller.update.bind(controller))
  );
  r.delete(
    '/:id',
    authenticate,
    requireRoles('ADMIN', 'MANAGER'),
    asyncHandler(controller.remove.bind(controller))
  );
  return r;
}
