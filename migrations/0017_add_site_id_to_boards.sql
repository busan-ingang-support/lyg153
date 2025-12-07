-- ================================================
-- 0017: boards 테이블에 site_id 추가
-- ================================================

-- boards 테이블에 site_id 추가
ALTER TABLE boards ADD COLUMN site_id INTEGER DEFAULT 1;

-- 기존 boards의 site_id를 1로 업데이트
UPDATE boards SET site_id = 1 WHERE site_id IS NULL;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_boards_site ON boards(site_id);
CREATE INDEX IF NOT EXISTS idx_boards_type_site ON boards(board_type, site_id);

-- 모든 사이트에 학생용 게시판 생성 (각 사이트별로 공지사항, 자유게시판 추가)
INSERT OR IGNORE INTO boards (name, board_type, target_id, description, is_active, site_id)
SELECT '공지사항', 'student', NULL, '학교 전체 공지사항', 1, s.id
FROM sites s
WHERE NOT EXISTS (
  SELECT 1 FROM boards b WHERE b.site_id = s.id AND b.board_type = 'student' AND b.name = '공지사항'
);

INSERT OR IGNORE INTO boards (name, board_type, target_id, description, is_active, site_id)
SELECT '자유게시판', 'student', NULL, '학생들의 자유로운 소통 공간', 1, s.id
FROM sites s
WHERE NOT EXISTS (
  SELECT 1 FROM boards b WHERE b.site_id = s.id AND b.board_type = 'student' AND b.name = '자유게시판'
);
