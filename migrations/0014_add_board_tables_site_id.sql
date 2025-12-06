-- ================================================
-- 0014: board_posts, board_comments 테이블에 site_id 추가
-- ================================================

-- board_posts 테이블에 site_id 추가
ALTER TABLE board_posts ADD COLUMN site_id INTEGER DEFAULT 1;

-- board_comments 테이블에 site_id 추가
ALTER TABLE board_comments ADD COLUMN site_id INTEGER DEFAULT 1;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_board_posts_site ON board_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_board_comments_site ON board_comments(site_id);
