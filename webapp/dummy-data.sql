-- 더미 데이터 생성 스크립트

-- 1. 추가 학기 생성 (2023학년도만 추가, 2024학년도는 이미 존재)
INSERT INTO semesters (name, year, semester, start_date, end_date, is_current) 
VALUES 
  ('2023학년도 1학기', 2023, 1, '2023-03-01', '2023-08-31', 0),
  ('2023학년도 2학기', 2023, 2, '2023-09-01', '2024-02-29', 0);

-- 2. 추가 교사 생성 (10명)
INSERT INTO users (username, password_hash, name, email, phone, role) VALUES
  ('teacher2', 'teacher123', '이순신', 'teacher2@school.com', '010-2222-2222', 'teacher'),
  ('teacher3', 'teacher123', '김유신', 'teacher3@school.com', '010-3333-3333', 'teacher'),
  ('teacher4', 'teacher123', '강감찬', 'teacher4@school.com', '010-4444-4444', 'teacher'),
  ('teacher5', 'teacher123', '을지문덕', 'teacher5@school.com', '010-5555-5555', 'teacher'),
  ('teacher6', 'teacher123', '세종대왕', 'teacher6@school.com', '010-6666-6666', 'teacher'),
  ('teacher7', 'teacher123', '정약용', 'teacher7@school.com', '010-7777-7777', 'teacher'),
  ('teacher8', 'teacher123', '안중근', 'teacher8@school.com', '010-8888-8888', 'teacher'),
  ('teacher9', 'teacher123', '윤봉길', 'teacher9@school.com', '010-9999-9999', 'teacher'),
  ('teacher10', 'teacher123', '유관순', 'teacher10@school.com', '010-1010-1010', 'teacher');

-- 교사 상세 정보 추가
INSERT INTO teachers (user_id, subject, hire_date) VALUES
  ((SELECT id FROM users WHERE username = 'teacher2'), '영어', '2020-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher3'), '수학', '2019-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher4'), '과학', '2021-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher5'), '사회', '2018-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher6'), '음악', '2020-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher7'), '미술', '2019-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher8'), '체육', '2021-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher9'), '기술', '2022-03-01'),
  ((SELECT id FROM users WHERE username = 'teacher10'), '가정', '2020-03-01');

-- 3. 추가 학생 생성 (30명)
INSERT INTO users (username, password_hash, name, email, phone, role) VALUES
  ('student3', 'student123', '김철수', 'student3@school.com', '010-1111-3333', 'student'),
  ('student4', 'student123', '이영희', 'student4@school.com', '010-1111-4444', 'student'),
  ('student5', 'student123', '박민수', 'student5@school.com', '010-1111-5555', 'student'),
  ('student6', 'student123', '최지은', 'student6@school.com', '010-1111-6666', 'student'),
  ('student7', 'student123', '정우진', 'student7@school.com', '010-1111-7777', 'student'),
  ('student8', 'student123', '강서연', 'student8@school.com', '010-1111-8888', 'student'),
  ('student9', 'student123', '한지훈', 'student9@school.com', '010-1111-9999', 'student'),
  ('student10', 'student123', '윤서아', 'student10@school.com', '010-1111-1010', 'student'),
  ('student11', 'student123', '조민재', 'student11@school.com', '010-1111-1111', 'student'),
  ('student12', 'student123', '임수빈', 'student12@school.com', '010-1111-1212', 'student'),
  ('student13', 'student123', '서준호', 'student13@school.com', '010-2222-1313', 'student'),
  ('student14', 'student123', '오하은', 'student14@school.com', '010-2222-1414', 'student'),
  ('student15', 'student123', '신동욱', 'student15@school.com', '010-2222-1515', 'student'),
  ('student16', 'student123', '배수진', 'student16@school.com', '010-2222-1616', 'student'),
  ('student17', 'student123', '송현우', 'student17@school.com', '010-2222-1717', 'student'),
  ('student18', 'student123', '노예린', 'student18@school.com', '010-2222-1818', 'student'),
  ('student19', 'student123', '홍지우', 'student19@school.com', '010-2222-1919', 'student'),
  ('student20', 'student123', '황민서', 'student20@school.com', '010-2222-2020', 'student'),
  ('student21', 'student123', '차예준', 'student21@school.com', '010-3333-2121', 'student'),
  ('student22', 'student123', '구하린', 'student22@school.com', '010-3333-2222', 'student'),
  ('student23', 'student123', '남도윤', 'student23@school.com', '010-3333-2323', 'student'),
  ('student24', 'student123', '탁서윤', 'student24@school.com', '010-3333-2424', 'student'),
  ('student25', 'student123', '문재원', 'student25@school.com', '010-3333-2525', 'student'),
  ('student26', 'student123', '진소율', 'student26@school.com', '010-3333-2626', 'student'),
  ('student27', 'student123', '유민준', 'student27@school.com', '010-3333-2727', 'student'),
  ('student28', 'student123', '엄채원', 'student28@school.com', '010-3333-2828', 'student'),
  ('student29', 'student123', '피지호', 'student29@school.com', '010-3333-2929', 'student'),
  ('student30', 'student123', '감다은', 'student30@school.com', '010-3333-3030', 'student'),
  ('student31', 'student123', '선준서', 'student31@school.com', '010-4444-3131', 'student'),
  ('student32', 'student123', '설아인', 'student32@school.com', '010-4444-3232', 'student');

-- 학생 상세 정보 추가
INSERT INTO students (user_id, student_number, grade, enrollment_date, status) VALUES
  ((SELECT id FROM users WHERE username = 'student3'), 'S2024003', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student4'), 'S2024004', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student5'), 'S2024005', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student6'), 'S2024006', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student7'), 'S2024007', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student8'), 'S2024008', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student9'), 'S2024009', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student10'), 'S2024010', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student11'), 'S2024011', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student12'), 'S2024012', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student13'), 'S2024013', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student14'), 'S2024014', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student15'), 'S2024015', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student16'), 'S2024016', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student17'), 'S2024017', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student18'), 'S2024018', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student19'), 'S2024019', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student20'), 'S2024020', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student21'), 'S2024021', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student22'), 'S2024022', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student23'), 'S2024023', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student24'), 'S2024024', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student25'), 'S2024025', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student26'), 'S2024026', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student27'), 'S2024027', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student28'), 'S2024028', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student29'), 'S2024029', 1, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student30'), 'S2024030', 2, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student31'), 'S2024031', 3, '2024-03-01', 'enrolled'),
  ((SELECT id FROM users WHERE username = 'student32'), 'S2024032', 1, '2024-03-01', 'enrolled');

-- 4. 추가 반 생성 (총 9개 반)
INSERT INTO classes (name, grade, semester_id, room_number, max_students) VALUES
  ('1학년 3반', 1, 1, '103', 30),
  ('1학년 4반', 1, 1, '104', 30),
  ('2학년 2반', 2, 1, '202', 30),
  ('2학년 3반', 2, 1, '203', 30),
  ('3학년 2반', 3, 1, '302', 30),
  ('3학년 3반', 3, 1, '303', 30);

-- 5. 담임 배정
INSERT INTO teacher_homeroom (teacher_id, class_id, semester_id, start_date) VALUES
  ((SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher2')), 
   (SELECT id FROM classes WHERE name = '1학년 3반'), 1, '2024-03-01'),
  ((SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher3')), 
   (SELECT id FROM classes WHERE name = '1학년 4반'), 1, '2024-03-01'),
  ((SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher4')), 
   (SELECT id FROM classes WHERE name = '2학년 2반'), 1, '2024-03-01'),
  ((SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher5')), 
   (SELECT id FROM classes WHERE name = '2학년 3반'), 1, '2024-03-01'),
  ((SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher6')), 
   (SELECT id FROM classes WHERE name = '3학년 2반'), 1, '2024-03-01'),
  ((SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher7')), 
   (SELECT id FROM classes WHERE name = '3학년 3반'), 1, '2024-03-01');

-- 6. 학생 반 배정
-- 1학년 1반 (기존 + 추가)
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024003'), (SELECT id FROM classes WHERE name = '1학년 1반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024004'), (SELECT id FROM classes WHERE name = '1학년 1반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024005'), (SELECT id FROM classes WHERE name = '1학년 1반'), 1, '2024-03-01', 1);

-- 1학년 2반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024006'), (SELECT id FROM classes WHERE name = '1학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024007'), (SELECT id FROM classes WHERE name = '1학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024023'), (SELECT id FROM classes WHERE name = '1학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024024'), (SELECT id FROM classes WHERE name = '1학년 2반'), 1, '2024-03-01', 1);

-- 1학년 3반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024029'), (SELECT id FROM classes WHERE name = '1학년 3반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024032'), (SELECT id FROM classes WHERE name = '1학년 3반'), 1, '2024-03-01', 1);

-- 2학년 1반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024008'), (SELECT id FROM classes WHERE name = '2학년 1반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024009'), (SELECT id FROM classes WHERE name = '2학년 1반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024010'), (SELECT id FROM classes WHERE name = '2학년 1반'), 1, '2024-03-01', 1);

-- 2학년 2반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024011'), (SELECT id FROM classes WHERE name = '2학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024012'), (SELECT id FROM classes WHERE name = '2학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024013'), (SELECT id FROM classes WHERE name = '2학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024025'), (SELECT id FROM classes WHERE name = '2학년 2반'), 1, '2024-03-01', 1);

-- 2학년 3반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024014'), (SELECT id FROM classes WHERE name = '2학년 3반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024015'), (SELECT id FROM classes WHERE name = '2학년 3반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024026'), (SELECT id FROM classes WHERE name = '2학년 3반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024030'), (SELECT id FROM classes WHERE name = '2학년 3반'), 1, '2024-03-01', 1);

-- 3학년 1반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024016'), (SELECT id FROM classes WHERE name = '3학년 1반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024017'), (SELECT id FROM classes WHERE name = '3학년 1반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024018'), (SELECT id FROM classes WHERE name = '3학년 1반'), 1, '2024-03-01', 1);

-- 3학년 2반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024019'), (SELECT id FROM classes WHERE name = '3학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024020'), (SELECT id FROM classes WHERE name = '3학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024021'), (SELECT id FROM classes WHERE name = '3학년 2반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024027'), (SELECT id FROM classes WHERE name = '3학년 2반'), 1, '2024-03-01', 1);

-- 3학년 3반
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  ((SELECT id FROM students WHERE student_number = 'S2024022'), (SELECT id FROM classes WHERE name = '3학년 3반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024028'), (SELECT id FROM classes WHERE name = '3학년 3반'), 1, '2024-03-01', 1),
  ((SELECT id FROM students WHERE student_number = 'S2024031'), (SELECT id FROM classes WHERE name = '3학년 3반'), 1, '2024-03-01', 1);
