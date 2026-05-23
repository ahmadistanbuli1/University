import { describe, expect, it } from 'vitest';
import { buildTranscriptPdfData } from './transcript-data.js';

describe('buildTranscriptPdfData', () => {
  it('builds rows and GPA from curriculum grades', () => {
    const data = buildTranscriptPdfData({
      academicNumber: 'STU-001',
      academicYear: '2025-2026',
      currentSemester: 7,
      user: { name: 'Test Student' },
      department: {
        name: 'Information Engineering',
        college: { name: 'College of Information Engineering' },
      },
      curriculumGrades: [
        {
          practicalScore: { toString: () => '32' },
          theoryScore: { toString: () => '48' },
          curriculumCourse: {
            studyYear: 1,
            term: 'FIRST',
            name: 'Programming',
            sortOrder: 0,
          },
        },
        {
          practicalScore: { toString: () => '35' },
          theoryScore: { toString: () => '55' },
          curriculumCourse: {
            studyYear: 1,
            term: 'SECOND',
            name: 'OOP',
            sortOrder: 0,
          },
        },
      ],
    });

    expect(data.rows).toHaveLength(2);
    expect(data.rows[0]!.total).toBe(80);
    expect(data.rows[0]!.status).toBe('Pass');
    expect(data.gpa).toBe(85);
    expect(data.universityName).toContain('SPU');
  });
});
