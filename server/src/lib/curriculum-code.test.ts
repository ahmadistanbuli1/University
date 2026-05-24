import { describe, expect, it } from 'vitest';
import { curriculumCodeForSlot, nextCurriculumSlotIndex } from './curriculum-code.js';

describe('curriculum-code', () => {
  it('builds canonical slot codes', () => {
    expect(curriculumCodeForSlot('INFO_ENG', 1, 'FIRST', 3)).toBe('INFO_ENG-Y1-S1-C03');
    expect(curriculumCodeForSlot('INFO_ENG', 2, 'SECOND', 1)).toBe('INFO_ENG-Y2-S2-C01');
  });

  it('picks next index after existing codes in slot', () => {
    const next = nextCurriculumSlotIndex(
      ['INFO_ENG-Y1-S1-C01', 'INFO_ENG-Y1-S1-C02', 'INFO_ENG-Y1-S1-C04'],
      'INFO_ENG'
    );
    expect(next).toBe(5);
  });
});
