import { describe, expect, it } from 'vitest';
import { formatFacultyCourseConflictMessage } from './faculty-courses.js';

describe('formatFacultyCourseConflictMessage', () => {
  it('lists each conflicting course and assigned faculty', () => {
    const msg = formatFacultyCourseConflictMessage([
      {
        courseId: 'c1',
        courseCode: 'INFO_ENG-Y1-S1-C01',
        courseName: 'Programming',
        facultyId: 'f1',
        facultyName: 'Dr. Ali',
        facultyEmail: 'ali@university.edu',
        semester: 'Fall 2025',
        academicYear: '2025-2026',
      },
    ]);
    expect(msg).toContain('Programming');
    expect(msg).toContain('INFO_ENG-Y1-S1-C01');
    expect(msg).toContain('Dr. Ali');
  });
});
