-- ========================================
-- Fix system_settings UNIQUE constraint
-- Change from UNIQUE(setting_key) to UNIQUE(setting_key, site_id)
-- ========================================

-- SQLite doesn't support ALTER TABLE to modify constraints
-- We need to recreate the table

-- 1. Create new table with correct constraints
CREATE TABLE system_settings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  updated_by INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  site_id INTEGER DEFAULT 1,
  UNIQUE(setting_key, site_id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 2. Copy data from old table
INSERT INTO system_settings_new
SELECT * FROM system_settings;

-- 3. Drop old table
DROP TABLE system_settings;

-- 4. Rename new table
ALTER TABLE system_settings_new RENAME TO system_settings;

-- 5. Create index for better query performance
CREATE INDEX idx_system_settings_site_id ON system_settings(site_id);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
