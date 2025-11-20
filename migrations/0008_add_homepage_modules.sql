-- 홈페이지 모듈 테이블
CREATE TABLE IF NOT EXISTS homepage_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_type TEXT NOT NULL CHECK(module_type IN ('hero', 'values', 'features', 'slides', 'notice', 'about', 'contact', 'custom', 'text', 'image', 'video')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  container_type TEXT DEFAULT 'container' CHECK(container_type IN ('container', 'full_width', 'narrow')),
  background_color TEXT,
  background_image TEXT,
  padding_top INTEGER DEFAULT 0,
  padding_bottom INTEGER DEFAULT 0,
  margin_top INTEGER DEFAULT 0,
  margin_bottom INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 홈페이지 모듈 설정 테이블 (각 모듈의 상세 설정)
CREATE TABLE IF NOT EXISTS homepage_module_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  FOREIGN KEY (module_id) REFERENCES homepage_modules(id) ON DELETE CASCADE,
  UNIQUE(module_id, setting_key)
);

-- 홈페이지 슬라이드 항목 테이블
CREATE TABLE IF NOT EXISTS homepage_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  slide_order INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  link_url TEXT,
  link_text TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES homepage_modules(id) ON DELETE CASCADE
);

-- 홈페이지 이미지 업로드 테이블 (아이콘, 이미지 등)
CREATE TABLE IF NOT EXISTS homepage_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_type TEXT NOT NULL CHECK(image_type IN ('icon', 'background', 'slide', 'feature', 'custom')),
  image_url TEXT NOT NULL,
  image_alt TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_homepage_modules_order ON homepage_modules(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_modules_active ON homepage_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_module_settings_module ON homepage_module_settings(module_id);
CREATE INDEX IF NOT EXISTS idx_homepage_slides_module ON homepage_slides(module_id);
CREATE INDEX IF NOT EXISTS idx_homepage_slides_order ON homepage_slides(slide_order);
CREATE INDEX IF NOT EXISTS idx_homepage_images_type ON homepage_images(image_type);

