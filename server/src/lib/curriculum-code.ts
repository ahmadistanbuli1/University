import type { StudyTerm } from '@prisma/client';

export function curriculumCodeForSlot(
  departmentCode: string,
  studyYear: number,
  term: StudyTerm,
  index: number
) {
  const termPart = term === 'FIRST' ? 'S1' : 'S2';
  return `${departmentCode}-Y${studyYear}-${termPart}-C${String(index).padStart(2, '0')}`;
}

/** Next sequential code index for a department year/term slot (1-based). */
export function nextCurriculumSlotIndex(existingCodesInSlot: string[], departmentCode: string) {
  const prefix = `${departmentCode}-`;
  let max = 0;
  for (const code of existingCodesInSlot) {
    if (!code.startsWith(prefix)) continue;
    const match = /-C(\d+)$/.exec(code);
    if (match) {
      max = Math.max(max, Number.parseInt(match[1], 10));
    }
  }
  return max + 1;
}
