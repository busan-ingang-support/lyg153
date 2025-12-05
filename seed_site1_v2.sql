-- ========================================
-- Site 1 추가 초기 데이터 (v2 - INSERT only)
-- Domain: lyg153.pages.dev
-- ========================================

-- 1. 홈페이지 설정 (site_id 1)
INSERT INTO system_settings (site_id, setting_key, setting_value, setting_type, description) VALUES
(1, 'homepage_school_name', '대안학교', 'string', '홈페이지 학교명'),
(1, 'homepage_school_motto', '새로운 교육의 시작', 'string', '학교 슬로건'),
(1, 'homepage_welcome_message', '대안학교에 오신 것을 환영합니다.', 'text', '환영 메시지'),
(1, 'homepage_about', '대안학교는 학생 개개인의 잠재력을 최대한 발휘할 수 있도록 돕는 교육기관입니다.', 'text', '학교 소개'),
(1, 'homepage_phone', '02-1234-5678', 'string', '연락처'),
(1, 'homepage_email', 'contact@lyg153.com', 'string', '이메일'),
(1, 'homepage_address', '서울시 강남구 선릉로 123', 'string', '주소'),
(1, 'homepage_primary_color', '#1e40af', 'string', '메인 컬러 (파란색)');

-- 2. 학사 설정 추가 (site_id 1)
INSERT INTO system_settings (site_id, setting_key, setting_value, setting_type, description) VALUES
(1, 'academic_year', '2024', 'string', '현재 학년도'),
(1, 'current_semester', '1', 'string', '현재 학기'),
(1, 'attendance_required_days', '180', 'number', '출석 필수 일수'),
(1, 'passing_grade', '60', 'number', '과락 기준 점수'),
(1, 'attendance_status_present', '출석', 'string', '출석'),
(1, 'attendance_status_absent', '결석', 'string', '결석'),
(1, 'attendance_status_late', '지각', 'string', '지각'),
(1, 'attendance_status_excused', '조퇴', 'string', '조퇴'),
(1, 'volunteer_required_hours', '20', 'number', '학기별 필수 봉사 시간'),
(1, 'volunteer_category_environment', '환경', 'string', '환경 봉사'),
(1, 'volunteer_category_welfare', '복지', 'string', '복지 봉사'),
(1, 'volunteer_category_community', '지역사회', 'string', '지역사회 봉사');
