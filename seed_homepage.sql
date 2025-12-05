-- 학교소개 페이지에 교장 인사말 모듈 추가
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', -1, 1, 'container');

-- 교장 인사말 설정
INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about'), 'title', '교장 인사말', 'string'),
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about'), 'content', '안녕하십니까, 대안학교 교장입니다.

우리 학교는 학생 한 명 한 명의 꿈과 잠재력을 발견하고 키워주는 것을 최우선 가치로 삼고 있습니다. 획일화된 교육이 아닌, 개인의 특성과 관심사를 존중하는 맞춤형 교육을 통해 학생들이 자신만의 길을 찾아갈 수 있도록 돕고 있습니다.

소규모 학급 운영을 통해 교사와 학생 간의 긴밀한 소통이 가능하며, 이를 바탕으로 학생들의 학업, 진로, 인성 발달을 종합적으로 지원합니다. 또한 다양한 체험활동과 프로젝트 학습을 통해 실생활에서 필요한 역량을 기를 수 있도록 하고 있습니다.

앞으로도 학생, 학부모, 교사가 함께 성장하는 행복한 학교를 만들어 가겠습니다.

감사합니다.', 'string');

-- 학교 연혁 모듈 추가
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 10, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 10), 'title', '학교 연혁', 'string'),
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 10), 'content', '2024
• 3월 - 제4회 입학식 (신입생 30명)
• 5월 - 전국 과학탐구대회 장려상 수상
• 6월 - 교육부 대안교육 우수기관 선정

2023
• 3월 - 제3회 입학식 (신입생 28명)
• 7월 - 신축 교사 준공
• 11월 - 대안교육 네트워크 MOU 체결

2022
• 3월 - 제2회 입학식 (신입생 25명)
• 9월 - 특성화 교육과정 개편
• 12월 - 제1회 졸업식 (졸업생 20명)

2021
• 3월 - 제1회 입학식 (신입생 20명)
• 5월 - 교육부 대안학교 인가
• 9월 - 동아리 활동 시작

2020
• 6월 - 학교법인 설립
• 10월 - 학교 설립 인가
• 12월 - 교사 채용 완료', 'string');

-- 교훈 모듈 추가
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 11, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 11), 'title', '교훈', 'string'),
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 11), 'content', '사랑 (Love)
서로를 존중하고 배려하며, 더불어 살아가는 공동체를 만듭니다.

지혜 (Wisdom)
올바른 판단력과 비판적 사고력을 갖춘 인재를 양성합니다.

섬김 (Service)
이웃과 사회를 위해 봉사하고 헌신하는 정신을 기릅니다.', 'string');

-- 학교 시설 모듈 추가
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 12, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) VALUES
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 12), 'title', '학교 시설', 'string'),
((SELECT MAX(id) FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 12), 'content', '■ 교실
• 일반교실 6개
• 과학실험실 1개
• 음악실 1개
• 미술실 1개
• 컴퓨터실 1개

■ 체육시설
• 다목적 체육관
• 운동장
• 탁구대 및 배드민턴 코트

■ 편의시설
• 도서관
• 급식실
• 상담실
• 휴게공간', 'string');

