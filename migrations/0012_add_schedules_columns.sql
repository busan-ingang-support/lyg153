-- ================================================
-- 0012: schedules 테이블에 site_id, deleted_at 추가
-- ================================================

-- schedules 테이블에 멀티테넌트 및 soft delete 컬럼 추가
ALTER TABLE schedules ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE schedules ADD COLUMN deleted_at DATETIME;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_schedules_site ON schedules(site_id);
CREATE INDEX IF NOT EXISTS idx_schedules_deleted ON schedules(deleted_at);
