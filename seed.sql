-- 초기 관리자 계정 생성 (비밀번호: admin123)
-- 실제 운영 환경에서는 반드시 해시된 비밀번호 사용 필요
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('admin', 'admin123', 'admin@school.com', '시스템 관리자', 'super_admin', '010-1234-5678');

-- 테스트 학기 생성
INSERT OR IGNORE INTO semesters (name, year, semester, start_date, end_date, is_current) VALUES 
  ('2024학년도 1학기', 2024, 1, '2024-03-01', '2024-08-31', 1),
  ('2024학년도 2학기', 2024, 2, '2024-09-01', '2025-02-28', 0);

-- 테스트 과목 생성
INSERT OR IGNORE INTO subjects (name, code, description, credits, subject_type) VALUES 
  ('국어', 'KOR001', '국어 교과', 3, 'required'),
  ('영어', 'ENG001', '영어 교과', 3, 'required'),
  ('수학', 'MAT001', '수학 교과', 3, 'required'),
  ('과학', 'SCI001', '과학 교과', 2, 'required'),
  ('사회', 'SOC001', '사회 교과', 2, 'required'),
  ('음악', 'MUS001', '음악 교과', 1, 'elective'),
  ('미술', 'ART001', '미술 교과', 1, 'elective'),
  ('체육', 'PE001', '체육 교과', 2, 'elective');

-- 테스트 교사 계정 (비밀번호: teacher123)
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('teacher1', 'teacher123', 'teacher1@school.com', '김선생', 'teacher', '010-2345-6789'),
  ('teacher2', 'teacher123', 'teacher2@school.com', '이선생', 'teacher', '010-3456-7890');

INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) VALUES 
  (2, 'T2024001', '국어', '2024-03-01', '담임교사', '국어과'),
  (3, 'T2024002', '수학', '2024-03-01', '교사', '수학과');

-- 테스트 반 생성
INSERT OR IGNORE INTO classes (name, grade, semester_id, homeroom_teacher_id, room_number, max_students) VALUES 
  ('1학년 1반', 1, 1, 1, '101', 25),
  ('1학년 2반', 1, 1, 2, '102', 25),
  ('2학년 1반', 2, 1, 1, '201', 25);

-- 테스트 학생 계정 (비밀번호: student123)
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('student1', 'student123', 'student1@school.com', '박학생', 'student', '010-4567-8901'),
  ('student2', 'student123', 'student2@school.com', '최학생', 'student', '010-5678-9012');

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) VALUES 
  (4, 'S2024001', 1, 1, '2024-03-01', 'enrolled', '서울시 강남구', '010-1111-2222'),
  (5, 'S2024002', 1, 1, '2024-03-01', 'enrolled', '서울시 서초구', '010-2222-3333');

-- 학생 반 배정 이력 (student_class_history)
INSERT OR IGNORE INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES 
  (1, 1, 1, '2024-03-01', 1),
  (2, 1, 1, '2024-03-01', 1);

-- 테스트 학부모 계정 (비밀번호: parent123)
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('parent1', 'parent123', 'parent1@school.com', '박부모', 'parent', '010-6789-0123');

INSERT OR IGNORE INTO parent_student (parent_user_id, student_id, relationship, is_primary) VALUES 
  (6, 1, '부', 1);

-- 테스트 수업 생성
INSERT OR IGNORE INTO courses (subject_id, semester_id, teacher_id, class_id, course_name, schedule) VALUES 
  (1, 1, 1, 1, '1학년 1반 국어', '월,수,금 1교시'),
  (3, 1, 2, 1, '1학년 1반 수학', '화,목 1,2교시');

-- 테스트 동아리 생성
INSERT OR IGNORE INTO clubs (name, description, advisor_teacher_id, semester_id, max_members) VALUES 
  ('코딩 동아리', '프로그래밍과 코딩을 배우는 동아리', 2, 1, 20),
  ('음악 동아리', '다양한 악기를 연주하는 동아리', 1, 1, 15);
