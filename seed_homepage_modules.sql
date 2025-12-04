-- 홈페이지 기본 모듈 추가 (학교 스타일)

-- 기존 데이터 삭제
DELETE FROM homepage_module_settings;
DELETE FROM homepage_slides;
DELETE FROM homepage_modules;

-- ========================================
-- 홈 페이지 모듈
-- ========================================

-- 1. 메인 배너
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('hero', 'home', 0, 1, 'full_width');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'hero' AND page = 'home'), 'title', '대안학교', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'hero' AND page = 'home'), 'subtitle', '꿈을 키우는 학교, 미래를 여는 교육', 'string');

-- 2. 바로가기 메뉴
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('quick_links', 'home', 1, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'quick_links' AND page = 'home'), 'links', '[{"icon":"fa-user-graduate","title":"입학안내","url":"#public-about","color":"blue"},{"icon":"fa-calendar-alt","title":"학사일정","url":"#","color":"green"},{"icon":"fa-utensils","title":"급식안내","url":"#","color":"orange"},{"icon":"fa-file-alt","title":"가정통신문","url":"#public-notice","color":"purple"}]', 'json');

-- 3. 공지사항
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('notice', 'home', 2, 1, 'container');

-- 4. 교훈/핵심가치
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('values', 'home', 3, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'section_title', '교훈', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value1_icon', 'fa-heart', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value1_title', '사랑', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value1_desc', '서로를 존중하고 배려하는 마음', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value2_icon', 'fa-book', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value2_title', '지혜', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value2_desc', '올바른 판단과 지식을 추구', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value3_icon', 'fa-hands-helping', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value3_title', '섬김', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'values' AND page = 'home'), 'value3_desc', '공동체를 위해 봉사하는 정신', 'string');

-- 5. 학교 특징
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('features', 'home', 4, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'section_title', '학교 특징', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature1_icon', 'fa-users', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature1_title', '소규모 학급', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature1_desc', '학급당 15~20명으로 구성된 소규모 학급 운영', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature2_icon', 'fa-chalkboard-teacher', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature2_title', '맞춤형 교육', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature2_desc', '학생 개개인의 특성과 진로에 맞춘 교육', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature3_icon', 'fa-hiking', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature3_title', '현장 체험', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature3_desc', '다양한 현장 체험을 통한 실천적 학습', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature4_icon', 'fa-palette', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature4_title', '예체능 교육', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'home'), 'feature4_desc', '음악, 미술, 체육 등 다양한 예체능 프로그램', 'string');

-- 6. 학교 현황 통계
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('stats', 'home', 5, 1, 'full_width');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat1_label', '재학생', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat1_value', '100', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat1_suffix', '명', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat2_label', '교원', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat2_value', '15', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat2_suffix', '명', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat3_label', '학급', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat3_value', '6', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat3_suffix', '개', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat4_label', '설립', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat4_value', '2020', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'stats' AND page = 'home'), 'stat4_suffix', '년', 'string');

-- ========================================
-- 학교소개 페이지 모듈
-- ========================================

-- 1. 교육 이념
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 0, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 0), 'title', '교육 이념', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 0), 'content', '우리 학교는 학생 한 명 한 명의 꿈과 가능성을 소중히 여기며, 서로 존중하고 배려하는 공동체를 만들어갑니다. 기독교 정신을 바탕으로 사랑과 지혜, 섬김의 가치를 실천하며, 미래 사회를 이끌어갈 창의적인 인재를 양성합니다.', 'string');

-- 2. 교육 목표
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 1, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 1), 'title', '교육 목표', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 1), 'content', '• 자기주도적 학습 능력 함양
• 창의적 문제해결 능력 개발
• 공동체 의식과 협력 정신
• 올바른 인성과 가치관 확립', 'string');

-- 3. 학교 갤러리
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('gallery', 'about', 2, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'gallery' AND page = 'about'), 'section_title', '학교 사진', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'gallery' AND page = 'about'), 'images', '[]', 'json');

-- ========================================
-- 교육과정 페이지 모듈
-- ========================================

-- 1. 교과 과정
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('features', 'education', 0, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'section_title', '교육 과정', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature1_icon', 'fa-book', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature1_title', '기초 교과', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature1_desc', '국어, 영어, 수학, 사회, 과학 등 기본 교과목 학습', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature2_icon', 'fa-palette', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature2_title', '예체능', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature2_desc', '음악, 미술, 체육 등 감성 계발 교육', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature3_icon', 'fa-leaf', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature3_title', '체험 학습', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature3_desc', '현장 견학, 봉사활동, 프로젝트 학습', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature4_icon', 'fa-users', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature4_title', '동아리 활동', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'features' AND page = 'education'), 'feature4_desc', '코딩, 음악, 미술, 스포츠 등 다양한 동아리', 'string');

-- 2. 특별 프로그램
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'education', 1, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'education'), 'title', '특별 프로그램', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'education'), 'content', '우리 학교는 정규 교과 외에도 다양한 특별 프로그램을 운영하고 있습니다. 학생들의 꿈과 재능을 발견하고 키워나갈 수 있도록 맞춤형 프로그램을 제공합니다.

• 진로 탐색 프로그램
• 독서 논술 교육
• 영어 캠프
• 문화예술 체험 활동', 'string');

-- ========================================
-- 공지사항 페이지 모듈
-- ========================================

INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('notice', 'notice', 0, 1, 'container');

-- ========================================
-- 오시는 길 페이지 모듈
-- ========================================

-- 1. 연락처/오시는 길
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('contact', 'location', 0, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'contact' AND page = 'location'), 'section_title', '오시는 길', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'contact' AND page = 'location'), 'phone', '02-000-0000', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'contact' AND page = 'location'), 'email', 'school@example.com', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'contact' AND page = 'location'), 'address', '서울시 강남구 테헤란로 123', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'contact' AND page = 'location'), 'map_embed', '', 'string');

-- 2. 방문 안내
INSERT INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'location', 1, 1, 'container');

INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'location'), 'title', '방문 안내', 'string'),
((SELECT id FROM homepage_modules WHERE module_type = 'text' AND page = 'location'), 'content', '학교 방문을 원하시는 경우, 사전에 전화로 예약해 주시기 바랍니다.

• 상담 가능 시간: 평일 오전 9시 ~ 오후 5시
• 점심시간: 오후 12시 ~ 1시
• 주말 및 공휴일 휴무

교통편 안내:
• 지하철: 2호선 강남역 3번 출구 도보 10분
• 버스: 간선버스 146, 740, 341 / 지선버스 3411, 4318', 'string');
