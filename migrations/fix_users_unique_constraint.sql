-- ========================================
-- Fix users table UNIQUE constraints for multi-tenant
-- Change from UNIQUE(username) and UNIQUE(email)
-- to UNIQUE(username, site_id) and UNIQUE(email, site_id)
-- ========================================

-- SQLite doesn't support ALTER TABLE to modify constraints
-- We need to recreate the table

-- Disable foreign key checks temporarily
PRAGMA foreign_keys = OFF;

-- 1. Create new table with correct constraints
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'parent', 'teacher', 'admin', 'super_admin')),
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  site_id INTEGER DEFAULT 1,
  deleted_at DATETIME,
  UNIQUE(username, site_id),
  UNIQUE(email, site_id)
);

-- 2. Copy data from old table
INSERT INTO users_new
SELECT * FROM users;

-- 3. Drop old table
DROP TABLE users;

-- 4. Rename new table
ALTER TABLE users_new RENAME TO users;

-- 5. Create indexes for better query performance
CREATE INDEX idx_users_site_id ON users(site_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;
