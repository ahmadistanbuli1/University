import { describe, expect, it } from 'vitest';
import {
  averageCourseTotals,
  courseTotalScore,
  isCourseReachable,
  studyYearFromSemester,
  termFromSemester,
} from './study-plan.js';

describe('studyYearFromSemester', () => {
  it('maps semesters to study years', () => {
    expect(studyYearFromSemester(1)).toBe(1);
    expect(studyYearFromSemester(2)).toBe(1);
    expect(studyYearFromSemester(7)).toBe(4);
    expect(studyYearFromSemester(10)).toBe(5);
  });
});

describe('termFromSemester', () => {
  it('maps odd semesters to FIRST', () => {
    expect(termFromSemester(1)).toBe('FIRST');
    expect(termFromSemester(7)).toBe('FIRST');
  });
  it('maps even semesters to SECOND', () => {
    expect(termFromSemester(2)).toBe('SECOND');
    expect(termFromSemester(8)).toBe('SECOND');
  });
});

describe('isCourseReachable', () => {
  it('allows past years', () => {
    expect(isCourseReachable(7, 3, 'SECOND')).toBe(true);
  });
  it('blocks future years', () => {
    expect(isCourseReachable(7, 5, 'FIRST')).toBe(false);
  });
  it('allows current year up to current term', () => {
    expect(isCourseReachable(7, 4, 'FIRST')).toBe(true);
    expect(isCourseReachable(7, 4, 'SECOND')).toBe(false);
  });
});

describe('courseTotalScore', () => {
  it('sums practical and theory', () => {
    expect(courseTotalScore(35, 54)).toBe(89);
  });
});

describe('averageCourseTotals', () => {
  it('returns null for empty', () => {
    expect(averageCourseTotals([])).toBeNull();
  });
  it('averages totals', () => {
    expect(averageCourseTotals([80, 90])).toBe(85);
  });
});
