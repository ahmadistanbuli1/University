import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '../utils/AppError.js';

const PUBLIC_SEGMENTS = ['news', 'library'] as const;
const PRIVATE_SEGMENTS = ['transcripts', 'clearances', 'profiles', 'discounts'] as const;

export function ensureUploadDirs(uploadRoot: string) {
  const root = path.resolve(uploadRoot);
  for (const segment of PUBLIC_SEGMENTS) {
    fs.mkdirSync(path.join(root, 'public', segment), { recursive: true });
  }
  for (const segment of PRIVATE_SEGMENTS) {
    fs.mkdirSync(path.join(root, 'private', segment), { recursive: true });
  }
}

/** URL served by express.static on `/uploads` (maps to disk `public/<subfolder>/`). */
export function publicUploadUrl(subfolder: string, filename: string): string {
  return `/uploads/${subfolder}/${filename}`;
}

/** Stored path for private files (never mounted as static). */
export function privateUploadUrl(subfolder: string, filename: string): string {
  return `/uploads/private/${subfolder}/${filename}`;
}

function normalizeStoredRelative(storedPath: string): string {
  let relative = storedPath.replace(/^\/uploads\/?/, '');

  if (relative.startsWith('public/') || relative.startsWith('private/')) {
    return relative;
  }

  if (relative.startsWith('discount-')) {
    return `private/discounts/${relative}`;
  }

  for (const segment of PRIVATE_SEGMENTS) {
    if (relative === segment || relative.startsWith(`${segment}/`)) {
      return `private/${relative}`;
    }
  }

  for (const segment of PUBLIC_SEGMENTS) {
    if (relative === segment || relative.startsWith(`${segment}/`)) {
      return `public/${relative}`;
    }
  }

  if (relative.startsWith('news-')) {
    return `public/news/${relative}`;
  }

  if (/\.pdf$/i.test(relative)) {
    return `public/library/${relative}`;
  }

  return `public/${relative}`;
}

export function resolveStoredUploadAbsolutePath(uploadRoot: string, storedPath: string): string {
  const root = path.resolve(uploadRoot);
  const relative = normalizeStoredRelative(storedPath);
  const absolutePath = path.resolve(root, relative);

  if (absolutePath !== root && !absolutePath.startsWith(root + path.sep)) {
    throw new AppError(400, 'Invalid file path');
  }

  return absolutePath;
}
