-- homepage_modules 테이블에 page 컬럼 추가
ALTER TABLE homepage_modules ADD COLUMN page TEXT DEFAULT 'home' CHECK(page IN ('home', 'about', 'education', 'notice', 'location'));

-- 기존 데이터의 page를 'home'으로 설정
UPDATE homepage_modules SET page = 'home' WHERE page IS NULL;

-- page별 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_homepage_modules_page ON homepage_modules(page);

