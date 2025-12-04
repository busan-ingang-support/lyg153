-- ================================================
-- 0010: 과제 시스템, Soft Delete, SaaS 멀티테넌트 구조
-- ================================================

-- ========================================
-- 1. sites 테이블 (멀티테넌트)
-- ========================================
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e40af',
  settings TEXT, -- JSON 형태로 사이트별 설정 저장
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 사이트 생성
INSERT OR IGNORE INTO sites (id, domain, name, settings) VALUES 
(1, 'localhost', '대안학교', '{}');

-- ========================================
-- 2. 과제(Assignments) 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER DEFAULT 1,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT DEFAULT 'homework' CHECK(assignment_type IN ('homework', 'project', 'report', 'practice', 'other')),
  due_date DATETIME,
  max_score REAL DEFAULT 100,
  weight REAL DEFAULT 1.0,
  file_url TEXT,
  is_published INTEGER DEFAULT 0,
  published_at DATETIME,
  created_by INTEGER NOT NULL,
  status INTEGER DEFAULT 1, -- 1: active, 0: deleted
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 과제 제출
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER DEFAULT 1,
  assignment_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  content TEXT,
  file_url TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  score REAL,
  feedback TEXT,
  graded_by INTEGER,
  graded_at DATETIME,
  status INTEGER DEFAULT 1, -- 1: submitted, 2: graded, 0: deleted
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id),
  UNIQUE(assignment_id, student_id)
);

-- ========================================
-- 3. 알림 테이블 확장
-- ========================================
-- notifications 테이블에 site_id와 reference 컬럼 추가
ALTER TABLE notifications ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE notifications ADD COLUMN reference_type TEXT; -- assignment, grade, attendance, etc.
ALTER TABLE notifications ADD COLUMN reference_id INTEGER;

-- ========================================
-- 4. 기존 테이블에 site_id 및 status 추가
-- ========================================

-- users
ALTER TABLE users ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN deleted_at DATETIME;

-- students  
ALTER TABLE students ADD COLUMN site_id INTEGER DEFAULT 1;
-- students already has status column

-- teachers
ALTER TABLE teachers ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE teachers ADD COLUMN status INTEGER DEFAULT 1;

-- parent_student
ALTER TABLE parent_student ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE parent_student ADD COLUMN status INTEGER DEFAULT 1;

-- semesters
ALTER TABLE semesters ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE semesters ADD COLUMN status INTEGER DEFAULT 1;

-- classes
ALTER TABLE classes ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE classes ADD COLUMN status INTEGER DEFAULT 1;

-- subjects
ALTER TABLE subjects ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE subjects ADD COLUMN status INTEGER DEFAULT 1;

-- courses
ALTER TABLE courses ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE courses ADD COLUMN status INTEGER DEFAULT 1;

-- enrollments
ALTER TABLE enrollments ADD COLUMN site_id INTEGER DEFAULT 1;
-- enrollments already has status column (but different values)

-- attendance - 주의: 이미 TEXT status 컬럼이 있음 (present/absent/late/excused)
-- Bug 1 Fix: INTEGER status 컬럼을 추가하지 않음
ALTER TABLE attendance ADD COLUMN site_id INTEGER DEFAULT 1;
-- attendance.status는 TEXT 타입으로 출석 상태를 나타내므로 별도의 soft delete 컬럼 사용
ALTER TABLE attendance ADD COLUMN is_deleted INTEGER DEFAULT 0;

-- grades
ALTER TABLE grades ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE grades ADD COLUMN status INTEGER DEFAULT 1;

-- final_grades
ALTER TABLE final_grades ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE final_grades ADD COLUMN status INTEGER DEFAULT 1;

-- volunteer_activities
ALTER TABLE volunteer_activities ADD COLUMN site_id INTEGER DEFAULT 1;
-- volunteer_activities already has status column (but different values)

-- clubs
ALTER TABLE clubs ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE clubs ADD COLUMN status INTEGER DEFAULT 1;

-- club_members
ALTER TABLE club_members ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE club_members ADD COLUMN status INTEGER DEFAULT 1;

-- club_activities
ALTER TABLE club_activities ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE club_activities ADD COLUMN status INTEGER DEFAULT 1;

-- student_records
ALTER TABLE student_records ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE student_records ADD COLUMN status INTEGER DEFAULT 1;

-- student_class_history
ALTER TABLE student_class_history ADD COLUMN site_id INTEGER DEFAULT 1;
-- student_class_history has is_active column, use that

-- counseling_records
ALTER TABLE counseling_records ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE counseling_records ADD COLUMN status INTEGER DEFAULT 1;

-- teacher_homeroom
ALTER TABLE teacher_homeroom ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE teacher_homeroom ADD COLUMN status INTEGER DEFAULT 1;

-- system_settings
ALTER TABLE system_settings ADD COLUMN site_id INTEGER DEFAULT 1;

-- homepage_modules
ALTER TABLE homepage_modules ADD COLUMN site_id INTEGER DEFAULT 1;

-- homepage_module_settings
ALTER TABLE homepage_module_settings ADD COLUMN site_id INTEGER DEFAULT 1;

-- homepage_slides
ALTER TABLE homepage_slides ADD COLUMN site_id INTEGER DEFAULT 1;

-- ========================================
-- 5. 인덱스 생성
-- ========================================
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_site ON assignments(site_id);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_site ON assignment_submissions(site_id);

-- site_id 인덱스 for main tables
CREATE INDEX IF NOT EXISTS idx_users_site ON users(site_id);
CREATE INDEX IF NOT EXISTS idx_students_site ON students(site_id);
CREATE INDEX IF NOT EXISTS idx_teachers_site ON teachers(site_id);
CREATE INDEX IF NOT EXISTS idx_classes_site ON classes(site_id);
CREATE INDEX IF NOT EXISTS idx_courses_site ON courses(site_id);
CREATE INDEX IF NOT EXISTS idx_semesters_site ON semesters(site_id);

-- ========================================
-- 6. 학생 학기별 데이터 보존을 위한 뷰 (참고용)
-- ========================================
-- 학생의 학기별 출석 요약 뷰
CREATE VIEW IF NOT EXISTS v_student_attendance_by_semester AS
SELECT 
  s.id as student_id,
  s.site_id,
  u.name as student_name,
  sem.id as semester_id,
  sem.name as semester_name,
  COUNT(a.id) as total_days,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
  SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
  SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_days
FROM students s
JOIN users u ON s.user_id = u.id
JOIN enrollments e ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
JOIN semesters sem ON c.semester_id = sem.id
LEFT JOIN attendance a ON a.enrollment_id = e.id AND COALESCE(a.is_deleted, 0) = 0
WHERE COALESCE(s.status, 'enrolled') NOT IN ('dropped', 'transferred')
GROUP BY s.id, sem.id;

-- 학생의 학기별 성적 요약 뷰
CREATE VIEW IF NOT EXISTS v_student_grades_by_semester AS
SELECT 
  s.id as student_id,
  s.site_id,
  u.name as student_name,
  sem.id as semester_id,
  sem.name as semester_name,
  sub.name as subject_name,
  AVG(g.score) as average_score,
  COUNT(g.id) as grade_count
FROM students s
JOIN users u ON s.user_id = u.id
JOIN enrollments e ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
JOIN semesters sem ON c.semester_id = sem.id
JOIN subjects sub ON c.subject_id = sub.id
LEFT JOIN grades g ON g.enrollment_id = e.id AND COALESCE(g.status, 1) = 1
WHERE COALESCE(s.status, 'enrolled') NOT IN ('dropped', 'transferred')
GROUP BY s.id, sem.id, sub.id;

