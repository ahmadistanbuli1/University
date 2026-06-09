import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const ALLOWED = new Set(['application/pdf']);

export function createClearanceUpload(uploadRoot: string) {
  const dir = path.join(uploadRoot, 'clearances');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
      cb(null, `clearance-${Date.now()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED.has(file.mimetype)) {
        cb(new Error('Only PDF files are allowed'));
        return;
      }
      cb(null, true);
    },
  });
}
