-- Normalize offering semester labels: FIRST / SECOND (from course code or legacy Spring/Fall).

UPDATE faculty_courses fc
SET semester = CASE
  WHEN c.code ~* '-S2-' THEN 'SECOND'
  WHEN c.code ~* '-S1-' THEN 'FIRST'
  ELSE fc.semester
END
FROM courses c
WHERE fc.course_id = c.id;

UPDATE faculty_courses SET semester = 'FIRST' WHERE semester ILIKE '%fall%';
UPDATE faculty_courses SET semester = 'SECOND' WHERE semester ILIKE '%spring%';

UPDATE enrollments e
SET semester = CASE
  WHEN c.code ~* '-S2-' THEN 'SECOND'
  WHEN c.code ~* '-S1-' THEN 'FIRST'
  ELSE e.semester
END
FROM courses c
WHERE e.course_id = c.id;

UPDATE enrollments SET semester = 'FIRST' WHERE semester ILIKE '%fall%';
UPDATE enrollments SET semester = 'SECOND' WHERE semester ILIKE '%spring%';

UPDATE exam_results er
SET semester = CASE
  WHEN c.code ~* '-S2-' THEN 'SECOND'
  WHEN c.code ~* '-S1-' THEN 'FIRST'
  ELSE er.semester
END
FROM faculty_courses fc
JOIN courses c ON c.id = fc.course_id
WHERE er.faculty_course_id = fc.id;

UPDATE exam_results SET semester = 'FIRST' WHERE semester ILIKE '%fall%';
UPDATE exam_results SET semester = 'SECOND' WHERE semester ILIKE '%spring%';
