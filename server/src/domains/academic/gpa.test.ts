import { describe, expect, it } from 'vitest';
import { computeGpaFromLatestAttempts } from './gpa.js';

describe('computeGpaFromLatestAttempts', () => {
  it('uses highest attempt score per faculty course', () => {
    const gpa = computeGpaFromLatestAttempts([
      { facultyCourseId: 'a', attemptNumber: 1, score: { toString: () => '60' } },
      { facultyCourseId: 'a', attemptNumber: 2, score: { toString: () => '80' } },
      { facultyCourseId: 'b', attemptNumber: 1, score: { toString: () => '90' } },
    ]);
    expect(gpa).toBe(85);
  });

  it('returns 0 for empty input', () => {
    expect(computeGpaFromLatestAttempts([])).toBe(0);
  });
});
