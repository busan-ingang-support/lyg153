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

-- 담임 배정 (teacher_homeroom)
-- teacher1(김선생)은 1학년 1반 담임, teacher2(이선생)은 1학년 2반 담임
INSERT OR IGNORE INTO teacher_homeroom (teacher_id, class_id, semester_id) VALUES 
  (1, 1, 1),  -- teacher1 → 1학년 1반
  (2, 2, 1);  -- teacher2 → 1학년 2반

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

-- 테스트 수업 생성 (기존 데이터 삭제 후 재삽입)
-- 교사의 전공(subject)과 subjects.name을 매칭하여 생성
-- teacher1: 국어 전공 → 국어 과목만
-- teacher2: 수학 전공 → 수학, 과학 과목만 (수학과 교사가 과학도 가르칠 수 있음)
DELETE FROM courses WHERE class_id = 1 AND semester_id = 1;

-- teacher1 (국어 전공)의 수업: 국어만
INSERT INTO courses (subject_id, semester_id, teacher_id, class_id, course_name, schedule) VALUES 
  (1, 1, 1, 1, '1학년 1반 국어', '월,수,금 1교시');

-- teacher2 (수학 전공)의 수업: 수학, 과학
INSERT INTO courses (subject_id, semester_id, teacher_id, class_id, course_name, schedule) VALUES 
  (3, 1, 2, 1, '1학년 1반 수학', '화,목 1,2교시'),
  (4, 1, 2, 1, '1학년 1반 과학', '화,목 3교시');

-- 추가 교사가 필요한 과목들은 별도 교사로 생성하거나, 기존 교사에게 추가 전공 부여
-- 예: 영어, 사회, 음악, 미술, 체육은 별도 교사 필요
-- 여기서는 예시로 teacher1에게 추가 과목 부여 (실제로는 별도 교사 생성 권장)
-- 주의: 실제 운영 시에는 각 과목별로 전공 교사를 배정해야 함

-- 테스트 시간표 생성 (1학년 1반)
-- 기존 시간표 삭제
DELETE FROM schedules WHERE class_id = 1;

-- courses의 ID를 course_name으로 조회하여 삽입
-- 월요일
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 1, '101' FROM courses WHERE course_name = '1학년 1반 국어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 2, '101' FROM courses WHERE course_name = '1학년 1반 영어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 3, '101' FROM courses WHERE course_name = '1학년 1반 사회' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 4, '101' FROM courses WHERE course_name = '1학년 1반 영어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 5, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 6, '103' FROM courses WHERE course_name = '1학년 1반 과학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '월', 7, '체육관' FROM courses WHERE course_name = '1학년 1반 체육' AND class_id = 1;

-- 화요일
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 1, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 2, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 3, '103' FROM courses WHERE course_name = '1학년 1반 과학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 4, '체육관' FROM courses WHERE course_name = '1학년 1반 체육' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 5, '101' FROM courses WHERE course_name = '1학년 1반 국어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 6, '101' FROM courses WHERE course_name = '1학년 1반 영어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '화', 7, '101' FROM courses WHERE course_name = '1학년 1반 사회' AND class_id = 1;

-- 수요일
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 1, '101' FROM courses WHERE course_name = '1학년 1반 국어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 2, '101' FROM courses WHERE course_name = '1학년 1반 영어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 3, '101' FROM courses WHERE course_name = '1학년 1반 사회' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 4, '103' FROM courses WHERE course_name = '1학년 1반 과학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 5, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 6, '체육관' FROM courses WHERE course_name = '1학년 1반 체육' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '수', 7, '음악실' FROM courses WHERE course_name = '1학년 1반 음악' AND class_id = 1;

-- 목요일
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 1, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 2, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 3, '103' FROM courses WHERE course_name = '1학년 1반 과학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 4, '체육관' FROM courses WHERE course_name = '1학년 1반 체육' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 5, '101' FROM courses WHERE course_name = '1학년 1반 국어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 6, '101' FROM courses WHERE course_name = '1학년 1반 영어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '목', 7, '101' FROM courses WHERE course_name = '1학년 1반 사회' AND class_id = 1;

-- 금요일
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 1, '101' FROM courses WHERE course_name = '1학년 1반 국어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 2, '101' FROM courses WHERE course_name = '1학년 1반 영어' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 3, '음악실' FROM courses WHERE course_name = '1학년 1반 음악' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 4, '미술실' FROM courses WHERE course_name = '1학년 1반 미술' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 5, '102' FROM courses WHERE course_name = '1학년 1반 수학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 6, '103' FROM courses WHERE course_name = '1학년 1반 과학' AND class_id = 1;
INSERT INTO schedules (class_id, course_id, day_of_week, period, room_number) 
SELECT 1, id, '금', 7, '체육관' FROM courses WHERE course_name = '1학년 1반 체육' AND class_id = 1;

-- 테스트 동아리 생성
INSERT OR IGNORE INTO clubs (name, description, advisor_teacher_id, semester_id, max_members) VALUES 
  ('코딩 동아리', '프로그래밍과 코딩을 배우는 동아리', 2, 1, 20),
  ('음악 동아리', '다양한 악기를 연주하는 동아리', 1, 1, 15);
