import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { studyYearFromSemester } from '../domains/academic/study-plan.js';
import { drawUniversityPdfHeader, UNIVERSITY_NAME } from './pdf-branding.js';

export type ClearancePdfData = {
  studentName: string;
  academicNumber: string;
  collegeName: string;
  departmentName: string;
  academicYear: string;
  currentSemester: number;
  issuedAt: Date;
};

export async function generateClearancePdf(
  data: ClearancePdfData,
  outputAbsolutePath: string
): Promise<void> {
  await fs.promises.mkdir(path.dirname(outputAbsolutePath), { recursive: true });

  const studyYear = studyYearFromSemester(data.currentSemester);
  const dateStr = data.issuedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const stream = fs.createWriteStream(outputAbsolutePath);
    doc.pipe(stream);

    const contentTop = drawUniversityPdfHeader(doc, {
      subtitle: 'Clearance Certificate',
      margin: 56,
    });

    doc.y = contentTop;

    doc.fontSize(11).font('Helvetica').fillColor('#1e293b');
    doc.text(
      'This is to certify that the following student has been reviewed by the Student Affairs Office and has no outstanding financial or administrative obligations with the university that would prevent official transactions.',
      { align: 'left', lineGap: 4 }
    );
    doc.moveDown(1);

    const rows: Array<[string, string]> = [
      ['Full name', data.studentName],
      ['Academic number', data.academicNumber],
      ['College', data.collegeName],
      ['Department', data.departmentName],
      ['Academic year', data.academicYear],
      ['Study year', `Year ${studyYear}`],
    ];

    for (const [label, value] of rows) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
      doc.moveDown(0.25);
    }

    doc.moveDown(1);
    doc.fontSize(10).fillColor('#64748b').text(`Issued on ${dateStr}`, { align: 'left' });
    doc.moveDown(2);
    doc.text(`Student Affairs Office — ${UNIVERSITY_NAME}`, { align: 'center' });

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.end();
  });
}
