-- 1. 학년이 맞지 않는 모든 배정 삭제
DELETE FROM student_class_history 
WHERE id IN (
    SELECT sch.id
    FROM student_class_history sch
    JOIN students s ON sch.student_id = s.id
    JOIN classes c ON sch.class_id = c.id
    WHERE s.grade != c.grade
);

-- 2. 학년별로 올바르게 재배정
-- 1학년 학생들을 1학년 반에 배정
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s
CROSS JOIN (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM classes 
    WHERE grade = 1
) c
WHERE s.grade = 1 
  AND s.id NOT IN (SELECT student_id FROM student_class_history WHERE is_active = 1)
  AND (s.id % 6) + 1 = c.rn
LIMIT 30;

-- 2학년 학생들을 2학년 반에 배정
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s
CROSS JOIN (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM classes 
    WHERE grade = 2
) c
WHERE s.grade = 2 
  AND s.id NOT IN (SELECT student_id FROM student_class_history WHERE is_active = 1)
  AND (s.id % 5) + 1 = c.rn
LIMIT 30;

-- 3학년 학생들을 3학년 반에 배정
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s
CROSS JOIN (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM classes 
    WHERE grade = 3
) c
WHERE s.grade = 3 
  AND s.id NOT IN (SELECT student_id FROM student_class_history WHERE is_active = 1)
  AND (s.id % 4) + 1 = c.rn
LIMIT 30;
