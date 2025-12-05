-- ========================================
-- Site 1 추가 초기 데이터
-- Domain: lyg153.pages.dev
-- ========================================

-- 1. 홈페이지 설정 (site_id 1)
INSERT OR IGNORE INTO system_settings (site_id, setting_key, setting_value, setting_type, description) VALUES
(1, 'homepage_school_name', '대안학교', 'string', '홈페이지 학교명'),
(1, 'homepage_school_motto', '새로운 교육의 시작', 'string', '학교 슬로건'),
(1, 'homepage_welcome_message', '대안학교에 오신 것을 환영합니다.', 'text', '환영 메시지'),
(1, 'homepage_about', '대안학교는 학생 개개인의 잠재력을 최대한 발휘할 수 있도록 돕는 교육기관입니다.', 'text', '학교 소개'),
(1, 'homepage_phone', '02-1234-5678', 'string', '연락처'),
(1, 'homepage_email', 'contact@lyg153.com', 'string', '이메일'),
(1, 'homepage_address', '서울시 강남구 선릉로 123', 'string', '주소'),
(1, 'homepage_primary_color', '#1e40af', 'string', '메인 컬러 (파란색)');

-- 2. 학사 설정 추가 (site_id 1)
INSERT OR IGNORE INTO system_settings (site_id, setting_key, setting_value, setting_type, description) VALUES
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

-- 3. 홈페이지 모듈 (site_id 1) - 기본 구조
INSERT OR IGNORE INTO homepage_modules (site_id, module_type, page, display_order, is_active, container_type) VALUES
(1, 'hero', 'home', 1, 1, 'full-width'),
(1, 'stats', 'home', 2, 1, 'container'),
(1, 'news', 'home', 3, 1, 'container'),
(1, 'text', 'about', 1, 1, 'container');

-- 4. 홈페이지 모듈 설정 (site_id 1)
-- Hero 섹션
INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'title', '대안학교', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'hero' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'subtitle', '새로운 교육의 시작', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'hero' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'description', '학생 개개인의 잠재력을 최대한 발휘할 수 있도록 돕습니다.', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'hero' AND page = 'home';

-- Stats 섹션
INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'stat1_number', '10', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'stat1_label', '교육 연수', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'stat2_number', '100+', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'stat2_label', '재학생', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'stat3_number', '20+', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'stat3_label', '교직원', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'stats' AND page = 'home';

-- About 텍스트 모듈
INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'title', '학교 소개', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'text' AND page = 'about';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 1, id, 'content', '대안학교는 학생 개개인의 잠재력을 최대한 발휘할 수 있도록 돕는 교육기관입니다.

우리는 학생 중심의 교육 철학을 바탕으로, 창의적이고 자율적인 학습 환경을 제공합니다.

모든 학생이 자신만의 길을 찾아가며 성장할 수 있도록 최선을 다하고 있습니다.', 'string'
FROM homepage_modules WHERE site_id = 1 AND module_type = 'text' AND page = 'about';
