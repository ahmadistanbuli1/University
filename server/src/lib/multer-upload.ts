import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import type { MagicKind } from './file-magic.js';
import { ensureUploadDirs, privateUploadUrl, publicUploadUrl } from './upload-paths.js';

export type UploadCategory = 'news' | 'library' | 'transcripts' | 'clearances' | 'discounts';

const PUBLIC_CATEGORIES = new Set<UploadCategory>(['news', 'library']);

function uploadDirectory(uploadRoot: string, category: UploadCategory): string {
  const visibility = PUBLIC_CATEGORIES.has(category) ? 'public' : 'private';
  return path.join(uploadRoot, visibility, category);
}

export function storedUploadUrl(category: UploadCategory, filename: string): string {
  return PUBLIC_CATEGORIES.has(category)
    ? publicUploadUrl(category, filename)
    : privateUploadUrl(category, filename);
}

function sanitizeExt(originalName: string, mimetype: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if (/^\.(jpe?g|png|webp|gif|pdf)$/.test(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }
  if (mimetype === 'application/pdf') return '.pdf';
  if (mimetype === 'image/jpeg') return '.jpg';
  if (mimetype === 'image/png') return '.png';
  if (mimetype === 'image/webp') return '.webp';
  if (mimetype === 'image/gif') return '.gif';
  return '';
}

export interface CreateUploadOptions {
  category: UploadCategory;
  maxBytes: number;
  allowedMagic: MagicKind[];
  allowedMime: RegExp;
}

export function createDiskUpload(uploadRoot: string, options: CreateUploadOptions) {
  ensureUploadDirs(uploadRoot);
  const dir = uploadDirectory(uploadRoot, options.category);
  fs.mkdirSync(dir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, file, cb) => {
        const ext = sanitizeExt(file.originalname, file.mimetype);
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: options.maxBytes },
    fileFilter: (_req, file, cb) => {
      if (!options.allowedMime.test(file.mimetype)) {
        cb(new Error('File type not allowed'));
        return;
      }
      cb(null, true);
    },
  });
}
