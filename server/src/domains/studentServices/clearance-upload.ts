import { validateUploadMagic } from '../../lib/file-magic.js';
import { createDiskUpload } from '../../lib/multer-upload.js';

export function createClearanceUpload(uploadRoot: string) {
  return createDiskUpload(uploadRoot, {
    category: 'clearances',
    maxBytes: 8 * 1024 * 1024,
    allowedMagic: ['pdf'],
    allowedMime: /^application\/pdf$/,
  });
}

export const validateClearanceUploadMagic = validateUploadMagic(['pdf']);
