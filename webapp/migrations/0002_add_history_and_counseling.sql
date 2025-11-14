-- 학생 반 배정 이력 (학기별로 다른 반에 배정 가능)
CREATE TABLE IF NOT EXISTS student_class_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  UNIQUE(student_id, semester_id)
);

-- 상담 내역
CREATE TABLE IF NOT EXISTS counseling_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  counselor_id INTEGER NOT NULL,
  counseling_date DATE NOT NULL,
  counseling_type TEXT CHECK(counseling_type IN ('academic', 'career', 'personal', 'behavior', 'family', 'other')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  follow_up_required INTEGER DEFAULT 0,
  follow_up_date DATE,
  parent_notified INTEGER DEFAULT 0,
  is_confidential INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES users(id)
);

-- 교사 담당 반 (homeroom)
CREATE TABLE IF NOT EXISTS teacher_homeroom (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
  UNIQUE(class_id, semester_id)
);

-- 시스템 설정
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  updated_by INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 알림 (기초 구조)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_student_class_history_student ON student_class_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_class_history_semester ON student_class_history(semester_id);
CREATE INDEX IF NOT EXISTS idx_counseling_student ON counseling_records(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_counselor ON counseling_records(counselor_id);
CREATE INDEX IF NOT EXISTS idx_counseling_date ON counseling_records(counseling_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 기본 시스템 설정값 삽입
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
  ('school_name', '대안학교', 'string', '학교 이름'),
  ('school_address', '', 'string', '학교 주소'),
  ('school_phone', '', 'string', '학교 연락처'),
  ('school_email', '', 'string', '학교 이메일'),
  ('current_semester_id', '1', 'number', '현재 활성 학기 ID'),
  ('attendance_lock_days', '7', 'number', '출석 수정 가능 일수'),
  ('grade_calculation_method', 'weighted', 'string', '성적 계산 방식 (weighted/average)');
