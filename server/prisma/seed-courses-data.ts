/** Courses per department (unique `code` across the university). */
export type CourseSeed = {
  code: string;
  name: string;
};

export const SEED_COURSES_BY_DEPARTMENT: Record<string, CourseSeed[]> = {
  COMP_ENG: [
    { code: 'CE101', name: 'Introduction to Programming' },
    { code: 'CE201', name: 'Data Structures' },
    { code: 'CE301', name: 'Computer Networks' },
    { code: 'CE302', name: 'Operating Systems' },
  ],
  ENERGY_ENG: [
    { code: 'EN101', name: 'Engineering Thermodynamics' },
    { code: 'EN201', name: 'Renewable Energy Systems' },
    { code: 'EN301', name: 'Power Generation' },
  ],
  BIOMED_ENG: [
    { code: 'BM101', name: 'Introduction to Biomedical Engineering' },
    { code: 'BM201', name: 'Medical Instrumentation' },
    { code: 'BM301', name: 'Hospital Technology Systems' },
  ],
  PHARMACY: [
    { code: 'PH101', name: 'Pharmaceutics I' },
    { code: 'PH201', name: 'Clinical Pharmacy' },
    { code: 'PH301', name: 'Drug Safety & Pharmacovigilance' },
  ],
  ANESTHESIA: [
    { code: 'AN101', name: 'Principles of Anesthesia' },
    { code: 'AN201', name: 'Perioperative Nursing' },
    { code: 'AN301', name: 'Critical Care Monitoring' },
  ],
  ENGLISH: [
    { code: 'EL101', name: 'Academic Writing' },
    { code: 'EL201', name: 'English Literature' },
    { code: 'EL301', name: 'Translation Studies' },
  ],
  ADMIN_SCI: [
    { code: 'BA101', name: 'Principles of Management' },
    { code: 'BA201', name: 'Financial Accounting' },
    { code: 'BA301', name: 'Microeconomics' },
    { code: 'BA302', name: 'Organizational Behavior' },
  ],
};

export const SEED_ACADEMIC_TERM = {
  semester: 'Fall 2025',
  academicYear: '2025-2026',
} as const;
