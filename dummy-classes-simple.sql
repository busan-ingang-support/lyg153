-- 더미 반 데이터만 추가 (학생 배정 없이)

-- 추가 반 생성
INSERT INTO classes (name, grade, semester_id, room_number, max_students) VALUES
  ('1학년 3반', 1, 1, '103', 30),
  ('1학년 4반', 1, 1, '104', 30),
  ('1학년 5반', 1, 1, '105', 30),
  ('2학년 2반', 2, 1, '202', 30),
  ('2학년 3반', 2, 1, '203', 30),
  ('2학년 4반', 2, 1, '204', 30),
  ('3학년 2반', 3, 1, '302', 30),
  ('3학년 3반', 3, 1, '303', 30),
  ('3학년 4반', 3, 1, '304', 30),
  ('1학년 6반', 1, 1, '106', 30),
  ('2학년 5반', 2, 1, '205', 30),
  ('3학년 5반', 3, 1, '305', 30);

-- 담임 배정 (기존 teacher1 사용)
UPDATE classes 
SET homeroom_teacher_id = (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher1'))
WHERE name IN ('1학년 3반', '2학년 2반', '3학년 2반', '1학년 4반', '2학년 3반', '3학년 3반');
