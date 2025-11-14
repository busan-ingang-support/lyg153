-- ============================================
-- 과목에 교사 연결 기능 추가
-- ============================================
-- subjects 테이블에 teacher_id 컬럼 추가 (기본 담당 교사)
ALTER TABLE subjects ADD COLUMN teacher_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);

