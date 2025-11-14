-- 전체 더미 데이터 생성 스크립트

-- 1. 추가 교사 생성 (8명 추가 - teacher2는 이미 존재)
INSERT INTO users (username, password_hash, name, email, phone, role) VALUES
  ('teacher3', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '박철수', 'teacher3@school.com', '010-3333-3333', 'teacher'),
  ('teacher4', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '최지은', 'teacher4@school.com', '010-4444-4444', 'teacher'),
  ('teacher5', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '정민수', 'teacher5@school.com', '010-5555-5555', 'teacher'),
  ('teacher6', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '강서연', 'teacher6@school.com', '010-6666-6666', 'teacher'),
  ('teacher7', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '한지훈', 'teacher7@school.com', '010-7777-7777', 'teacher'),
  ('teacher8', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '윤서아', 'teacher8@school.com', '010-8888-8888', 'teacher'),
  ('teacher9', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '조민재', 'teacher9@school.com', '010-9999-9999', 'teacher'),
  ('teacher10', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '임수빈', 'teacher10@school.com', '010-1010-1010', 'teacher');

INSERT INTO teachers (user_id, teacher_number, subject, hire_date, position, department) VALUES
  ((SELECT id FROM users WHERE username = 'teacher3'), 'T2024003', '수학', '2019-03-01', '교사', '수학과'),
  ((SELECT id FROM users WHERE username = 'teacher4'), 'T2024004', '과학', '2021-03-01', '교사', '과학과'),
  ((SELECT id FROM users WHERE username = 'teacher5'), 'T2024005', '사회', '2018-03-01', '교사', '사회과'),
  ((SELECT id FROM users WHERE username = 'teacher6'), 'T2024006', '음악', '2020-03-01', '교사', '예체능과'),
  ((SELECT id FROM users WHERE username = 'teacher7'), 'T2024007', '미술', '2019-03-01', '교사', '예체능과'),
  ((SELECT id FROM users WHERE username = 'teacher8'), 'T2024008', '체육', '2021-03-01', '교사', '예체능과'),
  ((SELECT id FROM users WHERE username = 'teacher9'), 'T2024009', '기술', '2022-03-01', '교사', '기술가정과'),
  ((SELECT id FROM users WHERE username = 'teacher10'), 'T2024010', '가정', '2020-03-01', '교사', '기술가정과');

-- 2. 추가 학생 생성 (48명 - student1, student2는 이미 존재)
INSERT INTO users (username, password_hash, name, email, phone, role) VALUES
  ('student3', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '김민준', 'student3@school.com', '010-1003-0001', 'student'),
  ('student4', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '이서윤', 'student4@school.com', '010-1004-0001', 'student'),
  ('student5', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '박지우', 'student5@school.com', '010-1005-0001', 'student'),
  ('student6', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '최하은', 'student6@school.com', '010-1006-0001', 'student'),
  ('student7', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '정도윤', 'student7@school.com', '010-1007-0001', 'student'),
  ('student8', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '강예준', 'student8@school.com', '010-1008-0001', 'student'),
  ('student9', '$2a$10$rH3pYJKQZ9pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '한서아', 'student9@school.com', '010-1009-0001', 'student'),
  ('student10', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '윤시우', 'student10@school.com', '010-1010-0001', 'student'),
  ('student11', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '조하린', 'student11@school.com', '010-1011-0001', 'student'),
  ('student12', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '임준서', 'student12@school.com', '010-1012-0001', 'student'),
  ('student13', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '서아인', 'student13@school.com', '010-1013-0001', 'student'),
  ('student14', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '오지훈', 'student14@school.com', '010-1014-0001', 'student'),
  ('student15', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '신다은', 'student15@school.com', '010-1015-0001', 'student'),
  ('student16', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '배수민', 'student16@school.com', '010-1016-0001', 'student'),
  ('student17', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '송재원', 'student17@school.com', '010-1017-0001', 'student'),
  ('student18', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '노예린', 'student18@school.com', '010-1018-0001', 'student'),
  ('student19', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '홍시온', 'student19@school.com', '010-1019-0001', 'student'),
  ('student20', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '황채원', 'student20@school.com', '010-1020-0001', 'student'),
  ('student21', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '차민서', 'student21@school.com', '010-1021-0001', 'student'),
  ('student22', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '구하준', 'student22@school.com', '010-1022-0001', 'student'),
  ('student23', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '남소율', 'student23@school.com', '010-1023-0001', 'student'),
  ('student24', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '탁예준', 'student24@school.com', '010-1024-0001', 'student'),
  ('student25', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '문지후', 'student25@school.com', '010-1025-0001', 'student'),
  ('student26', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '진서윤', 'student26@school.com', '010-1026-0001', 'student'),
  ('student27', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '유하율', 'student27@school.com', '010-1027-0001', 'student'),
  ('student28', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '엄서준', 'student28@school.com', '010-1028-0001', 'student'),
  ('student29', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '피수아', 'student29@school.com', '010-1029-0001', 'student'),
  ('student30', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '감지안', 'student30@school.com', '010-1030-0001', 'student'),
  ('student31', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '선민재', 'student31@school.com', '010-1031-0001', 'student'),
  ('student32', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '설서연', 'student32@school.com', '010-1032-0001', 'student'),
  ('student33', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '권도현', 'student33@school.com', '010-1033-0001', 'student'),
  ('student34', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '방채은', 'student34@school.com', '010-1034-0001', 'student'),
  ('student35', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '하윤우', 'student35@school.com', '010-1035-0001', 'student'),
  ('student36', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '곽다인', 'student36@school.com', '010-1036-0001', 'student'),
  ('student37', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '변시후', 'student37@school.com', '010-1037-0001', 'student'),
  ('student38', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '제은우', 'student38@school.com', '010-1038-0001', 'student'),
  ('student39', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '모지원', 'student39@school.com', '010-1039-0001', 'student'),
  ('student40', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '석하린', 'student40@school.com', '010-1040-0001', 'student'),
  ('student41', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '전도훈', 'student41@school.com', '010-1041-0001', 'student'),
  ('student42', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '편서하', 'student42@school.com', '010-1042-0001', 'student'),
  ('student43', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '부준혁', 'student43@school.com', '010-1043-0001', 'student'),
  ('student44', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '여은서', 'student44@school.com', '010-1044-0001', 'student'),
  ('student45', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '견시원', 'student45@school.com', '010-1045-0001', 'student'),
  ('student46', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '증지율', 'student46@school.com', '010-1046-0001', 'student'),
  ('student47', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '선우진', 'student47@school.com', '010-1047-0001', 'student'),
  ('student48', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '황보수', 'student48@school.com', '010-1048-0001', 'student'),
  ('student49', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '남궁아', 'student49@school.com', '010-1049-0001', 'student'),
  ('student50', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '독고준', 'student50@school.com', '010-1050-0001', 'student'),
  ('student51', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '사공은', 'student51@school.com', '010-1051-0001', 'student'),
  ('student52', '$2a$10$rH3pYJKQZ9pYJKOHGt7aP.JQk3pYJKQZ9pYJKQZ9pYJKQZ', '황지호', 'student52@school.com', '010-1052-0001', 'student');

-- 학생 상세 정보 (S2024003부터 시작 - 001, 002는 이미 존재)
INSERT INTO students (user_id, student_number, grade, admission_date, status) 
SELECT id, 'S2024' || SUBSTR('000' || (ROW_NUMBER() OVER (ORDER BY id) + 2), -3), 
       CASE WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 1 THEN 1
            WHEN ROW_NUMBER() OVER (ORDER BY id) % 3 = 2 THEN 2
            ELSE 3 END,
       '2024-03-01', 'enrolled'
FROM users 
WHERE username LIKE 'student%' AND id NOT IN (SELECT user_id FROM students);

-- 3. 학생 반 배정 (각 반에 3-4명씩)
-- 기존 반들에 학생 추가 배정
INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
SELECT 
  s.id,
  c.id,
  1,
  '2024-03-01',
  1
FROM students s
CROSS JOIN classes c
WHERE s.student_number IN ('S2024003', 'S2024004', 'S2024005') AND c.name = '1학년 1반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024006', 'S2024007', 'S2024008') AND c.name = '1학년 2반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024009', 'S2024010', 'S2024011') AND c.name = '1학년 3반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024012', 'S2024013', 'S2024014') AND c.name = '1학년 4반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024015', 'S2024016', 'S2024017') AND c.name = '1학년 5반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024018', 'S2024019', 'S2024020') AND c.name = '1학년 6반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024021', 'S2024022', 'S2024023') AND c.name = '2학년 2반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024024', 'S2024025', 'S2024026') AND c.name = '2학년 3반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024027', 'S2024028', 'S2024029') AND c.name = '2학년 4반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024030', 'S2024031', 'S2024032') AND c.name = '2학년 5반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024033', 'S2024034', 'S2024035') AND c.name = '3학년 2반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024036', 'S2024037', 'S2024038') AND c.name = '3학년 3반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024039', 'S2024040', 'S2024041') AND c.name = '3학년 4반'
UNION ALL
SELECT s.id, c.id, 1, '2024-03-01', 1 FROM students s, classes c WHERE s.student_number IN ('S2024042', 'S2024043', 'S2024044') AND c.name = '3학년 5반';

-- 4. 과목 생성
INSERT INTO subjects (name, code, credits, subject_type) VALUES
  ('영어', 'ENG', 3, 'required'),
  ('과학', 'SCI', 3, 'required'),
  ('사회', 'SOC', 2, 'required'),
  ('음악', 'MUS', 1, 'elective'),
  ('미술', 'ART', 1, 'elective'),
  ('체육', 'PE', 2, 'required');

-- 5. 과정(Courses) 생성
INSERT INTO courses (semester_id, subject_id, teacher_id) 
SELECT 1, subj.id, t.id
FROM subjects subj, teachers t
WHERE t.id = (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher1'))
LIMIT 1;

INSERT INTO courses (semester_id, subject_id, teacher_id)
SELECT 1, s.id, 
  CASE s.subject 
    WHEN '국어' THEN (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher1'))
    WHEN '영어' THEN (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher2'))
    WHEN '수학' THEN (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher3'))
    WHEN '과학' THEN (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher4'))
    WHEN '사회' THEN (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher5'))
    WHEN '음악' THEN (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher6'))
    ELSE (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher1'))
  END
FROM subjects s;

-- 6. 수강신청 (모든 학생이 모든 과목 수강)
INSERT INTO enrollments (student_id, course_id)
SELECT s.id, c.id
FROM students s, courses c
WHERE c.semester_id = 1
LIMIT 200;

-- 7. 출석 데이터 (최근 20일)
INSERT INTO attendance (enrollment_id, attendance_date, status, recorded_by)
SELECT 
  e.id,
  DATE('2024-11-01', '+' || (ABS(RANDOM() % 20)) || ' days'),
  CASE ABS(RANDOM() % 10)
    WHEN 0 THEN 'absent'
    WHEN 1 THEN 'late'
    WHEN 2 THEN 'excused'
    ELSE 'present'
  END,
  1
FROM enrollments e
LIMIT 500;

-- 8. 성적 데이터
INSERT INTO grades (enrollment_id, exam_type, score, exam_date, recorded_by)
SELECT 
  e.id,
  CASE ABS(RANDOM() % 4)
    WHEN 0 THEN 'midterm'
    WHEN 1 THEN 'final'
    WHEN 2 THEN 'quiz'
    ELSE 'assignment'
  END,
  50 + ABS(RANDOM() % 50),
  DATE('2024-' || SUBSTR('0' || (4 + ABS(RANDOM() % 7)), -2) || '-' || SUBSTR('0' || (1 + ABS(RANDOM() % 28)), -2)),
  1
FROM enrollments e
LIMIT 400;

-- 9. 최종 성적
INSERT INTO final_grades (enrollment_id, final_score, letter_grade, grade_points, semester_id)
SELECT 
  e.id,
  60 + ABS(RANDOM() % 40),
  CASE 
    WHEN (60 + ABS(RANDOM() % 40)) >= 90 THEN 'A'
    WHEN (60 + ABS(RANDOM() % 40)) >= 80 THEN 'B'
    WHEN (60 + ABS(RANDOM() % 40)) >= 70 THEN 'C'
    WHEN (60 + ABS(RANDOM() % 40)) >= 60 THEN 'D'
    ELSE 'F'
  END,
  CASE 
    WHEN (60 + ABS(RANDOM() % 40)) >= 90 THEN 4.0
    WHEN (60 + ABS(RANDOM() % 40)) >= 80 THEN 3.0
    WHEN (60 + ABS(RANDOM() % 40)) >= 70 THEN 2.0
    WHEN (60 + ABS(RANDOM() % 40)) >= 60 THEN 1.0
    ELSE 0.0
  END,
  1
FROM enrollments e
LIMIT 200;

-- 10. 상담 기록
INSERT INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, content, follow_up, parent_notified)
SELECT 
  s.id,
  (SELECT id FROM users WHERE username = 'teacher1'),
  DATE('2024-' || SUBSTR('0' || (4 + ABS(RANDOM() % 7)), -2) || '-' || SUBSTR('0' || (1 + ABS(RANDOM() % 28)), -2)),
  CASE ABS(RANDOM() % 6)
    WHEN 0 THEN 'academic'
    WHEN 1 THEN 'career'
    WHEN 2 THEN 'personal'
    WHEN 3 THEN 'behavioral'
    WHEN 4 THEN 'family'
    ELSE 'other'
  END,
  '학생과의 상담 내용입니다. 전반적인 학교 생활 적응도를 확인하였습니다.',
  CASE ABS(RANDOM() % 3)
    WHEN 0 THEN '추가 상담 필요'
    WHEN 1 THEN '지속적 관찰'
    ELSE '완료'
  END,
  ABS(RANDOM() % 2)
FROM students s
WHERE s.id <= (SELECT MAX(id) FROM students WHERE student_number LIKE 'S2024%')
LIMIT 30;

-- 11. 봉사활동
INSERT INTO volunteer_activities (student_id, activity_name, organization, hours, activity_date, category, approval_status, approved_by)
SELECT 
  s.id,
  CASE ABS(RANDOM() % 5)
    WHEN 0 THEN '지역 도서관 봉사'
    WHEN 1 THEN '환경 정화 활동'
    WHEN 2 THEN '노인복지관 봉사'
    WHEN 3 THEN '동물보호센터 봉사'
    ELSE '학교 행사 도움'
  END,
  CASE ABS(RANDOM() % 5)
    WHEN 0 THEN '시립도서관'
    WHEN 1 THEN '환경보호협회'
    WHEN 2 THEN '실버타운'
    WHEN 3 THEN '유기동물센터'
    ELSE '학교'
  END,
  2 + ABS(RANDOM() % 6),
  DATE('2024-' || SUBSTR('0' || (4 + ABS(RANDOM() % 7)), -2) || '-' || SUBSTR('0' || (1 + ABS(RANDOM() % 28)), -2)),
  CASE ABS(RANDOM() % 4)
    WHEN 0 THEN 'community'
    WHEN 1 THEN 'environment'
    WHEN 2 THEN 'education'
    ELSE 'welfare'
  END,
  CASE ABS(RANDOM() % 3)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    ELSE 'rejected'
  END,
  CASE WHEN ABS(RANDOM() % 3) = 1 THEN 1 ELSE NULL END
FROM students s
WHERE s.id <= (SELECT MAX(id) FROM students WHERE student_number LIKE 'S2024%')
LIMIT 50;

-- 12. 동아리
INSERT INTO clubs (name, description, advisor_teacher_id, semester_id, max_members) VALUES
  ('코딩 동아리', '프로그래밍과 알고리즘 학습', (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher2')), 1, 20),
  ('미술 동아리', '다양한 미술 활동', (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher3')), 1, 15),
  ('음악 동아리', '악기 연주와 합주', (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher6')), 1, 20),
  ('축구 동아리', '축구 경기 및 연습', (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE username = 'teacher8')), 1, 25);

-- 동아리 회원
INSERT INTO club_members (club_id, student_id, join_date, role)
SELECT 
  c.id,
  s.id,
  '2024-03-15',
  CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY s.id) = 1 THEN 'president'
       WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY s.id) = 2 THEN 'vice_president'
       ELSE 'member'
  END
FROM clubs c
CROSS JOIN (SELECT * FROM students WHERE student_number LIKE 'S2024%' ORDER BY RANDOM() LIMIT 15) s
LIMIT 50;

-- 동아리 활동 기록
INSERT INTO club_activities (club_id, activity_date, activity_name, description, recorded_by)
SELECT 
  c.id,
  DATE('2024-' || SUBSTR('0' || (4 + ABS(RANDOM() % 7)), -2) || '-' || SUBSTR('0' || (1 + ABS(RANDOM() % 28)), -2)),
  '정기 활동',
  '동아리 정기 모임 및 활동',
  1
FROM clubs c;

-- 13. 생활기록부 특별 기록
INSERT INTO student_records (student_id, record_type, record_date, title, content, recorded_by)
SELECT 
  s.id,
  CASE ABS(RANDOM() % 4)
    WHEN 0 THEN 'award'
    WHEN 1 THEN 'behavior'
    WHEN 2 THEN 'special'
    ELSE 'health'
  END,
  DATE('2024-' || SUBSTR('0' || (4 + ABS(RANDOM() % 7)), -2) || '-' || SUBSTR('0' || (1 + ABS(RANDOM() % 28)), -2)),
  CASE ABS(RANDOM() % 4)
    WHEN 0 THEN '모범상 수상'
    WHEN 1 THEN '학교 규칙 준수'
    WHEN 2 THEN '특별 활동 참여'
    ELSE '건강검진 완료'
  END,
  '해당 학생의 우수한 행동 및 활동에 대한 기록입니다.',
  1
FROM students s
WHERE s.student_number LIKE 'S2024%'
LIMIT 20;
