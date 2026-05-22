const AR_DEPARTMENTS: Record<string, string> = {
  COMP_ENG: 'هندسة الحاسوب',
  ENERGY_ENG: 'هندسة الطاقة',
  BIOMED_ENG: 'الهندسة الطبية الحيوية',
  PHARMACY: 'الصيدلة',
  ANESTHESIA: 'التخدير',
  ENGLISH: 'اللغة الإنجليزية',
  ADMIN_SCI: 'العلوم الإدارية',
};

const AR_COLLEGES: Record<string, string> = {
  'College of Engineering & Technology': 'كلية الهندسة والتكنولوجيا',
  'College of Health Sciences': 'كلية العلوم الصحية',
  'College of Humanities': 'كلية الإنسانيات',
  'College of Administrative Sciences': 'كلية العلوم الإدارية',
};

const ENGINEERING_CODES = new Set(['COMP_ENG', 'ENERGY_ENG', 'BIOMED_ENG']);

export function getMaxStudyYears(departmentCode?: string | null): number {
  if (!departmentCode) return 4;
  if (ENGINEERING_CODES.has(departmentCode)) return 5;
  if (departmentCode === 'ADMIN_SCI') return 4;
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
