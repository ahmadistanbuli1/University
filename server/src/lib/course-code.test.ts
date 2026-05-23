import { describe, expect, it } from 'vitest';
import { parseCourseStudyMeta } from './course-code.js';

describe('parseCourseStudyMeta', () => {
  it('parses standard department course codes', () => {
    expect(parseCourseStudyMeta('INFO_ENG-Y3-S1-C01')).toEqual({
      studyYear: 3,
      term: 'FIRST',
    });
    expect(parseCourseStudyMeta('PHARMACY-Y2-S2-C04')).toEqual({
      studyYear: 2,
      term: 'SECOND',
    });
  });

  it('returns null for unknown patterns', () => {
    expect(parseCourseStudyMeta('CS101')).toBeNull();
  });
});
