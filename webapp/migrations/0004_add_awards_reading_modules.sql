-- 0004: 수상관리, 독서활동관리, 모듈 설정 추가

-- 수상 관리 (Awards Management)
CREATE TABLE IF NOT EXISTS awards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  award_name TEXT NOT NULL,
  award_category TEXT,  -- 예: '학업우수상', '봉사상', '체육상', '예술상' 등
  award_level TEXT,     -- 예: '교내', '지역', '전국', '국제'
  award_date DATE NOT NULL,
  organizer TEXT,       -- 주최기관
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

-- 독서활동 관리 (Reading Activities Management)
CREATE TABLE IF NOT EXISTS reading_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  book_title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  read_date DATE NOT NULL,
  pages INTEGER,
  reading_type TEXT,    -- 예: '필독', '선택', '추천'
  summary TEXT,         -- 줄거리/요약
  review TEXT,          -- 독후감
  rating INTEGER,       -- 평점 1-5
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

-- 모듈 설정 (Module Settings)
CREATE TABLE IF NOT EXISTS module_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_name TEXT UNIQUE NOT NULL,  -- 예: 'awards', 'reading', 'volunteer', 'clubs' 등
  module_label TEXT NOT NULL,         -- 표시명: '수상관리', '독서활동관리' 등
  is_enabled INTEGER DEFAULT 1,       -- 1: 활성화, 0: 비활성화
  display_order INTEGER DEFAULT 0,
  icon TEXT,                          -- Font Awesome 아이콘 클래스
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 모듈 설정 데이터 삽입
INSERT OR IGNORE INTO module_settings (module_name, module_label, is_enabled, display_order, icon) VALUES
  ('students', '학생 관리', 1, 1, 'fa-user-graduate'),
  ('subjects', '과목 관리', 1, 2, 'fa-book-open'),
  ('classes', '반 관리', 1, 3, 'fa-door-open'),
  ('attendance', '출석 관리', 1, 4, 'fa-clipboard-check'),
  ('grades', '성적 관리', 1, 5, 'fa-chart-line'),
  ('awards', '수상 관리', 1, 6, 'fa-trophy'),
  ('reading', '독서활동 관리', 1, 7, 'fa-book-reader'),
  ('volunteer', '봉사활동', 1, 8, 'fa-hands-helping'),
  ('clubs', '동아리', 1, 9, 'fa-users'),
  ('counseling', '상담 내역', 1, 10, 'fa-comments');

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_awards_student_id ON awards(student_id);
CREATE INDEX IF NOT EXISTS idx_awards_semester_id ON awards(semester_id);
CREATE INDEX IF NOT EXISTS idx_awards_date ON awards(award_date);

CREATE INDEX IF NOT EXISTS idx_reading_student_id ON reading_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_reading_semester_id ON reading_activities(semester_id);
CREATE INDEX IF NOT EXISTS idx_reading_date ON reading_activities(read_date);

CREATE INDEX IF NOT EXISTS idx_module_settings_name ON module_settings(module_name);
CREATE INDEX IF NOT EXISTS idx_module_settings_enabled ON module_settings(is_enabled);
