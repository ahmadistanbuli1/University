import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type PDFDocument from 'pdfkit';

export const UNIVERSITY_NAME = 'AlShamal Private University';

type PdfDoc = InstanceType<typeof PDFDocument>;

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export function resolveUniversityLogoPath(): string | null {
  const candidates = [
    path.resolve(moduleDir, '../../assets/spu.png'),
    path.resolve(process.cwd(), 'assets/spu.png'),
    path.resolve(process.cwd(), '../client/src/images/spu.png'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/** Letterhead with logo (top-left) and university title. Returns Y below the header block. */
export function drawUniversityPdfHeader(
  doc: PdfDoc,
  options: { subtitle: string; margin?: number }
): number {
  const margin = options.margin ?? 50;
  const logoPath = resolveUniversityLogoPath();
  const logoSize = 58;
  const headerTop = margin;

  if (logoPath) {
    doc.image(logoPath, margin, headerTop, {
      width: logoSize,
      height: logoSize,
      fit: [logoSize, logoSize],
    });
  }

  const textX = logoPath ? margin + logoSize + 16 : margin;
  const textWidth = doc.page.width - textX - margin;

  doc
    .fontSize(17)
    .font('Helvetica-Bold')
    .fillColor('#025692')
    .text(UNIVERSITY_NAME, textX, headerTop + 6, { width: textWidth, align: 'left' });

  doc
    .fontSize(12)
    .fillColor('#334155')
    .font('Helvetica-Bold')
    .text(options.subtitle, textX, headerTop + 30, { width: textWidth, align: 'left' });

  const headerBottom = headerTop + logoSize + 18;
  doc
    .moveTo(margin, headerBottom)
    .lineTo(doc.page.width - margin, headerBottom)
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .stroke();

  return headerBottom + 16;
}
