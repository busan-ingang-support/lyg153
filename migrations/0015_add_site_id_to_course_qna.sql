-- course_qna 테이블에 site_id 컬럼 추가
ALTER TABLE course_qna ADD COLUMN site_id INTEGER DEFAULT 1;

-- 기존 데이터에 site_id 업데이트 (기본값 1)
UPDATE course_qna SET site_id = 1 WHERE site_id IS NULL;
