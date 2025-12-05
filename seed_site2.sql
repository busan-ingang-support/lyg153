-- ========================================
-- Site 2 초기 데이터
-- Domain: lyg153.healthyeduministry.com
-- ========================================

-- 1. 사이트 정보 등록
INSERT OR IGNORE INTO sites (id, domain, name, logo_url, primary_color, settings, is_active) VALUES
(2, 'lyg153.healthyeduministry.com', '건강한교육사역', NULL, '#059669', '{}', 1);

-- 2. 최고 관리자 계정 (site_id 2) - 동일한 admin 계정이지만 site_id만 다름
-- admin 계정은 이미 존재하므로, site_id를 2로 추가하지 않음
-- 대신 super_admin은 모든 사이트에 접근 가능하도록 설계

-- 3. 학기 정보 (site_id 2)
INSERT OR IGNORE INTO semesters (site_id, name, start_date, end_date, is_current) VALUES
(2, '2024학년도 1학기', '2024-03-01', '2024-08-31', 1),
(2, '2024학년도 2학기', '2024-09-01', '2025-02-28', 0);

-- 4. 반 정보 (site_id 2)
-- 먼저 현재 학기 ID를 가져와야 함 (site_id 2의 첫 번째 학기)
INSERT OR IGNORE INTO classes (site_id, name, grade, semester_id) VALUES
(2, '1학년 1반', 1, (SELECT id FROM semesters WHERE site_id = 2 AND name = '2024학년도 1학기')),
(2, '1학년 2반', 1, (SELECT id FROM semesters WHERE site_id = 2 AND name = '2024학년도 1학기')),
(2, '2학년 1반', 2, (SELECT id FROM semesters WHERE site_id = 2 AND name = '2024학년도 1학기')),
(2, '3학년 1반', 3, (SELECT id FROM semesters WHERE site_id = 2 AND name = '2024학년도 1학기'));

-- 5. 과목 정보 (site_id 2)
INSERT OR IGNORE INTO subjects (site_id, name, grade, code, description, credits) VALUES
(2, '국어', 1, 'KOR1', '1학년 국어', 4),
(2, '수학', 1, 'MATH1', '1학년 수학', 4),
(2, '영어', 1, 'ENG1', '1학년 영어', 4),
(2, '사회', 1, 'SOC1', '1학년 사회', 3),
(2, '과학', 1, 'SCI1', '1학년 과학', 3),
(2, '체육', 1, 'PE1', '1학년 체육', 2),
(2, '음악', 1, 'MUS1', '1학년 음악', 2),
(2, '미술', 1, 'ART1', '1학년 미술', 2),
(2, '국어', 2, 'KOR2', '2학년 국어', 4),
(2, '수학', 2, 'MATH2', '2학년 수학', 4),
(2, '영어', 2, 'ENG2', '2학년 영어', 4),
(2, '국어', 3, 'KOR3', '3학년 국어', 4),
(2, '수학', 3, 'MATH3', '3학년 수학', 4),
(2, '영어', 3, 'ENG3', '3학년 영어', 4);

-- 6. 시스템 설정 (site_id 2)
INSERT OR IGNORE INTO system_settings (site_id, setting_key, setting_value, setting_type, description) VALUES
-- 학교 기본 정보
(2, 'school_name', '건강한교육사역', 'string', '학교명'),
(2, 'school_code', 'HEM001', 'string', '학교 코드'),
(2, 'school_phone', '02-1234-5678', 'string', '대표 전화'),
(2, 'school_email', 'contact@healthyeduministry.com', 'string', '대표 이메일'),
(2, 'school_address', '서울시 강남구 테헤란로 123', 'string', '학교 주소'),
(2, 'school_website', 'https://healthyeduministry.com', 'string', '학교 홈페이지'),

-- 학사 설정
(2, 'academic_year', '2024', 'string', '현재 학년도'),
(2, 'current_semester', '1', 'string', '현재 학기'),
(2, 'attendance_required_days', '180', 'number', '출석 필수 일수'),
(2, 'grade_calculation_method', 'weighted_average', 'string', '성적 계산 방식'),
(2, 'passing_grade', '60', 'number', '과락 기준 점수'),

-- 출석 설정
(2, 'attendance_status_present', '출석', 'string', '출석'),
(2, 'attendance_status_absent', '결석', 'string', '결석'),
(2, 'attendance_status_late', '지각', 'string', '지각'),
(2, 'attendance_status_excused', '조퇴', 'string', '조퇴'),

-- 봉사활동 설정
(2, 'volunteer_required_hours', '20', 'number', '학기별 필수 봉사 시간'),
(2, 'volunteer_category_environment', '환경', 'string', '환경 봉사'),
(2, 'volunteer_category_welfare', '복지', 'string', '복지 봉사'),
(2, 'volunteer_category_community', '지역사회', 'string', '지역사회 봉사');

-- 7. 홈페이지 설정 (site_id 2)
INSERT OR IGNORE INTO system_settings (site_id, setting_key, setting_value, setting_type, description) VALUES
(2, 'homepage_school_name', '건강한교육사역', 'string', '홈페이지 학교명'),
(2, 'homepage_school_motto', '건강한 교육, 건강한 미래', 'string', '학교 슬로건'),
(2, 'homepage_welcome_message', '건강한교육사역에 오신 것을 환영합니다.', 'text', '환영 메시지'),
(2, 'homepage_about', '건강한교육사역은 학생 중심의 교육을 실천합니다.', 'text', '학교 소개'),
(2, 'homepage_phone', '02-1234-5678', 'string', '연락처'),
(2, 'homepage_email', 'contact@healthyeduministry.com', 'string', '이메일'),
(2, 'homepage_address', '서울시 강남구 테헤란로 123', 'string', '주소'),
(2, 'homepage_primary_color', '#059669', 'string', '메인 컬러 (녹색)');

-- 8. 홈페이지 모듈 (site_id 2) - 기본 구조
INSERT OR IGNORE INTO homepage_modules (site_id, module_type, page, display_order, is_active, container_type) VALUES
(2, 'hero', 'home', 1, 1, 'full-width'),
(2, 'stats', 'home', 2, 1, 'container'),
(2, 'news', 'home', 3, 1, 'container'),
(2, 'text', 'about', 1, 1, 'container');

-- 9. 홈페이지 모듈 설정 (site_id 2)
-- Hero 섹션
INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'title', '건강한교육사역', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'hero' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'subtitle', '건강한 교육으로 밝은 미래를 만듭니다', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'hero' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'description', '학생 중심의 교육 철학으로 한 명 한 명의 성장을 돕습니다.', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'hero' AND page = 'home';

-- Stats 섹션
INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'stat1_number', '5', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'stat1_label', '교육 연수', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'stat2_number', '50+', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'stat2_label', '재학생', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'stat3_number', '10+', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'stats' AND page = 'home';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'stat3_label', '교직원', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'stats' AND page = 'home';

-- About 텍스트 모듈
INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'title', '학교 소개', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'text' AND page = 'about';

INSERT OR IGNORE INTO homepage_module_settings (site_id, module_id, setting_key, setting_value, setting_type)
SELECT 2, id, 'content', '건강한교육사역은 학생 한 명 한 명의 잠재력을 발견하고 키우는 교육을 실천합니다.

우리는 학생 중심의 교육 철학을 바탕으로, 개별 맞춤형 교육과 체험 중심 학습을 통해 학생들이 자신의 길을 찾아갈 수 있도록 돕습니다.

모든 학생이 건강하게 성장하고, 자신의 꿈을 이루어갈 수 있는 환경을 만들어가고 있습니다.', 'string'
FROM homepage_modules WHERE site_id = 2 AND module_type = 'text' AND page = 'about';

-- 10. 게시판 (site_id 2)
INSERT OR IGNORE INTO boards (site_id, name, description, board_type) VALUES
(2, '공지사항', '학교 공지사항', 'notice'),
(2, '자유게시판', '자유롭게 소통하는 공간', 'free');
