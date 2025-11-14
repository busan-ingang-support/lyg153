-- 학생 테이블에 상세 정보 필드 추가
ALTER TABLE students ADD COLUMN birthdate DATE;
ALTER TABLE students ADD COLUMN gender TEXT CHECK(gender IN ('male', 'female'));
ALTER TABLE students ADD COLUMN blood_type TEXT CHECK(blood_type IN ('A', 'B', 'AB', 'O'));
ALTER TABLE students ADD COLUMN religion TEXT;
ALTER TABLE students ADD COLUMN nationality TEXT DEFAULT 'KR';
ALTER TABLE students ADD COLUMN profile_photo_url TEXT;

-- 보호자 정보 컬럼 추가
ALTER TABLE students ADD COLUMN guardian_name TEXT;
ALTER TABLE students ADD COLUMN guardian_relation TEXT;
ALTER TABLE students ADD COLUMN guardian_phone TEXT;
ALTER TABLE students ADD COLUMN guardian_email TEXT;
ALTER TABLE students ADD COLUMN guardian_address TEXT;

-- 이전 학력 정보
ALTER TABLE students ADD COLUMN previous_school TEXT;
ALTER TABLE students ADD COLUMN previous_school_type TEXT CHECK(previous_school_type IN ('elementary', 'middle', 'high', 'other'));

-- 특이사항 및 메모
ALTER TABLE students ADD COLUMN medical_notes TEXT;
ALTER TABLE students ADD COLUMN allergy_info TEXT;
ALTER TABLE students ADD COLUMN special_notes TEXT;
