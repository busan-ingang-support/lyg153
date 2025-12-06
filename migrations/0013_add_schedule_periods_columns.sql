-- ================================================
-- 0013: schedule_periods 테이블에 site_id, deleted_at 추가
-- ================================================

-- schedule_periods 테이블에 멀티테넌트 및 soft delete 컬럼 추가
ALTER TABLE schedule_periods ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE schedule_periods ADD COLUMN deleted_at DATETIME;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_schedule_periods_site ON schedule_periods(site_id);
CREATE INDEX IF NOT EXISTS idx_schedule_periods_deleted ON schedule_periods(deleted_at);
