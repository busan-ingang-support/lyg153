-- 학생 계정 추가
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('student4', 'student123', 'student4@school.com', '이서연', 'student', '010-1111-0004'),
  ('student5', 'student123', 'student5@school.com', '박지훈', 'student', '010-1111-0005'),
  ('student6', 'student123', 'student6@school.com', '최수빈', 'student', '010-1111-0006'),
  ('student7', 'student123', 'student7@school.com', '정예준', 'student', '010-2222-0001'),
  ('student8', 'student123', 'student8@school.com', '강민서', 'student', '010-2222-0002'),
  ('student9', 'student123', 'student9@school.com', '조하준', 'student', '010-2222-0003'),
  ('student10', 'student123', 'student10@school.com', '윤지아', 'student', '010-2222-0004'),
  ('student11', 'student123', 'student11@school.com', '임도현', 'student', '010-2222-0005'),
  ('student12', 'student123', 'student12@school.com', '한지호', 'student', '010-3333-0001'),
  ('student13', 'student123', 'student13@school.com', '서윤아', 'student', '010-3333-0002'),
  ('student14', 'student123', 'student14@school.com', '오승우', 'student', '010-3333-0003'),
  ('student15', 'student123', 'student15@school.com', '배소영', 'student', '010-3333-0004');

-- 교사 계정 추가
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('teacher3', 'teacher123', 'teacher3@school.com', '박선생', 'teacher', '010-4567-1111'),
  ('teacher4', 'teacher123', 'teacher4@school.com', '정선생', 'teacher', '010-5678-2222'),
  ('teacher5', 'teacher123', 'teacher5@school.com', '한선생', 'teacher', '010-6789-3333');

