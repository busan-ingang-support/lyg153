-- ============================================
-- 봉사활동 관리 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  activity_name TEXT NOT NULL,
  organization TEXT,
  activity_type TEXT,
  activity_date DATE NOT NULL,
  hours REAL NOT NULL,
  location TEXT,
  description TEXT,
  recognition TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_volunteer_student_id ON volunteer_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_semester_id ON volunteer_activities(semester_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_activity_date ON volunteer_activities(activity_date);

-- ============================================
-- 상담기록 관리 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS counseling_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  counseling_date DATE NOT NULL,
  counseling_type TEXT,
  counselor_name TEXT,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  follow_up TEXT,
  is_confidential INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_counseling_student_id ON counseling_records(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_semester_id ON counseling_records(semester_id);
CREATE INDEX IF NOT EXISTS idx_counseling_date ON counseling_records(counseling_date);

-- ============================================
-- 모듈 설정 업데이트 (이미 0004에서 추가됨)
-- ============================================
-- 모듈은 이미 0004_add_awards_reading_modules.sql에서 추가됨
