import ExcelJS from 'exceljs';
import type { AffairsStudentRow } from '../api/hooks.js';

const NAVY = 'FF1E3A5F';
const HEADER_BG = 'FFE8EDF4';
const ALT_ROW = 'FFF8FAFC';
const BORDER = { style: 'thin' as const, color: { argb: 'FFD0D7E2' } };

/** Shared Tailwind classes for Excel export actions */
export const excelExportButtonClass =
  'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 ring-1 ring-inset ring-white/15 hover:from-emerald-700 hover:to-teal-600 dark:from-emerald-600 dark:to-teal-500 dark:hover:from-emerald-500 dark:hover:to-teal-400';

async function saveWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function styleTitleRow(sheet: ExcelJS.Worksheet, row: number, colCount: number, title: string) {
  sheet.mergeCells(row, 1, row, colCount);
  const cell = sheet.getCell(row, 1);
  cell.value = title;
  cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getRow(row).height = 28;
}

function styleHeaderRow(sheet: ExcelJS.Worksheet, row: number, headers: string[]) {
  headers.forEach((text, i) => {
    const cell = sheet.getCell(row, i + 1);
    cell.value = text;
    cell.font = { bold: true, color: { argb: NAVY } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: BORDER,
      left: BORDER,
      bottom: BORDER,
      right: BORDER,
    };
  });
  sheet.getRow(row).height = 22;
}

function styleDataCell(cell: ExcelJS.Cell, alt: boolean) {
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: BORDER,
    left: BORDER,
    bottom: BORDER,
    right: BORDER,
  };
  if (alt) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT_ROW } };
  }
}

function autoFitColumns(sheet: ExcelJS.Worksheet, minWidth = 12, maxWidth = 42) {
  sheet.columns.forEach((col) => {
    let maxLen = minWidth;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const raw = cell.value;
      const text =
        raw == null
          ? ''
          : typeof raw === 'object' && 'text' in (raw as object)
            ? String((raw as { text: string }).text)
            : String(raw);
      maxLen = Math.max(maxLen, Math.min(text.length + 2, maxWidth));
    });
    col.width = maxLen;
  });
}

export type StudentExportMeta = {
  departmentName: string;
  studyYearLabel: string;
  lang: string;
  generatedLabel: string;
  sheetTitle: string;
  subtitle: string;
  headers: {
    index: string;
    academicNumber: string;
    fullName: string;
    email: string;
    semester: string;
    studyYear: string;
    academicYear: string;
    status: string;
  };
  activeLabel: string;
  inactiveLabel: string;
};

export async function exportStudentsToExcel(
  students: AffairsStudentRow[],
  meta: StudentExportMeta
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'University Portal';
  wb.created = new Date();
  const sheet = wb.addWorksheet(meta.sheetTitle.slice(0, 31), {
    views: [{ rightToLeft: meta.lang.startsWith('ar') }],
  });

  const colCount = 8;
  styleTitleRow(sheet, 1, colCount, meta.sheetTitle);
  sheet.mergeCells(2, 1, 2, colCount);
  const sub = sheet.getCell(2, 1);
  sub.value = meta.subtitle;
  sub.font = { size: 11, italic: true, color: { argb: 'FF475569' } };
  sub.alignment = { horizontal: 'center', wrapText: true };
  sheet.getRow(2).height = 20;

  const headerRow = 4;
  const headers = [
    meta.headers.index,
    meta.headers.academicNumber,
    meta.headers.fullName,
    meta.headers.email,
    meta.headers.studyYear,
    meta.headers.semester,
    meta.headers.academicYear,
    meta.headers.status,
  ];
  styleHeaderRow(sheet, headerRow, headers);

  students.forEach((s, idx) => {
    const rowNum = headerRow + 1 + idx;
    const studyYear = Math.floor((Math.max(1, s.currentSemester) - 1) / 2) + 1;
    const termInYear = s.currentSemester % 2 === 0 ? 2 : 1;
    const values = [
      idx + 1,
      s.academicNumber,
      s.user.name,
      s.user.email,
      studyYear,
      termInYear,
      s.academicYear,
      s.user.active ? meta.activeLabel : meta.inactiveLabel,
    ];
    values.forEach((val, col) => {
      const cell = sheet.getCell(rowNum, col + 1);
      cell.value = val;
      styleDataCell(cell, idx % 2 === 1);
    });
  });

  autoFitColumns(sheet);

  const stamp = new Date().toISOString().slice(0, 10);
  const safeDept = meta.departmentName.replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40);
  await saveWorkbook(wb, `students_${safeDept}_y${meta.studyYearLabel}_${stamp}.xlsx`);
}

export type GradeExportLine = {
  academicNumber: string;
  fullName: string;
  practicalScore: number | null;
  theoryScore: number | null;
};

export type GradeExportMeta = {
  lang: string;
  sheetTitle: string;
  subtitle: string;
  phaseLabel: string;
  headers: {
    index: string;
    academicNumber: string;
    fullName: string;
    practical: string;
    theory: string;
    total: string;
  };
  isTheoryPhase: boolean;
};

export async function exportGradeSubmissionToExcel(
  lines: GradeExportLine[],
  meta: GradeExportMeta
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'University Portal';
  const sheet = wb.addWorksheet('Grades', {
    views: [{ rightToLeft: meta.lang.startsWith('ar') }],
  });

  const colCount = meta.isTheoryPhase ? 6 : 4;
  styleTitleRow(sheet, 1, colCount, meta.sheetTitle);
  sheet.mergeCells(2, 1, 2, colCount);
  const sub = sheet.getCell(2, 1);
  sub.value = `${meta.subtitle} · ${meta.phaseLabel}`;
  sub.font = { size: 11, italic: true, color: { argb: 'FF475569' } };
  sub.alignment = { horizontal: 'center', wrapText: true };

  const headerRow = 4;
  const headers = meta.isTheoryPhase
    ? [
        meta.headers.index,
        meta.headers.academicNumber,
        meta.headers.fullName,
        meta.headers.practical,
        meta.headers.theory,
        meta.headers.total,
      ]
    : [
        meta.headers.index,
        meta.headers.academicNumber,
        meta.headers.fullName,
        meta.headers.practical,
      ];
  styleHeaderRow(sheet, headerRow, headers);

  lines.forEach((line, idx) => {
    const rowNum = headerRow + 1 + idx;
    const practical = line.practicalScore ?? 0;
    const theory = line.theoryScore;
    const total =
      meta.isTheoryPhase && theory != null ? Math.round((practical + theory) * 10) / 10 : null;
    const values = meta.isTheoryPhase
      ? [idx + 1, line.academicNumber, line.fullName, practical, theory ?? '—', total ?? '—']
      : [idx + 1, line.academicNumber, line.fullName, practical];
    values.forEach((val, col) => {
      const cell = sheet.getCell(rowNum, col + 1);
      cell.value = val;
      styleDataCell(cell, idx % 2 === 1);
    });
  });

  autoFitColumns(sheet);
  const stamp = new Date().toISOString().slice(0, 10);
  await saveWorkbook(wb, `grades_${stamp}.xlsx`);
}
