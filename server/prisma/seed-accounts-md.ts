import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEPT_MAX_STUDY_YEARS } from './seed-curriculum-data.js';
import {
  SEED_STUDENT_PASSWORD,
  type StudentSeed,
  buildSeedStudents,
} from './seed-students-data.js';
import { UNIVERSITY_STRUCTURE } from './structure-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, '../../docs/accounts/md');

export type StudentCredential = StudentSeed & {
  collegeName: string;
  departmentName: string;
};

export function mapStudentCredentials(
  seeds: StudentSeed[],
  deptByCode: Map<string, { name: string; collegeName: string }>
): StudentCredential[] {
  return seeds.map((s) => {
    const dept = deptByCode.get(s.departmentCode);
    return {
      ...s,
      collegeName: dept?.collegeName ?? s.departmentCode,
      departmentName: dept?.name ?? s.departmentCode,
    };
  });
}

function renderMarkdown(credentials: StudentCredential[]): string {
  const lines: string[] = [
    '# Student demo accounts',
    '',
    `Password for all accounts: \`${SEED_STUDENT_PASSWORD}\``,
    '',
    'Each department has **5 students per study year**, currently in the **second semester** of that year.',
    'First-semester grades are pre-seeded as complete; enrollments and grade entry are for second-semester courses only.',
    '',
  ];

  const byCollege = new Map<string, StudentCredential[]>();
  for (const row of credentials) {
    const list = byCollege.get(row.collegeName) ?? [];
    list.push(row);
    byCollege.set(row.collegeName, list);
  }

  for (const college of [...byCollege.keys()].sort()) {
    lines.push(`## ${college}`, '');
    const collegeRows = byCollege.get(college)!;
    const byDept = new Map<string, StudentCredential[]>();
    for (const row of collegeRows) {
      const list = byDept.get(row.departmentName) ?? [];
      list.push(row);
      byDept.set(row.departmentName, list);
    }

    for (const [deptName, deptRows] of [...byDept.entries()].sort()) {
      lines.push(`### ${deptName}`, '');
      const byYear = new Map<number, StudentCredential[]>();
      for (const row of deptRows) {
        const list = byYear.get(row.studyYear) ?? [];
        list.push(row);
        byYear.set(row.studyYear, list);
      }

      for (const year of [...byYear.keys()].sort((a, b) => a - b)) {
        const maxYears = DEPT_MAX_STUDY_YEARS[deptRows[0]!.departmentCode] ?? 4;
        lines.push(`#### Study year ${year} of ${maxYears} (semester ${(year - 1) * 2 + 2} — term 2)`, '');
        lines.push('| # | Name | Email | Academic # |');
        lines.push('|---|------|-------|------------|');
        for (const row of byYear.get(year)!.sort((a, b) => a.email.localeCompare(b.email))) {
          const index = row.academicNumber.split('-').pop() ?? '—';
          lines.push(`| ${index} | ${row.name} | \`${row.email}\` | ${row.academicNumber} |`);
        }
        lines.push('');
      }
    }
  }

  lines.push('## Staff (reference)', '');
  lines.push('| Role | Email | Password |');
  lines.push('|------|-------|----------|');
  lines.push('| Faculty | `faculty@university.edu` | `Password123!` |');
  lines.push('| Exam officer | `exams@university.edu` | `Password123!` |');
  lines.push('| Admin | `admin@university.edu` | `Password123!` |');
  lines.push('');

  return lines.join('\n');
}

export async function writeStudentAccountsMarkdown(
  credentials: StudentCredential[]
): Promise<string> {
  await mkdir(DOCS_DIR, { recursive: true });
  const filePath = path.join(DOCS_DIR, 'student-accounts.md');
  await writeFile(filePath, renderMarkdown(credentials), 'utf8');
  return filePath;
}

/** Build credentials from canonical structure (for seed without DB). */
export function buildCredentialsFromStructure(): StudentCredential[] {
  const deptByCode = new Map<string, { name: string; collegeName: string }>();
  for (const college of UNIVERSITY_STRUCTURE) {
    for (const dept of college.departments) {
      deptByCode.set(dept.code, { name: dept.name, collegeName: college.name });
    }
  }
  return mapStudentCredentials(buildSeedStudents(), deptByCode);
}
