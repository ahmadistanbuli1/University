import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

export type StudentProfilePdfData = {
  universityName: string;
  studentName: string;
  email: string;
  academicNumber: string;
  collegeName: string;
  departmentName: string;
  academicYear: string;
  studyYearLabel: string;
  currentSemester: number;
  enrolledCourses: string[];
  accountActive: boolean;
  issuedAt: Date;
};

export async function generateStudentProfilePdf(
  data: StudentProfilePdfData,
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
      .fillColor('#025692')
      .text(data.universityName, { align: 'center' });
    doc
      .fontSize(13)
      .fillColor('#334155')
      .text('Student Personal Information Record', { align: 'center' });
    doc.moveDown(1.5);

    const rows: Array<[string, string]> = [
      ['Full name', data.studentName],
      ['Email', data.email],
      ['Academic number', data.academicNumber],
      ['College', data.collegeName],
      ['Department', data.departmentName],
      ['Academic year', data.academicYear],
      ['Study level', data.studyYearLabel],
      ['Current semester index', String(data.currentSemester)],
      ['Account status', data.accountActive ? 'Active' : 'Inactive'],
    ];

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#025692').text('Personal details');
    doc.moveDown(0.5);
    doc.font('Helvetica').fillColor('#1e293b');
    for (const [label, value] of rows) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
    }

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fillColor('#025692').text('Enrolled courses (current plan)');
    doc.moveDown(0.5);
    doc.font('Helvetica').fillColor('#1e293b');
    if (data.enrolledCourses.length === 0) {
      doc.text('—');
    } else {
      for (const course of data.enrolledCourses) {
        doc.text(`• ${course}`);
      }
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor('#64748b')
      .text(`Issued on ${data.issuedAt.toLocaleDateString()} — for official university use.`, {
        align: 'center',
      });

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.end();
  });
}
