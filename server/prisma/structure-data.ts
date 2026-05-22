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

export const UNIVERSITY_STRUCTURE: CollegeSeed[] = [
  {
    name: 'College of Engineering & Technology',
    description: 'Engineering programs including computing, energy, and biomedical systems.',
    departments: [
      {
        code: 'COMP_ENG',
        name: 'Computer Engineering',
        description:
          'Focus on software systems, networks, embedded systems, and information technology for engineering applications.',
      },
      {
        code: 'ENERGY_ENG',
        name: 'Energy Engineering',
        description:
          'Study of power generation, renewable energy, energy efficiency, and sustainable engineering solutions.',
      },
      {
        code: 'BIOMED_ENG',
        name: 'Biomedical Engineering',
        description:
          'Intersection of engineering and healthcare: medical devices, diagnostics, and hospital technology systems.',
      },
    ],
  },
  {
    name: 'College of Health Sciences',
    description: 'Clinical and pharmaceutical programs preparing healthcare professionals.',
    departments: [
      {
        code: 'PHARMACY',
        name: 'Pharmacy',
        description:
          'Pharmaceutical sciences, drug formulation, clinical pharmacy, and medication safety in healthcare settings.',
      },
      {
        code: 'ANESTHESIA',
        name: 'Anesthesia',
        description:
          'Perioperative care, anesthesia techniques, patient monitoring, and critical support in surgical environments.',
      },
    ],
  },
  {
    name: 'College of Humanities',
    description: 'Language, communication, and cultural studies for academic and professional excellence.',
    departments: [
      {
        code: 'ENGLISH',
        name: 'English Language',
        description:
          'English linguistics, literature, translation, and communication skills for academic and international careers.',
      },
    ],
  },
  {
    name: 'College of Administrative Sciences',
    description: 'Business administration, management, and organizational leadership programs.',
    departments: [
      {
        code: 'ADMIN_SCI',
        name: 'Administrative Sciences',
        description:
          'Management, accounting, economics, and organizational behavior for public and private sector leadership.',
      },
    ],
  },
];
