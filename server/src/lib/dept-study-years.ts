export const DEPT_MAX_STUDY_YEARS: Record<string, number> = {
  INFO_ENG: 5,
  MED_ENG: 5,
  ALT_ENERGY_ENG: 5,
  ANESTHESIA: 4,
  ADMIN_SCI: 4,
  PHARMACY: 4,
  ENGLISH_LIT: 4,
};

export function maxStudyYearsForDepartment(departmentCode: string): number {
  return DEPT_MAX_STUDY_YEARS[departmentCode] ?? 4;
}
