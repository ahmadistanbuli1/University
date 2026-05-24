/** Demo student accounts. Password for all: Password123! */
import { DEPT_MAX_STUDY_YEARS } from './seed-curriculum-data.js';

export type StudentSeed = {
  name: string;
  email: string;
  departmentCode: string;
  academicNumber: string;
  currentSemester: number;
  academicYear: string;
  studyYear: number;
};

export const SEED_STUDENT_PASSWORD = 'Password123!';

const DEPT_EMAIL_SLUG: Record<string, string> = {
  INFO_ENG: 'infoeng',
  MED_ENG: 'medeng',
  ALT_ENERGY_ENG: 'altenergy',
  ANESTHESIA: 'anesthesia',
  ADMIN_SCI: 'adminsci',
  PHARMACY: 'pharmacy',
  ENGLISH_LIT: 'english',
};

const ARABIC_FIRST = ['أحمد', 'سارة', 'محمد', 'ليلى', 'كريم'];
const ARABIC_LAST = ['الحسن', 'منصور', 'صالح', 'محمود', 'الخطيب'];

function studentName(deptCode: string, studyYear: number, index: number): string {
  const first = ARABIC_FIRST[index - 1] ?? `Student${index}`;
  const last = ARABIC_LAST[index - 1] ?? 'Demo';
  return `${first} ${last} (${deptCode} Y${studyYear})`;
}

/** Five students per study year — currently in the second semester of that year. */
export function buildSeedStudents(): StudentSeed[] {
  const students: StudentSeed[] = [];

  for (const [departmentCode, maxYears] of Object.entries(DEPT_MAX_STUDY_YEARS)) {
    const slug = DEPT_EMAIL_SLUG[departmentCode] ?? departmentCode.toLowerCase();
    for (let studyYear = 1; studyYear <= maxYears; studyYear++) {
      const currentSemester = (studyYear - 1) * 2 + 2;
      for (let n = 1; n <= 5; n++) {
        const nn = String(n).padStart(2, '0');
        students.push({
          name: studentName(departmentCode, studyYear, n),
          email: `student.${slug}.y${studyYear}.${nn}@university.edu`,
          departmentCode,
          academicNumber: `STU-2025-${departmentCode}-Y${studyYear}-${nn}`,
          currentSemester,
          academicYear: '2025-2026',
          studyYear,
        });
      }
    }
  }

  return students;
}

export const SEED_STUDENTS: StudentSeed[] = buildSeedStudents();
