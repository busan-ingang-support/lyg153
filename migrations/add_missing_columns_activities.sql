-- ========================================
-- Add missing site_id and deleted_at columns to activity tables
-- ========================================

-- 1. Add columns to awards table
ALTER TABLE awards ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE awards ADD COLUMN deleted_at DATETIME;

-- 2. Add columns to reading_activities table
ALTER TABLE reading_activities ADD COLUMN site_id INTEGER DEFAULT 1;
ALTER TABLE reading_activities ADD COLUMN deleted_at DATETIME;

-- 3. Add deleted_at to volunteer_activities (already has site_id)
ALTER TABLE volunteer_activities ADD COLUMN deleted_at DATETIME;

-- 4. Add deleted_at to counseling_records (already has site_id)
ALTER TABLE counseling_records ADD COLUMN deleted_at DATETIME;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_awards_site_id ON awards(site_id);
CREATE INDEX IF NOT EXISTS idx_awards_deleted_at ON awards(deleted_at);

CREATE INDEX IF NOT EXISTS idx_reading_site_id ON reading_activities(site_id);
CREATE INDEX IF NOT EXISTS idx_reading_deleted_at ON reading_activities(deleted_at);

CREATE INDEX IF NOT EXISTS idx_volunteer_deleted_at ON volunteer_activities(deleted_at);

CREATE INDEX IF NOT EXISTS idx_counseling_deleted_at ON counseling_records(deleted_at);
