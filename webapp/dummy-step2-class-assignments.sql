-- Step 2: 학생 반 배정

-- 간단한 방식으로 학생들을 반에 배정 (각 반에 3-4명씩)
-- 1학년 1반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024003', 'S2024004', 'S2024005') 
  AND c.name = '1학년 1반';

-- 1학년 2반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024006', 'S2024007', 'S2024008') 
  AND c.name = '1학년 2반';

-- 1학년 3반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024009', 'S2024010', 'S2024011') 
  AND c.name = '1학년 3반';

-- 1학년 4반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024012', 'S2024013', 'S2024014') 
  AND c.name = '1학년 4반';

-- 1학년 5반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024015', 'S2024016', 'S2024017') 
  AND c.name = '1학년 5반';

-- 1학년 6반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024018', 'S2024019', 'S2024020') 
  AND c.name = '1학년 6반';

-- 2학년 2반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024021', 'S2024022', 'S2024023') 
  AND c.name = '2학년 2반';

-- 2학년 3반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024024', 'S2024025', 'S2024026') 
  AND c.name = '2학년 3반';

-- 2학년 4반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024027', 'S2024028', 'S2024029') 
  AND c.name = '2학년 4반';

-- 2학년 5반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024030', 'S2024031', 'S2024032') 
  AND c.name = '2학년 5반';

-- 3학년 2반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024033', 'S2024034', 'S2024035') 
  AND c.name = '3학년 2반';

-- 3학년 3반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024036', 'S2024037', 'S2024038') 
  AND c.name = '3학년 3반';

-- 3학년 4반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024039', 'S2024040', 'S2024041') 
  AND c.name = '3학년 4반';

-- 3학년 5반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number IN ('S2024042', 'S2024043', 'S2024044') 
  AND c.name = '3학년 5반';

-- 나머지 학생들은 1학년 1반에 배정
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT s.id, c.id, 1, '2024-03-01', 1
FROM students s, classes c
WHERE s.student_number >= 'S2024045' 
  AND c.name = '1학년 1반'
  AND s.id NOT IN (SELECT student_id FROM student_class_history);
