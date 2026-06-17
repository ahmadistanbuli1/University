import { Router } from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateUploadMagic } from '../../lib/file-magic.js';
import { createDiskUpload } from '../../lib/multer-upload.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { LibraryController } from './library.controller.js';
import type { Env } from '../../config.js';

export function createLibraryRouter(
  controller: LibraryController,
  authenticate: RequestHandler,
  env: Env
) {
  const r = Router();
  const upload = createDiskUpload(env.UPLOAD_DIR, {
    category: 'library',
    maxBytes: 20 * 1024 * 1024,
    allowedMagic: ['pdf'],
    allowedMime: /^application\/pdf$/,
  });
  const validatePdfMagic = validateUploadMagic(['pdf']);

  const counterLimiter = rateLimit({ windowMs: 60_000, max: 120 });

  r.get('/books', asyncHandler(controller.listBooks.bind(controller)));
  r.get(
    '/favorites/ids',
    authenticate,
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.listFavoriteIds.bind(controller))
  );
  r.get(
    '/favorites',
    authenticate,
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.listFavorites.bind(controller))
  );
  r.post(
    '/favorites/:id/toggle',
    authenticate,
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.toggleFavorite.bind(controller))
  );
  r.delete(
    '/favorites/:id',
    authenticate,
    requireRoles('STUDENT', 'FACULTY'),
    asyncHandler(controller.removeFavorite.bind(controller))
  );
  r.get(
    '/stats',
    authenticate,
    requireRoles('LIBRARIAN'),
    asyncHandler(controller.stats.bind(controller))
  );
  r.patch(
    '/books/:id/read',
    authenticate,
    counterLimiter,
    asyncHandler(controller.patchRead.bind(controller))
  );
  r.patch(
    '/books/:id/download',
    authenticate,
    counterLimiter,
    asyncHandler(controller.patchDownload.bind(controller))
  );
  r.post(
    '/books',
    authenticate,
    requireRoles('LIBRARIAN'),
    upload.single('file'),
    validatePdfMagic,
    asyncHandler(controller.createBook.bind(controller))
  );
  r.patch(
    '/books/:id',
    authenticate,
    requireRoles('LIBRARIAN'),
    asyncHandler(controller.updateBook.bind(controller))
  );
  r.delete(
    '/books/:id',
    authenticate,
    requireRoles('LIBRARIAN'),
    asyncHandler(controller.deleteBook.bind(controller))
  );
  return r;
}
