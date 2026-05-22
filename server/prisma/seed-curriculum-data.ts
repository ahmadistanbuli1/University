import type { StudyTerm } from '@prisma/client';

export type CurriculumCourseSeed = {
  studyYear: number;
  term: StudyTerm;
  name: string;
  code: string;
};

export const DEPT_MAX_STUDY_YEARS: Record<string, number> = {
  INFO_ENG: 5,
  MED_ENG: 5,
  ALT_ENERGY_ENG: 5,
  ANESTHESIA: 4,
  ADMIN_SCI: 4,
  PHARMACY: 4,
  ENGLISH_LIT: 4,
};

const INFO_ENG_COURSES: Record<string, string[]> = {
  '1-FIRST': ['Programming Fundamentals', 'Engineering Mathematics I', 'Physics for Engineers', 'Technical English I'],
  '1-SECOND': ['Object-Oriented Programming', 'Discrete Mathematics', 'Digital Logic Design', 'Communication Skills'],
  '2-FIRST': ['Data Structures & Algorithms', 'Computer Organization', 'Probability & Statistics', 'Electronics Basics'],
  '2-SECOND': ['Database Systems', 'Operating Systems', 'Signals & Systems', 'Professional Ethics'],
  '3-FIRST': ['Computer Networks', 'Software Engineering', 'Web Technologies', 'Information Security Basics'],
  '3-SECOND': ['Mobile Application Development', 'Cloud Computing Intro', 'Artificial Intelligence Fundamentals', 'Project Management'],
  '4-FIRST': ['Distributed Systems', 'Network Security', 'Machine Learning', 'Embedded Systems'],
  '4-SECOND': ['Big Data Analytics', 'Internet of Things', 'Compiler Design', 'Elective: Cybersecurity'],
  '5-FIRST': ['Capstone Project I', 'Advanced Software Architecture', 'Enterprise Systems', 'IT Governance'],
  '5-SECOND': ['Capstone Project II', 'Industry Internship Seminar', 'Innovation & Entrepreneurship', 'Graduation Seminar'],
};

const MED_ENG_COURSES: Record<string, string[]> = {
  '1-FIRST': ['Biomedical Engineering Intro', 'Calculus I', 'General Physics', 'Medical Terminology'],
  '1-SECOND': ['Human Anatomy for Engineers', 'Calculus II', 'Chemistry for Health Sciences', 'Biostatistics'],
  '2-FIRST': ['Biomaterials', 'Physiology', 'Electrical Circuits', 'Medical Imaging Basics'],
  '2-SECOND': ['Biomechanics', 'Medical Instrumentation I', 'Control Systems', 'Healthcare Ethics'],
  '3-FIRST': ['Medical Instrumentation II', 'Hospital Information Systems', 'Signal Processing', 'Clinical Engineering'],
  '3-SECOND': ['Rehabilitation Engineering', 'Regulatory Affairs', 'Biomedical Sensors', 'Quality Management'],
  '4-FIRST': ['Advanced Medical Devices', 'Healthcare IoT', 'Risk Management in Hospitals', 'Elective Lab'],
  '4-SECOND': ['Clinical Placement', 'Capstone Design I', 'Health Technology Assessment', 'Research Methods'],
  '5-FIRST': ['Capstone Design II', 'Hospital Operations', 'Telemedicine Systems', 'Professional Practice'],
  '5-SECOND': ['Graduation Project', 'Medical Device Standards', 'Innovation in Healthcare', 'Seminar'],
};

const ALT_ENERGY_COURSES: Record<string, string[]> = {
  '1-FIRST': ['Introduction to Energy Engineering', 'Engineering Mathematics I', 'Physics I', 'Technical Drawing'],
  '1-SECOND': ['Thermodynamics I', 'Chemistry for Engineers', 'Programming for Engineers', 'Environmental Science'],
  '2-FIRST': ['Thermodynamics II', 'Fluid Mechanics', 'Electrical Circuits', 'Renewable Energy Overview'],
  '2-SECOND': ['Heat Transfer', 'Solar Energy Systems', 'Wind Energy Basics', 'Energy Economics'],
  '3-FIRST': ['Power Electronics', 'Energy Storage Systems', 'Grid Integration', 'Energy Policy'],
  '3-SECOND': ['Hydrogen & Bioenergy', 'Energy Efficiency in Buildings', 'Instrumentation', 'Project Lab I'],
  '4-FIRST': ['Smart Grids', 'Energy Management Systems', 'Sustainability Assessment', 'Project Lab II'],
  '4-SECOND': ['Industrial Energy Audit', 'Electric Vehicles & Charging', 'Elective: Nuclear Energy', 'Safety Engineering'],
  '5-FIRST': ['Capstone Project I', 'Advanced Renewables', 'Energy Entrepreneurship', 'Climate Tech'],
  '5-SECOND': ['Capstone Project II', 'Field Training', 'Energy Law & Standards', 'Graduation Seminar'],
};

const ANESTHESIA_COURSES: Record<string, string[]> = {
  '1-FIRST': ['Fundamentals of Nursing', 'Human Anatomy', 'Physiology I', 'Medical Ethics'],
  '1-SECOND': ['Microbiology', 'Physiology II', 'Health Communication', 'First Aid'],
  '2-FIRST': ['Pathophysiology', 'Pharmacology I', 'Clinical Skills I', 'Patient Safety'],
  '2-SECOND': ['Pharmacology II', 'Perioperative Basics', 'Clinical Skills II', 'Infection Control'],
  '3-FIRST': ['Principles of Anesthesia', 'Airway Management', 'Anesthesia Equipment', 'Critical Care Intro'],
  '3-SECOND': ['Regional Anesthesia', 'Pediatric Anesthesia', 'Obstetric Anesthesia', 'Clinical Practicum I'],
  '4-FIRST': ['Advanced Anesthesia', 'Pain Management', 'Emergency Anesthesia', 'Clinical Practicum II'],
  '4-SECOND': ['ICU Monitoring', 'Anesthesia Research', 'Professional Practice', 'Graduation Project'],
};

const ADMIN_SCI_COURSES: Record<string, string[]> = {
  '1-FIRST': ['Principles of Management', 'Microeconomics', 'Business Mathematics', 'Computer Applications'],
  '1-SECOND': ['Financial Accounting', 'Business Statistics', 'Organizational Behavior', 'Business Communication'],
  '2-FIRST': ['Marketing Principles', 'Macroeconomics', 'Cost Accounting', 'Business Law'],
  '2-SECOND': ['Human Resource Management', 'Operations Management', 'Management Information Systems', 'Entrepreneurship'],
  '3-FIRST': ['Financial Management', 'Strategic Management', 'Business Research Methods', 'Supply Chain Basics'],
  '3-SECOND': ['Corporate Finance', 'International Business', 'Quality Management', 'Business Analytics'],
  '4-FIRST': ['Leadership & Governance', 'Taxation Basics', 'Project Management', 'Internship Seminar'],
  '4-SECOND': ['Business Policy', 'Risk Management', 'Graduation Project', 'Professional Ethics'],
};

const PHARMACY_COURSES: Record<string, string[]> = {
  '1-FIRST': ['General Chemistry', 'Biology for Pharmacy', 'Pharmacy Profession Intro', 'Medical Terminology'],
  '1-SECOND': ['Organic Chemistry', 'Anatomy & Physiology', 'Pharmaceutical Mathematics', 'Biochemistry I'],
  '2-FIRST': ['Biochemistry II', 'Pharmaceutics I', 'Pharmacology I', 'Pharmaceutical Analysis I'],
  '2-SECOND': ['Pharmaceutics II', 'Pharmacology II', 'Pharmaceutical Analysis II', 'Microbiology'],
  '3-FIRST': ['Clinical Pharmacy I', 'Medicinal Chemistry', 'Pharmacognosy', 'Hospital Pharmacy'],
  '3-SECOND': ['Clinical Pharmacy II', 'Pharmaceutical Technology', 'Toxicology', 'Community Pharmacy'],
  '4-FIRST': ['Advanced Therapeutics', 'Drug Safety', 'Pharmacy Practice', 'Research Project I'],
  '4-SECOND': ['Clinical Rotations', 'Pharmacy Law', 'Graduation Project', 'Professional Practice'],
};

const ENGLISH_LIT_COURSES: Record<string, string[]> = {
  '1-FIRST': ['Academic Writing', 'Introduction to Linguistics', 'British Literature Survey', 'Phonetics'],
  '1-SECOND': ['Advanced Writing', 'Grammar & Syntax', 'American Literature Survey', 'Translation Theory'],
  '2-FIRST': ['Discourse Analysis', 'Poetry & Drama', 'Second Language Acquisition', 'Arabic-English Translation'],
  '2-SECOND': ['Sociolinguistics', 'Novel Studies', 'Public Speaking', 'Media English'],
  '3-FIRST': ['Literary Criticism', 'Applied Linguistics', 'Technical Translation', 'Creative Writing'],
  '3-SECOND': ['Comparative Literature', 'Corpus Linguistics', 'Business English', 'Teaching Methodology'],
  '4-FIRST': ['Research Methods in Humanities', 'Capstone Seminar I', 'Professional Translation', 'World Literature'],
  '4-SECOND': ['Capstone Thesis', 'Language Testing', 'Internship in Education', 'Graduation Portfolio'],
};

const COURSE_MAP: Record<string, Record<string, string[]>> = {
  INFO_ENG: INFO_ENG_COURSES,
  MED_ENG: MED_ENG_COURSES,
  ALT_ENERGY_ENG: ALT_ENERGY_COURSES,
  ANESTHESIA: ANESTHESIA_COURSES,
  ADMIN_SCI: ADMIN_SCI_COURSES,
  PHARMACY: PHARMACY_COURSES,
  ENGLISH_LIT: ENGLISH_LIT_COURSES,
};

export function buildCurriculumForDepartment(departmentCode: string): CurriculumCourseSeed[] {
  const maxYears = DEPT_MAX_STUDY_YEARS[departmentCode] ?? 4;
  const map = COURSE_MAP[departmentCode];
  const seeds: CurriculumCourseSeed[] = [];

  for (let year = 1; year <= maxYears; year++) {
    for (const term of ['FIRST', 'SECOND'] as StudyTerm[]) {
      const key = `${year}-${term}`;
      const names =
        map?.[key] ??
        Array.from({ length: 3 }, (_, i) => `${departmentCode} Year ${year} Term ${term} Course ${i + 1}`);
      names.forEach((name, index) => {
        const code = `${departmentCode}-Y${year}-${term === 'FIRST' ? 'S1' : 'S2'}-C${String(index + 1).padStart(2, '0')}`;
        seeds.push({ studyYear: year, term, name, code });
      });
    }
  }

  return seeds;
}

/** Demo grades for INFO_ENG year-4 student (semester 7 = year 4, term 1). */
export const INFO_ENG_DEMO_GRADES: Record<
  string,
  { practical: number; theory: number }
> = {
  'INFO_ENG-Y1-S1-C01': { practical: 32, theory: 48 },
  'INFO_ENG-Y1-S1-C02': { practical: 35, theory: 52 },
  'INFO_ENG-Y1-S1-C03': { practical: 30, theory: 45 },
  'INFO_ENG-Y1-S1-C04': { practical: 38, theory: 55 },
  'INFO_ENG-Y1-S2-C01': { practical: 34, theory: 50 },
  'INFO_ENG-Y1-S2-C02': { practical: 36, theory: 54 },
  'INFO_ENG-Y1-S2-C03': { practical: 33, theory: 49 },
  'INFO_ENG-Y1-S2-C04': { practical: 37, theory: 56 },
  'INFO_ENG-Y2-S1-C01': { practical: 35, theory: 53 },
  'INFO_ENG-Y2-S1-C02': { practical: 31, theory: 47 },
  'INFO_ENG-Y2-S1-C03': { practical: 36, theory: 55 },
  'INFO_ENG-Y2-S1-C04': { practical: 34, theory: 51 },
  'INFO_ENG-Y2-S2-C01': { practical: 37, theory: 57 },
  'INFO_ENG-Y2-S2-C02': { practical: 33, theory: 50 },
  'INFO_ENG-Y2-S2-C03': { practical: 35, theory: 54 },
  'INFO_ENG-Y2-S2-C04': { practical: 38, theory: 58 },
  'INFO_ENG-Y3-S1-C01': { practical: 36, theory: 56 },
  'INFO_ENG-Y3-S1-C02': { practical: 34, theory: 52 },
  'INFO_ENG-Y3-S1-C03': { practical: 37, theory: 58 },
  'INFO_ENG-Y3-S1-C04': { practical: 35, theory: 55 },
  'INFO_ENG-Y3-S2-C01': { practical: 38, theory: 59 },
  'INFO_ENG-Y3-S2-C02': { practical: 36, theory: 54 },
  'INFO_ENG-Y3-S2-C03': { practical: 34, theory: 53 },
  'INFO_ENG-Y3-S2-C04': { practical: 37, theory: 57 },
  'INFO_ENG-Y4-S1-C01': { practical: 35, theory: 54 },
  'INFO_ENG-Y4-S1-C02': { practical: 33, theory: 51 },
  'INFO_ENG-Y4-S1-C03': { practical: 36, theory: 55 },
  'INFO_ENG-Y4-S1-C04': { practical: 34, theory: 52 },
};
