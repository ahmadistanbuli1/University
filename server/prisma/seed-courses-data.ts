/** Courses per department (unique `code` across the university). */
export type CourseSeed = {
  code: string;
  name: string;
};

export const SEED_COURSES_BY_DEPARTMENT: Record<string, CourseSeed[]> = {
  INFO_ENG: [
    { code: 'IE101', name: 'Introduction to Programming' },
    { code: 'IE201', name: 'Data Structures' },
    { code: 'IE301', name: 'Computer Networks' },
    { code: 'IE302', name: 'Operating Systems' },
  ],
  MED_ENG: [
    { code: 'ME101', name: 'Introduction to Medical Engineering' },
    { code: 'ME201', name: 'Medical Instrumentation' },
    { code: 'ME301', name: 'Hospital Technology Systems' },
  ],
  ALT_ENERGY_ENG: [
    { code: 'AE101', name: 'Engineering Thermodynamics' },
    { code: 'AE201', name: 'Renewable Energy Systems' },
    { code: 'AE301', name: 'Power Generation' },
  ],
  ANESTHESIA: [
    { code: 'AN101', name: 'Principles of Anesthesia' },
    { code: 'AN201', name: 'Perioperative Nursing' },
    { code: 'AN301', name: 'Critical Care Monitoring' },
  ],
  ADMIN_SCI: [
    { code: 'BA101', name: 'Principles of Management' },
    { code: 'BA201', name: 'Financial Accounting' },
    { code: 'BA301', name: 'Microeconomics' },
    { code: 'BA302', name: 'Organizational Behavior' },
  ],
  PHARMACY: [
    { code: 'PH101', name: 'Pharmaceutics I' },
    { code: 'PH201', name: 'Clinical Pharmacy' },
    { code: 'PH301', name: 'Drug Safety & Pharmacovigilance' },
  ],
  ENGLISH_LIT: [
    { code: 'EL101', name: 'Academic Writing' },
    { code: 'EL201', name: 'English Literature' },
    { code: 'EL301', name: 'Translation Studies' },
  ],
};

export const SEED_ACADEMIC_TERM = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;
