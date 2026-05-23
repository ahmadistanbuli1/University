/** Demo student accounts — one per department. Password for all: Password123! */
export type StudentSeed = {
  name: string;
  email: string;
  departmentCode: string;
  academicNumber: string;
  currentSemester: number;
  academicYear: string;
};

export const SEED_STUDENTS: StudentSeed[] = [
  {
    name: 'Omar Al-Hassan',
    email: 'student.infoeng@university.edu',
    departmentCode: 'INFO_ENG',
    academicNumber: 'STU-2025-INFO-01',
    currentSemester: 7,
    academicYear: '2025-2026',
  },
  {
    name: 'Karim Saleh',
    email: 'student.medeng@university.edu',
    departmentCode: 'MED_ENG',
    academicNumber: 'STU-2025-MED-01',
    currentSemester: 1,
    academicYear: '2025-2026',
  },
  {
    name: 'Layla Mansour',
    email: 'student.altenergy@university.edu',
    departmentCode: 'ALT_ENERGY_ENG',
    academicNumber: 'STU-2025-ALT-01',
    currentSemester: 1,
    academicYear: '2025-2026',
  },
  {
    name: 'Sara Mahmoud',
    email: 'student.anesthesia@university.edu',
    departmentCode: 'ANESTHESIA',
    academicNumber: 'STU-2025-ANES-01',
    currentSemester: 1,
    academicYear: '2025-2026',
  },
  {
    name: 'Fatima Al-Khatib',
    email: 'student.admin@university.edu',
    departmentCode: 'ADMIN_SCI',
    academicNumber: 'STU-2025-ADMN-01',
    currentSemester: 1,
    academicYear: '2025-2026',
  },
  {
    name: 'Nour Ibrahim',
    email: 'student.pharmacy@university.edu',
    departmentCode: 'PHARMACY',
    academicNumber: 'STU-2025-PHRM-01',
    currentSemester: 1,
    academicYear: '2025-2026',
  },
  {
    name: 'James Walker',
    email: 'student.english@university.edu',
    departmentCode: 'ENGLISH_LIT',
    academicNumber: 'STU-2025-ENGL-01',
    currentSemester: 1,
    academicYear: '2025-2026',
  },
];

export const SEED_STUDENT_PASSWORD = 'Password123!';
