-- 1. subjects 테이블에 학년 추가
ALTER TABLE subjects ADD COLUMN grade INTEGER;
ALTER TABLE subjects ADD COLUMN performance_ratio INTEGER DEFAULT 40 CHECK(performance_ratio >= 0 AND performance_ratio <= 100);
ALTER TABLE subjects ADD COLUMN written_ratio INTEGER DEFAULT 60 CHECK(written_ratio >= 0 AND written_ratio <= 100);

-- 2. 시간표 테이블 생성
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  day_of_week TEXT NOT NULL CHECK(day_of_week IN ('월', '화', '수', '목', '금')),
  period INTEGER NOT NULL CHECK(period >= 1 AND period <= 7),
  room_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(class_id, day_of_week, period)
);

-- 3. courses 테이블에 학년 정보 추가 (과목의 학년을 참조)
-- 참고: courses는 이미 subject_id를 통해 학년 정보를 얻을 수 있음
