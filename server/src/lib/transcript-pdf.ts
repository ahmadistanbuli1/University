import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

type PdfDoc = InstanceType<typeof PDFDocument>;

export type TranscriptPdfRow = {
  studyYear: number;
  termLabel: string;
  courseName: string;
  practical: number;
  theory: number;
  total: number;
  status: 'Pass' | 'Fail';
};

export type TranscriptPdfData = {
  universityName: string;
  studentName: string;
  academicNumber: string;
  collegeName: string;
  departmentName: string;
  academicYear: string;
  studyYearLabel: string;
  rows: TranscriptPdfRow[];
  gpa: number;
  issuedAt: Date;
};

function drawTableHeader(doc: PdfDoc, y: number) {
  const cols = [50, 200, 70, 70, 55, 55];
  const headers = ['Year', 'Course', 'Practical', 'Theory', 'Total', 'Status'];
  doc.fontSize(9).font('Helvetica-Bold');
  let x = 50;
  headers.forEach((h, i) => {
    doc.text(h, x, y, { width: cols[i]! - 4 });
    x += cols[i]!;
  });
  doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor('#cccccc').stroke();
}

export async function generateTranscriptPdf(
  data: TranscriptPdfData,
  outputAbsolutePath: string
): Promise<void> {
  await fs.promises.mkdir(path.dirname(outputAbsolutePath), { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputAbsolutePath);
    doc.pipe(stream);

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(data.universityName, { align: 'center' });
    doc
      .fontSize(12)
      .fillColor('#334155')
      .font('Helvetica')
      .text('Official Academic Grade Transcript', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor('#64748b')
      .text(`Issued: ${data.issuedAt.toISOString().slice(0, 10)}`, { align: 'center' });
    doc.moveDown(1.2);

    doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text('Student Information');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10);
    const info = [
      ['Name', data.studentName],
      ['University ID', data.academicNumber],
      ['College', data.collegeName],
      ['Department', data.departmentName],
      ['Academic Year', data.academicYear],
      ['Study Level', data.studyYearLabel],
      ['Cumulative GPA', String(data.gpa)],
    ];
    info.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
    });
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(10).text('Course Grades');
    doc.moveDown(0.4);
    let y = doc.y;
    drawTableHeader(doc, y);
    y += 20;

    doc.font('Helvetica').fontSize(8).fillColor('#0f172a');
    for (const row of data.rows) {
      if (y > 720) {
        doc.addPage();
        y = 50;
        drawTableHeader(doc, y);
        y += 20;
      }
      const cols = [50, 200, 70, 70, 55, 55];
      const values = [
        `Y${row.studyYear} ${row.termLabel}`,
        row.courseName,
        `${row.practical}/40`,
        `${row.theory}/60`,
        String(row.total),
        row.status,
      ];
      let x = 50;
      values.forEach((v, i) => {
        doc.text(v, x, y, { width: cols[i]! - 4, lineBreak: false });
        x += cols[i]!;
      });
      y += 16;
    }

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor('#64748b')
      .text(
        'Passing criteria: Practical component (40) + Theoretical component (60) = Total (100). Minimum pass total: 50.',
        { align: 'left' }
      );
    doc.moveDown(0.5);
    doc.text('This document was generated electronically by the university portal.', {
      align: 'center',
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
    doc.on('error', reject);
  });
}
