const AR_DEPARTMENTS: Record<string, string> = {
  INFO_ENG: 'هندسة المعلوماتية',
  MED_ENG: 'الهندسة الطبية',
  ALT_ENERGY_ENG: 'هندسة الطاقة البديلة',
  ANESTHESIA: 'كلية العلوم الصحية — تخدير',
  ADMIN_SCI: 'كلية العلوم الإدارية',
  PHARMACY: 'كلية العلوم الصيدلة',
  ENGLISH_LIT: 'كلية آداب اللغة الإنجليزية',
};

const AR_COLLEGES: Record<string, string> = {
  'College of Information Engineering': 'هندسة المعلوماتية',
  'College of Medical Engineering': 'الهندسة الطبية',
  'College of Alternative Energy Engineering': 'هندسة الطاقة البديلة',
  'College of Health Sciences — Anesthesia': 'كلية العلوم الصحية — تخدير',
  'College of Administrative Sciences': 'كلية العلوم الإدارية',
  'College of Pharmaceutical Sciences': 'كلية العلوم الصيدلة',
  'College of English Language & Literature': 'كلية آداب اللغة الإنجليزية',
};

const ENGINEERING_CODES = new Set(['INFO_ENG', 'MED_ENG', 'ALT_ENERGY_ENG']);

export function studyYearFromSemester(currentSemester: number): number {
  return Math.floor((Math.max(1, currentSemester) - 1) / 2) + 1;
}

export function getMaxStudyYears(departmentCode?: string | null): number {
  if (!departmentCode) return 4;
  if (ENGINEERING_CODES.has(departmentCode)) return 5;
  return 4;
}

export function buildStudyYearOptions(maxYears: number): number[] {
  return Array.from({ length: maxYears }, (_, i) => i + 1);
}

export function getStudyYearLabel(level: number, lang: string): string {
  if (lang.startsWith('ar')) {
    const ordinals = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];
    const ord = ordinals[level - 1];
    return ord ? `السنة ${ord}` : `السنة ${level}`;
  }
  return `Year ${level}`;
}

export function getDepartmentLabel(
  dept: { code: string; name: string },
  lang: string
): string {
  if (lang.startsWith('ar') && AR_DEPARTMENTS[dept.code]) {
    return AR_DEPARTMENTS[dept.code];
  }
  return dept.name;
}

export function getCollegeLabel(collegeName: string, lang: string): string {
  if (lang.startsWith('ar') && AR_COLLEGES[collegeName]) {
    return AR_COLLEGES[collegeName];
  }
  return collegeName;
}
