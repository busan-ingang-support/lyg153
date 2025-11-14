-- Step 1: 사용자 및 기본 정보 생성

-- 1. 추가 교사 생성 (8명)
INSERT INTO users (username, password_hash, name, email, phone, role) VALUES
  ('teacher3', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '박철수', 'teacher3@school.com', '010-3333-3333', 'teacher'),
  ('teacher4', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '최지은', 'teacher4@school.com', '010-4444-4444', 'teacher'),
  ('teacher5', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '정민수', 'teacher5@school.com', '010-5555-5555', 'teacher'),
  ('teacher6', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '강서연', 'teacher6@school.com', '010-6666-6666', 'teacher'),
  ('teacher7', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '한지훈', 'teacher7@school.com', '010-7777-7777', 'teacher'),
  ('teacher8', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '윤서아', 'teacher8@school.com', '010-8888-8888', 'teacher'),
  ('teacher9', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '조민재', 'teacher9@school.com', '010-9999-9999', 'teacher'),
  ('teacher10', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '임수빈', 'teacher10@school.com', '010-1010-1010', 'teacher');

INSERT INTO teachers (user_id, teacher_number, subject, hire_date, position, department) VALUES
  ((SELECT id FROM users WHERE username = 'teacher3'), 'T2024003', '수학', '2019-03-01', '교사', '수학과'),
  ((SELECT id FROM users WHERE username = 'teacher4'), 'T2024004', '과학', '2021-03-01', '교사', '과학과'),
  ((SELECT id FROM users WHERE username = 'teacher5'), 'T2024005', '사회', '2018-03-01', '교사', '사회과'),
  ((SELECT id FROM users WHERE username = 'teacher6'), 'T2024006', '음악', '2020-03-01', '교사', '예체능과'),
  ((SELECT id FROM users WHERE username = 'teacher7'), 'T2024007', '미술', '2019-03-01', '교사', '예체능과'),
  ((SELECT id FROM users WHERE username = 'teacher8'), 'T2024008', '체육', '2021-03-01', '교사', '예체능과'),
  ((SELECT id FROM users WHERE username = 'teacher9'), 'T2024009', '기술', '2022-03-01', '교사', '기술가정과'),
  ((SELECT id FROM users WHERE username = 'teacher10'), 'T2024010', '가정', '2020-03-01', '교사', '기술가정과');

-- 2. 추가 학생 생성 (48명)
INSERT INTO users (username, password_hash, name, email, phone, role) VALUES
  ('student3', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '김민준', 'student3@school.com', '010-1003-0001', 'student'),
  ('student4', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '이서윤', 'student4@school.com', '010-1004-0001', 'student'),
  ('student5', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '박지우', 'student5@school.com', '010-1005-0001', 'student'),
  ('student6', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '최하은', 'student6@school.com', '010-1006-0001', 'student'),
  ('student7', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '정도윤', 'student7@school.com', '010-1007-0001', 'student'),
  ('student8', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '강예준', 'student8@school.com', '010-1008-0001', 'student'),
  ('student9', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '한서아', 'student9@school.com', '010-1009-0001', 'student'),
  ('student10', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '윤시우', 'student10@school.com', '010-1010-0001', 'student'),
  ('student11', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '조하린', 'student11@school.com', '010-1011-0001', 'student'),
  ('student12', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '임준서', 'student12@school.com', '010-1012-0001', 'student'),
  ('student13', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '서아인', 'student13@school.com', '010-1013-0001', 'student'),
  ('student14', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '오지훈', 'student14@school.com', '010-1014-0001', 'student'),
  ('student15', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '신다은', 'student15@school.com', '010-1015-0001', 'student'),
  ('student16', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '배수민', 'student16@school.com', '010-1016-0001', 'student'),
  ('student17', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '송재원', 'student17@school.com', '010-1017-0001', 'student'),
  ('student18', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '노예린', 'student18@school.com', '010-1018-0001', 'student'),
  ('student19', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '홍시온', 'student19@school.com', '010-1019-0001', 'student'),
  ('student20', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '황채원', 'student20@school.com', '010-1020-0001', 'student'),
  ('student21', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '차민서', 'student21@school.com', '010-1021-0001', 'student'),
  ('student22', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '구하준', 'student22@school.com', '010-1022-0001', 'student'),
  ('student23', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '남소율', 'student23@school.com', '010-1023-0001', 'student'),
  ('student24', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '탁예준', 'student24@school.com', '010-1024-0001', 'student'),
  ('student25', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '문지후', 'student25@school.com', '010-1025-0001', 'student'),
  ('student26', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '진서윤', 'student26@school.com', '010-1026-0001', 'student'),
  ('student27', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '유하율', 'student27@school.com', '010-1027-0001', 'student'),
  ('student28', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '엄서준', 'student28@school.com', '010-1028-0001', 'student'),
  ('student29', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '피수아', 'student29@school.com', '010-1029-0001', 'student'),
  ('student30', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '감지안', 'student30@school.com', '010-1030-0001', 'student'),
  ('student31', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '선민재', 'student31@school.com', '010-1031-0001', 'student'),
  ('student32', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '설서연', 'student32@school.com', '010-1032-0001', 'student'),
  ('student33', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '권도현', 'student33@school.com', '010-1033-0001', 'student'),
  ('student34', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '방채은', 'student34@school.com', '010-1034-0001', 'student'),
  ('student35', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '하윤우', 'student35@school.com', '010-1035-0001', 'student'),
  ('student36', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '곽다인', 'student36@school.com', '010-1036-0001', 'student'),
  ('student37', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '변시후', 'student37@school.com', '010-1037-0001', 'student'),
  ('student38', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '제은우', 'student38@school.com', '010-1038-0001', 'student'),
  ('student39', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '모지원', 'student39@school.com', '010-1039-0001', 'student'),
  ('student40', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '석하린', 'student40@school.com', '010-1040-0001', 'student'),
  ('student41', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '전도훈', 'student41@school.com', '010-1041-0001', 'student'),
  ('student42', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '편서하', 'student42@school.com', '010-1042-0001', 'student'),
  ('student43', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '부준혁', 'student43@school.com', '010-1043-0001', 'student'),
  ('student44', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '여은서', 'student44@school.com', '010-1044-0001', 'student'),
  ('student45', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '견시원', 'student45@school.com', '010-1045-0001', 'student'),
  ('student46', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '증지율', 'student46@school.com', '010-1046-0001', 'student'),
  ('student47', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '선우진', 'student47@school.com', '010-1047-0001', 'student'),
  ('student48', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '황보수', 'student48@school.com', '010-1048-0001', 'student'),
  ('student49', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '남궁아', 'student49@school.com', '010-1049-0001', 'student'),
  ('student50', '$2a$10$rH3pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '독고준', 'student50@school.com', '010-1050-0001', 'student');

-- 학생 상세 정보 (S2024003부터 시작)
INSERT INTO students (user_id, student_number, grade, admission_date, status) 
SELECT id, 'S2024' || SUBSTR('000' || (ROW_NUMBER() OVER (ORDER BY id) + 2), -3), 
       CASE WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 1 THEN 1
            WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 2 THEN 2
            ELSE 3 END,
       '2024-03-01', 'enrolled'
FROM users 
WHERE username LIKE 'student%' AND id NOT IN (SELECT user_id FROM students);
