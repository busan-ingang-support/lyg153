-- ============================================
-- 봉사활동 관리 테이블 업데이트
-- ============================================
-- volunteer_activities 테이블은 이미 0001에서 생성됨
-- semester_id 컬럼 추가 (이미 있으면 무시)
ALTER TABLE volunteer_activities ADD COLUMN semester_id INTEGER;
ALTER TABLE volunteer_activities ADD COLUMN activity_type TEXT;
ALTER TABLE volunteer_activities ADD COLUMN location TEXT;
ALTER TABLE volunteer_activities ADD COLUMN recognition TEXT;

CREATE INDEX IF NOT EXISTS idx_volunteer_student_id ON volunteer_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_semester_id ON volunteer_activities(semester_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_activity_date ON volunteer_activities(activity_date);

-- ============================================
-- 상담기록 관리 테이블 업데이트
-- ============================================
-- counseling_records 테이블은 이미 0002에서 생성됨
-- semester_id 컬럼 추가
ALTER TABLE counseling_records ADD COLUMN semester_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_counseling_student_id ON counseling_records(student_id);
CREATE INDEX IF NOT EXISTS idx_counseling_semester_id ON counseling_records(semester_id);
CREATE INDEX IF NOT EXISTS idx_counseling_date ON counseling_records(counseling_date);

-- ============================================
-- 모듈 설정 업데이트 (이미 0004에서 추가됨)
-- ============================================
-- 모듈은 이미 0004_add_awards_reading_modules.sql에서 추가됨
