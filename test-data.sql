-- 기본 학기 데이터
INSERT OR IGNORE INTO semesters (id, name, year, semester, start_date, end_date, is_current) VALUES
(1, '2024학년도 1학기', 2024, 1, '2024-03-01', '2024-08-31', 1);

-- 관리자 계정
INSERT OR IGNORE INTO users (id, username, password_hash, name, email, role) VALUES
(1, 'admin', 'admin123', '관리자', 'admin@example.com', 'admin');

-- 테스트 학생 계정
INSERT OR IGNORE INTO users (id, username, password_hash, name, email, role) VALUES
(2, 'student1', 'student123', '김철수', 'student1@example.com', 'student'),
(3, 'student2', 'student123', '이영희', 'student2@example.com', 'student'),
(4, 'student3', 'student123', '박민수', 'student3@example.com', 'student');

-- 학생 정보
INSERT OR IGNORE INTO students (id, user_id, student_number, grade, enrollment_status) VALUES
(1, 2, '2024001', 1, 'enrolled'),
(2, 3, '2024002', 1, 'enrolled'),
(3, 4, '2024003', 2, 'enrolled');

-- 테스트 반
INSERT OR IGNORE INTO classes (id, name, grade, semester_id) VALUES
(1, '1학년 1반', 1, 1),
(2, '2학년 1반', 2, 1);

-- 반 배정
INSERT OR IGNORE INTO class_assignments (student_id, class_id, semester_id) VALUES
(1, 1, 1),
(2, 1, 1),
(3, 2, 1);
