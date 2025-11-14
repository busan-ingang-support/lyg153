-- 기존 과목들을 1학년, 2학년, 3학년별로 복제
-- 먼저 기존 과목들을 1학년으로 설정
UPDATE subjects SET grade = 1 WHERE grade IS NULL;

-- 2학년, 3학년 과목 추가
INSERT INTO subjects (name, code, description, credits, subject_type, grade, performance_ratio, written_ratio)
SELECT name, code || '_G2', description, credits, subject_type, 2, 40, 60
FROM subjects WHERE grade = 1;

INSERT INTO subjects (name, code, description, credits, subject_type, grade, performance_ratio, written_ratio)
SELECT name, code || '_G3', description, credits, subject_type, 3, 40, 60
FROM subjects WHERE grade = 1;

-- code 컬럼 업데이트 (1학년도)
UPDATE subjects SET code = code || '_G1' WHERE grade = 1 AND code NOT LIKE '%_G1';
