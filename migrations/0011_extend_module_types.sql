-- ================================================
-- 0011: 홈페이지 모듈 타입 확장
-- ================================================

-- SQLite에서는 CHECK constraint를 직접 수정할 수 없으므로
-- 테이블을 재생성해야 합니다.

-- 1. 기존 데이터 백업
CREATE TABLE homepage_modules_backup AS SELECT * FROM homepage_modules;

-- 2. 기존 테이블 삭제
DROP TABLE homepage_modules;

-- 3. 새 테이블 생성 (확장된 module_type, CHECK 제약 제거)
CREATE TABLE homepage_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_type TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  container_type TEXT DEFAULT 'container',
  background_color TEXT,
  background_image TEXT,
  padding_top INTEGER DEFAULT 0,
  padding_bottom INTEGER DEFAULT 0,
  margin_top INTEGER DEFAULT 0,
  margin_bottom INTEGER DEFAULT 0,
  page TEXT DEFAULT 'home',
  site_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- 4. 데이터 복원
INSERT INTO homepage_modules (
  id, module_type, display_order, is_active,
  container_type, background_color, background_image,
  padding_top, padding_bottom, margin_top, margin_bottom,
  page, site_id, created_at, updated_at, updated_by
)
SELECT 
  id, module_type, display_order, is_active,
  container_type, background_color, background_image,
  padding_top, padding_bottom, margin_top, margin_bottom,
  COALESCE(page, 'home'), COALESCE(site_id, 1), created_at, updated_at, updated_by
FROM homepage_modules_backup;

-- 5. 백업 테이블 삭제
DROP TABLE homepage_modules_backup;

-- 6. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_homepage_modules_page ON homepage_modules(page);
CREATE INDEX IF NOT EXISTS idx_homepage_modules_order ON homepage_modules(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_modules_site ON homepage_modules(site_id);

