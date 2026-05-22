/** Canonical colleges and departments for registration and structure APIs. */
export type DepartmentSeed = {
  code: string;
  name: string;
  description: string;
};

export type CollegeSeed = {
  name: string;
  description: string;
  departments: DepartmentSeed[];
};

/** Seven colleges — each has one department (college name = program focus). */
export const UNIVERSITY_STRUCTURE: CollegeSeed[] = [
  {
    name: 'College of Information Engineering',
    description: 'Software systems, networks, embedded systems, and information technology engineering.',
    departments: [
      {
        code: 'INFO_ENG',
        name: 'Information Engineering',
        description:
          'Software systems, networks, embedded systems, and information technology for engineering applications.',
      },
    ],
  },
  {
    name: 'College of Medical Engineering',
    description: 'Medical devices, diagnostics, and hospital technology systems.',
    departments: [
      {
        code: 'MED_ENG',
        name: 'Medical Engineering',
        description:
          'Intersection of engineering and healthcare: medical devices, diagnostics, and hospital technology systems.',
      },
    ],
  },
  {
    name: 'College of Alternative Energy Engineering',
    description: 'Power generation, renewable energy, efficiency, and sustainable engineering.',
    departments: [
      {
        code: 'ALT_ENERGY_ENG',
        name: 'Alternative Energy Engineering',
        description:
          'Study of power generation, renewable energy, energy efficiency, and sustainable engineering solutions.',
      },
    ],
  },
  {
    name: 'College of Health Sciences — Anesthesia',
    description: 'Perioperative care, anesthesia techniques, and surgical patient monitoring.',
    departments: [
      {
        code: 'ANESTHESIA',
        name: 'Anesthesia',
        description:
          'Perioperative care, anesthesia techniques, patient monitoring, and critical support in surgical environments.',
      },
    ],
  },
  {
    name: 'College of Administrative Sciences',
    description: 'Business administration, management, accounting, and organizational leadership.',
    departments: [
      {
        code: 'ADMIN_SCI',
        name: 'Administrative Sciences',
        description:
          'Management, accounting, economics, and organizational behavior for public and private sector leadership.',
      },
    ],
  },
  {
    name: 'College of Pharmaceutical Sciences',
    description: 'Pharmaceutical sciences, clinical pharmacy, and medication safety.',
    departments: [
      {
        code: 'PHARMACY',
        name: 'Pharmacy',
        description:
          'Pharmaceutical sciences, drug formulation, clinical pharmacy, and medication safety in healthcare settings.',
      },
    ],
  },
  {
    name: 'College of English Language & Literature',
    description: 'English linguistics, literature, translation, and professional communication.',
    departments: [
      {
        code: 'ENGLISH_LIT',
        name: 'English Language & Literature',
        description:
          'English linguistics, literature, translation, and communication skills for academic and international careers.',
      },
    ],
  },
];

/** Legacy department codes → canonical codes (for DB migration on seed). */
export const DEPARTMENT_CODE_MIGRATIONS: Record<string, string> = {
  COMP_ENG: 'INFO_ENG',
  ENERGY_ENG: 'ALT_ENERGY_ENG',
  BIOMED_ENG: 'MED_ENG',
  ENGLISH: 'ENGLISH_LIT',
};

/** Aggregated colleges replaced by per-program colleges. */
export const OBSOLETE_COLLEGE_NAMES = [
  'College of Engineering & Technology',
  'College of Health Sciences',
  'College of Humanities',
];
