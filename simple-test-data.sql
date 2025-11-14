-- 기본 학기 데이터
INSERT OR IGNORE INTO semesters (name, year, semester, start_date, end_date, is_current) VALUES
('2024학년도 1학기', 2024, 1, '2024-03-01', '2024-08-31', 1);

-- 관리자 계정
INSERT OR IGNORE INTO users (username, password_hash, name, email, role) VALUES
('admin', 'admin123', '관리자', 'admin@example.com', 'admin');

-- 테스트 학생 계정
INSERT OR IGNORE INTO users (username, password_hash, name, email, role) VALUES
('student1', 'student123', '김철수', 'student1@example.com', 'student'),
('student2', 'student123', '이영희', 'student2@example.com', 'student'),
('student3', 'student123', '박민수', 'student3@example.com', 'student');

-- 학생 정보 (students 테이블의 user_id는 위의 users INSERT 후 자동 생성된 ID 사용)
INSERT OR IGNORE INTO students (user_id, student_number, grade, status) VALUES
(2, '2024001', 1, 'enrolled'),
(3, '2024002', 1, 'enrolled'),
(4, '2024003', 2, 'enrolled');
