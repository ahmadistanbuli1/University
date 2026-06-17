import type { Env } from '../../config.js';
import { validateUploadMagic } from '../../lib/file-magic.js';
import { createDiskUpload } from '../../lib/multer-upload.js';

const IMAGE_MAGIC = ['jpeg', 'png', 'webp', 'gif'] as const;

export function createNewsImageUpload(env: Env) {
  return createDiskUpload(env.UPLOAD_DIR, {
    category: 'news',
    maxBytes: 5 * 1024 * 1024,
    allowedMagic: [...IMAGE_MAGIC],
    allowedMime: /^image\/(jpeg|png|webp|gif)$/,
  });
}

export const validateNewsImageMagic = validateUploadMagic([...IMAGE_MAGIC]);
