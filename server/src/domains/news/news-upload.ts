import fs from 'node:fs';
import multer from 'multer';
import type { Env } from '../../config.js';

export function createNewsImageUpload(env: Env) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
      cb(null, `news-${Date.now()}-${safe}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        cb(new Error('Only image uploads are allowed'));
        return;
      }
      cb(null, true);
    },
  });
}
