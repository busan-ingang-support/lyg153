-- 더미 반 데이터만 추가 (기존 교사와 학기 사용)

-- 추가 반 생성 (총 6개 추가)
INSERT INTO classes (name, grade, semester_id, room_number, max_students) VALUES
  ('1학년 3반', 1, 1, '103', 30),
  ('1학년 4반', 1, 1, '104', 30),
  ('2학년 2반', 2, 1, '202', 30),
  ('2학년 3반', 2, 1, '203', 30),
  ('3학년 2반', 3, 1, '302', 30),
  ('3학년 3반', 3, 1, '303', 30);

-- 담임 배정 (기존 teacher1만 사용)
UPDATE classes SET homeroom_teacher_id = (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher1'))
WHERE name IN ('1학년 3반', '2학년 2반', '3학년 2반');

-- 학생 반 배정 (기존 student1, student2만 분산)
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) 
SELECT 
  (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE username = 'student1')),
  id,
  1,
  '2024-03-01',
  1
FROM classes WHERE name = '1학년 3반';

INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) 
SELECT 
  (SELECT id FROM students WHERE user_id = (SELECT id FROM users WHERE username = 'student2')),
  id,
  1,
  '2024-03-01',
  1
FROM classes WHERE name = '2학년 2반';
