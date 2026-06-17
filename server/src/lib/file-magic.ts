import fs from 'node:fs/promises';
import type { RequestHandler } from 'express';

export type MagicKind = 'pdf' | 'jpeg' | 'png' | 'webp' | 'gif';

export function detectFileKind(buf: Buffer): MagicKind | null {
  if (buf.length >= 5 && buf.subarray(0, 5).toString() === '%PDF-') {
    return 'pdf';
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpeg';
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'png';
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString() === 'RIFF' &&
    buf.subarray(8, 12).toString() === 'WEBP'
  ) {
    return 'webp';
  }
  if (buf.length >= 6 && (buf.subarray(0, 6).toString() === 'GIF87a' || buf.subarray(0, 6).toString() === 'GIF89a')) {
    return 'gif';
  }
  return null;
}

export async function validateUploadedFileMagic(
  filePath: string,
  allowed: MagicKind[]
): Promise<void> {
  const handle = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buf, 0, 16, 0);
    const kind = detectFileKind(buf.subarray(0, bytesRead));
    if (!kind || !allowed.includes(kind)) {
      throw new Error('File content does not match allowed types');
    }
  } finally {
    await handle.close();
  }
}

export function validateUploadFieldsMagic(allowed: MagicKind[]): RequestHandler {
  return async (req, _res, next) => {
    const grouped = req.files as Record<string, Express.Multer.File[]> | undefined;
    const files = grouped ? Object.values(grouped).flat() : req.file ? [req.file] : [];
    if (!files.length) {
      next();
      return;
    }
    try {
      for (const file of files) {
        await validateUploadedFileMagic(file.path, allowed);
      }
      next();
    } catch (err) {
      await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
      next(err);
    }
  };
}

export const validateUploadMagic = validateUploadFieldsMagic;
