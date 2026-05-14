import { Router } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import type { LibraryController } from './library.controller.js';
import type { Env } from '../../config.js';

export function createLibraryRouter(
  controller: LibraryController,
  authenticate: RequestHandler,
  env: Env
) {
  const r = Router();
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      cb(null, safe);
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        cb(new Error('Only PDF uploads are allowed'));
        return;
      }
      cb(null, true);
    },
  });

  const counterLimiter = rateLimit({ windowMs: 60_000, max: 120 });

  r.get('/books', asyncHandler(controller.listBooks.bind(controller)));
  r.patch('/books/:id/read', counterLimiter, asyncHandler(controller.patchRead.bind(controller)));
  r.patch(
    '/books/:id/download',
    counterLimiter,
    asyncHandler(controller.patchDownload.bind(controller))
  );
  r.post(
    '/books',
    authenticate,
    requireRoles('LIBRARIAN'),
    upload.single('file'),
    asyncHandler(controller.createBook.bind(controller))
  );
  return r;
}
