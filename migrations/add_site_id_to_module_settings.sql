-- ========================================
-- Add site_id column to module_settings table
-- ========================================

-- SQLite doesn't support ALTER TABLE ADD COLUMN with constraints easily
-- We need to recreate the table with site_id column

-- 1. Create new table with site_id column
CREATE TABLE module_settings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER DEFAULT 1,
  module_name TEXT NOT NULL,
  module_label TEXT NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module_name, site_id)
);

-- 2. Copy existing data (all goes to site_id = 1)
INSERT INTO module_settings_new (id, site_id, module_name, module_label, is_enabled, display_order, icon, created_at, updated_at)
SELECT id, 1 as site_id, module_name, module_label, is_enabled, display_order, icon, created_at, updated_at
FROM module_settings;

-- 3. Drop old table
DROP TABLE module_settings;

-- 4. Rename new table
ALTER TABLE module_settings_new RENAME TO module_settings;

-- 5. Create index for better query performance
CREATE INDEX idx_module_settings_site_id ON module_settings(site_id);
CREATE INDEX idx_module_settings_name ON module_settings(module_name);

-- 6. Insert default module settings for site 1 if not exists
INSERT OR IGNORE INTO module_settings (site_id, module_name, module_label, is_enabled, display_order, icon) VALUES
(1, 'dashboard', '대시보드', 1, 1, 'fa-home'),
(1, 'attendance', '출석', 1, 2, 'fa-calendar-check'),
(1, 'grades', '성적', 1, 3, 'fa-chart-line'),
(1, 'assignments', '과제', 1, 4, 'fa-tasks'),
(1, 'courses', '수업', 1, 5, 'fa-book'),
(1, 'students', '학생관리', 1, 6, 'fa-users'),
(1, 'teachers', '교사관리', 1, 7, 'fa-chalkboard-teacher'),
(1, 'classes', '반관리', 1, 8, 'fa-door-open'),
(1, 'clubs', '동아리', 1, 9, 'fa-users-cog'),
(1, 'volunteer', '봉사활동', 1, 10, 'fa-hands-helping'),
(1, 'reading', '독서활동', 1, 11, 'fa-book-reader'),
(1, 'awards', '수상경력', 1, 12, 'fa-award'),
(1, 'boards', '게시판', 1, 13, 'fa-clipboard'),
(1, 'counseling', '상담', 1, 14, 'fa-comments'),
(1, 'schedules', '일정', 1, 15, 'fa-calendar-alt'),
(1, 'notifications', '알림', 1, 16, 'fa-bell'),
(1, 'settings', '설정', 1, 17, 'fa-cog');
