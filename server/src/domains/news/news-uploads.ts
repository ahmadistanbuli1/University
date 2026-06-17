import type { Request } from 'express';
import { storedUploadUrl } from '../../lib/multer-upload.js';

export type ParsedNewsUploads = {
  coverUrl?: string;
  gallery: Array<{ imageUrl: string; sortOrder: number }>;
};

export function parseNewsMultipartUploads(req: Request): ParsedNewsUploads {
  const grouped = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = grouped?.cover?.[0] ?? grouped?.image?.[0] ?? req.file ?? undefined;
  const galleryFiles = grouped?.gallery ?? [];

  return {
    coverUrl: coverFile ? storedUploadUrl('news', coverFile.filename) : undefined,
    gallery: galleryFiles.map((file, index) => ({
      imageUrl: storedUploadUrl('news', file.filename),
      sortOrder: index,
    })),
  };
}
