-- subjects 테이블 개선
ALTER TABLE subjects ADD COLUMN grade INTEGER;
ALTER TABLE subjects ADD COLUMN performance_ratio INTEGER DEFAULT 40;
ALTER TABLE subjects ADD COLUMN written_ratio INTEGER DEFAULT 60;

-- 시간표 테이블 생성
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  day_of_week TEXT NOT NULL CHECK(day_of_week IN ('월', '화', '수', '목', '금', '토', '일')),
  period INTEGER NOT NULL,
  room_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(class_id, day_of_week, period)
);

CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_course ON schedules(course_id);
