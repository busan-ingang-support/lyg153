-- homepage_images 테이블에 site_id 컬럼 추가
ALTER TABLE homepage_images ADD COLUMN site_id INTEGER DEFAULT 1;
UPDATE homepage_images SET site_id = 1 WHERE site_id IS NULL;

-- teacher_permissions 테이블에 site_id 컬럼 추가
ALTER TABLE teacher_permissions ADD COLUMN site_id INTEGER DEFAULT 1;
UPDATE teacher_permissions SET site_id = 1 WHERE site_id IS NULL;
