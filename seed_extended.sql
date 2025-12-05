-- ========================================
-- 확장 테스트 데이터 (seed_extended.sql)
-- 외래키 의존성을 고려한 순서로 정렬
-- ========================================

-- ========================================
-- 1. 추가 교사 계정
-- ========================================
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('teacher3', 'teacher123', 'teacher3@school.com', '박선생', 'teacher', '010-4567-1111'),
  ('teacher4', 'teacher123', 'teacher4@school.com', '정선생', 'teacher', '010-5678-2222'),
  ('teacher5', 'teacher123', 'teacher5@school.com', '한선생', 'teacher', '010-6789-3333');

INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) 
SELECT id, 'T2024003', '영어', '2024-03-01', '교사', '영어과' FROM users WHERE username = 'teacher3';
INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) 
SELECT id, 'T2024004', '과학', '2024-03-01', '교사', '과학과' FROM users WHERE username = 'teacher4';
INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) 
SELECT id, 'T2024005', '체육', '2024-03-01', '교사', '체육과' FROM users WHERE username = 'teacher5';

-- ========================================
-- 2. 추가 학생 계정 (각 학년별)
-- ========================================

-- 1학년 추가 학생
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('student3', 'student123', 'student3@school.com', '김민준', 'student', '010-1111-0003'),
  ('student4', 'student123', 'student4@school.com', '이서연', 'student', '010-1111-0004'),
  ('student5', 'student123', 'student5@school.com', '박지훈', 'student', '010-1111-0005'),
  ('student6', 'student123', 'student6@school.com', '최수빈', 'student', '010-1111-0006');

-- 2학년 학생
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('student7', 'student123', 'student7@school.com', '정예준', 'student', '010-2222-0001'),
  ('student8', 'student123', 'student8@school.com', '강민서', 'student', '010-2222-0002'),
  ('student9', 'student123', 'student9@school.com', '조하준', 'student', '010-2222-0003'),
  ('student10', 'student123', 'student10@school.com', '윤지아', 'student', '010-2222-0004'),
  ('student11', 'student123', 'student11@school.com', '임도현', 'student', '010-2222-0005');

-- 3학년 학생
INSERT OR IGNORE INTO users (username, password_hash, email, name, role, phone) VALUES 
  ('student12', 'student123', 'student12@school.com', '한지호', 'student', '010-3333-0001'),
  ('student13', 'student123', 'student13@school.com', '서윤아', 'student', '010-3333-0002'),
  ('student14', 'student123', 'student14@school.com', '오승우', 'student', '010-3333-0003'),
  ('student15', 'student123', 'student15@school.com', '배소영', 'student', '010-3333-0004');

-- 학생 상세정보 등록 (각 학생별 개별 INSERT)
INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024003', 1, 1, '2024-03-01', 'enrolled', '서울시 송파구', '010-1111-1111' FROM users WHERE username = 'student3';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024004', 1, 1, '2024-03-01', 'enrolled', '서울시 강동구', '010-2222-2222' FROM users WHERE username = 'student4';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024005', 1, 2, '2024-03-01', 'enrolled', '서울시 마포구', '010-3333-3333' FROM users WHERE username = 'student5';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024006', 1, 2, '2024-03-01', 'enrolled', '서울시 영등포구', '010-4444-4444' FROM users WHERE username = 'student6';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024007', 2, 3, '2023-03-01', 'enrolled', '서울시 용산구', '010-5555-5555' FROM users WHERE username = 'student7';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024008', 2, 3, '2023-03-01', 'enrolled', '서울시 중구', '010-6666-6666' FROM users WHERE username = 'student8';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024009', 2, 3, '2023-03-01', 'enrolled', '서울시 종로구', '010-7777-7777' FROM users WHERE username = 'student9';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024010', 2, 3, '2023-03-01', 'enrolled', '서울시 동작구', '010-8888-8888' FROM users WHERE username = 'student10';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024011', 2, 3, '2023-03-01', 'enrolled', '서울시 관악구', '010-9999-9999' FROM users WHERE username = 'student11';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024012', 3, 3, '2022-03-01', 'enrolled', '서울시 서대문구', '010-1010-1010' FROM users WHERE username = 'student12';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024013', 3, 3, '2022-03-01', 'enrolled', '서울시 은평구', '010-2020-2020' FROM users WHERE username = 'student13';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024014', 3, 3, '2022-03-01', 'enrolled', '서울시 성북구', '010-3030-3030' FROM users WHERE username = 'student14';

INSERT OR IGNORE INTO students (user_id, student_number, grade, class_id, admission_date, status, address, emergency_contact) 
SELECT id, 'S2024015', 3, 3, '2022-03-01', 'enrolled', '서울시 노원구', '010-4040-4040' FROM users WHERE username = 'student15';

-- ========================================
-- 3. 동아리 추가
-- ========================================
INSERT OR IGNORE INTO clubs (name, description, advisor_teacher_id, semester_id, max_members) VALUES 
  ('축구부', '축구를 통한 체력 단련과 팀워크 향상', 
   (SELECT id FROM teachers WHERE teacher_number = 'T2024005'), 1, 20),
  ('미술 동아리', '다양한 미술 기법을 배우고 작품 활동', 
   (SELECT id FROM teachers WHERE teacher_number = 'T2024001'), 1, 15),
  ('과학 탐구반', '실험과 연구를 통한 과학적 사고력 향상', 
   (SELECT id FROM teachers WHERE teacher_number = 'T2024002'), 1, 15);

-- ========================================
-- 4. 봉사활동 기록
-- ========================================
INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '지역 환경정화 활동', '강남구청', '2024-04-15', 4, 'environment', '강남구 공원 환경 정화 및 쓰레기 수거 활동', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '어르신 돌봄 봉사', '사랑의 집', '2024-05-10', 3, 'welfare', '요양원 어르신들과 함께하는 말벗 봉사', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '도서관 정리 봉사', '강남도서관', '2024-04-20', 2, 'community', '도서관 책 정리 및 서가 정돈', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student2';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '교통안전 캠페인', '서울경찰청', '2024-05-05', 3, 'community', '학교 앞 교통안전 캠페인 참여', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student3';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '유기동물 돌봄', '동물보호센터', '2024-05-15', 4, 'welfare', '유기동물 돌봄 및 청소 봉사', 'pending', NULL
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student4';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '벽화 그리기', '마포구', '2024-06-01', 6, 'community', '마을 담장 벽화 그리기 참여', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student5';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '독거노인 도시락 배달', '대한적십자사', '2024-04-25', 3, 'welfare', '독거노인 가정에 도시락 배달', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student7';

INSERT OR IGNORE INTO volunteer_activities (student_id, activity_name, organization, activity_date, hours, category, description, status, approved_by) 
SELECT s.id, '환경정화 활동', '용산구청', '2024-05-20', 4, 'environment', '한강공원 환경 정화 활동', 'approved', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student8';

-- ========================================
-- 5. 수상 기록
-- ========================================
INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '교내 수학 경시대회 금상', '학업우수상', '교내', '2024-05-15', '대안학교', '교내 수학 경시대회에서 우수한 성적을 거둠'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '봉사활동 우수상', '봉사상', '교내', '2024-06-20', '대안학교', '1학기 봉사활동 시간 및 태도 우수'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '영어 말하기 대회 은상', '학업우수상', '교내', '2024-05-20', '대안학교', '영어 말하기 대회 준우승'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student2';

INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '전국 과학 탐구 대회 장려상', '학업우수상', '전국', '2024-06-10', '과학기술정보통신부', '전국 과학 탐구 대회 우수 연구'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student3';

INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '미술 실기대회 최우수상', '예술상', '지역', '2024-05-25', '강남구', '강남구 청소년 미술 실기대회 최우수'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student4';

INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '독서왕 선정', '학업우수상', '교내', '2024-06-15', '대안학교', '1학기 가장 많은 도서를 읽고 독서록 작성'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student7';

INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) 
SELECT s.id, 1, '체육대회 MVP', '체육상', '교내', '2024-05-30', '대안학교', '교내 체육대회 최우수 선수상'
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student8';

-- ========================================
-- 6. 독서활동 기록
-- ========================================
INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '어린 왕자', '앙투안 드 생텍쥐페리', '문학동네', '2024-04-10', 120, '필독', '사막에 불시착한 비행사가 어린 왕자를 만나는 이야기', '순수한 마음의 중요성을 깨달았습니다.', 5
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '데미안', '헤르만 헤세', '민음사', '2024-05-05', 280, '선택', '싱클레어의 자아 발견 여정', '자신을 찾아가는 과정이 인상 깊었습니다.', 4
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '해리포터와 마법사의 돌', 'J.K. 롤링', '문학수첩', '2024-04-15', 350, '선택', '해리포터가 호그와트에 입학하는 이야기', '마법 세계가 흥미진진했습니다.', 5
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student2';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '코스모스', '칼 세이건', '사이언스북스', '2024-04-20', 480, '추천', '우주와 인류의 역사', '우주에 대한 경이로움을 느꼈습니다.', 5
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student3';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '앵무새 죽이기', '하퍼 리', '열린책들', '2024-05-10', 380, '필독', '미국 남부의 인종차별 문제', '정의와 용기에 대해 생각하게 되었습니다.', 4
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student4';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '1984', '조지 오웰', '민음사', '2024-05-15', 320, '선택', '전체주의 사회에 대한 경고', '현대 사회에 대한 경각심을 일깨워주었습니다.', 4
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student5';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '노인과 바다', '어니스트 헤밍웨이', '문학동네', '2024-04-25', 150, '필독', '늙은 어부의 투쟁 이야기', '포기하지 않는 정신이 감동적이었습니다.', 5
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student7';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '사피엔스', '유발 하라리', '김영사', '2024-05-20', 550, '추천', '인류의 역사와 미래', '인류 역사를 새로운 시각으로 보게 되었습니다.', 5
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student7';

INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, summary, review, rating) 
SELECT s.id, 1, '아몬드', '손원평', '창비', '2024-05-25', 260, '선택', '감정을 느끼지 못하는 소년의 이야기', '감정의 소중함을 깨달았습니다.', 4
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student8';

-- ========================================
-- 7. 상담 내역
-- ========================================
INSERT OR IGNORE INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content, follow_up_needed) 
SELECT s.id, 1, '2024-04-10', 'academic', '진로 상담', '학생이 관심 있는 분야에 대해 상담. 수학과 과학에 흥미가 있어 이공계 진학 희망.', 0
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student1';

INSERT OR IGNORE INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content, follow_up_needed) 
SELECT s.id, 1, '2024-04-15', 'personal', '교우관계 상담', '친구들과의 관계에서 어려움을 겪고 있음. 대화 기술 향상 필요.', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student2';

INSERT OR IGNORE INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content, follow_up_needed) 
SELECT s.id, 2, '2024-04-20', 'academic', '학습 방법 상담', '영어 학습에 어려움을 겪고 있어 효과적인 학습 방법 안내.', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student3';

INSERT OR IGNORE INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content, follow_up_needed) 
SELECT s.id, 1, '2024-05-05', 'career', '진로 탐색', '예술 분야에 관심이 많아 미술대학 진학 희망. 포트폴리오 준비 안내.', 0
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student5';

INSERT OR IGNORE INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content, follow_up_needed) 
SELECT s.id, 2, '2024-05-10', 'personal', '스트레스 관리', '학업 스트레스로 인한 불안감 호소. 스트레스 관리 방법 안내.', 1
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student7';

INSERT OR IGNORE INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content, follow_up_needed) 
SELECT s.id, 1, '2024-05-15', 'academic', '성적 향상 상담', '수학 성적 향상을 위한 학습 계획 수립.', 0
FROM students s JOIN users u ON s.user_id = u.id WHERE u.username = 'student8';

-- ========================================
-- 8. 홈페이지 모듈 보강 (학교소개 페이지)
-- ========================================

-- 교장 인사말 (display_order를 -1로 해서 맨 앞에 오게)
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', -1, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'title', '교장 인사말', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = -1;

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'content', '안녕하십니까, 대안학교 교장입니다.

우리 학교는 학생 한 명 한 명의 꿈과 잠재력을 발견하고 키워주는 것을 최우선 가치로 삼고 있습니다. 획일화된 교육이 아닌, 개인의 특성과 관심사를 존중하는 맞춤형 교육을 통해 학생들이 자신만의 길을 찾아갈 수 있도록 돕고 있습니다.

소규모 학급 운영을 통해 교사와 학생 간의 긴밀한 소통이 가능하며, 이를 바탕으로 학생들의 학업, 진로, 인성 발달을 종합적으로 지원합니다. 또한 다양한 체험활동과 프로젝트 학습을 통해 실생활에서 필요한 역량을 기를 수 있도록 하고 있습니다.

앞으로도 학생, 학부모, 교사가 함께 성장하는 행복한 학교를 만들어 가겠습니다.

감사합니다.', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = -1;

-- 학교 연혁
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 10, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'title', '학교 연혁', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 10;

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'content', '2024
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
• 12월 - 교사 채용 완료', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 10;

-- 교훈
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 11, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'title', '교훈', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 11;

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'content', '사랑 (Love)
서로를 존중하고 배려하며, 더불어 살아가는 공동체를 만듭니다.

지혜 (Wisdom)
올바른 판단력과 비판적 사고력을 갖춘 인재를 양성합니다.

섬김 (Service)
이웃과 사회를 위해 봉사하고 헌신하는 정신을 기릅니다.', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 11;

-- 학교 시설
INSERT OR IGNORE INTO homepage_modules (module_type, page, display_order, is_active, container_type) VALUES
('text', 'about', 12, 1, 'container');

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'title', '학교 시설', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 12;

INSERT OR IGNORE INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type) 
SELECT id, 'content', '■ 교실
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
• 휴게공간', 'string' 
FROM homepage_modules WHERE module_type = 'text' AND page = 'about' AND display_order = 12;

-- ========================================
-- 9. 공지사항 테스트 데이터
-- ========================================
INSERT OR IGNORE INTO board_posts (board_id, author_id, title, content, is_notice, created_at) VALUES 
  (1, 1, '2024학년도 2학기 개학 안내', '안녕하세요. 2024학년도 2학기 개학을 안내드립니다.

개학일: 2024년 9월 2일(월)
등교시간: 오전 8시 30분

준비물:
1. 교과서 및 노트
2. 실내화
3. 급식비 납부 확인

문의사항은 담임선생님께 연락 바랍니다.', 1, '2024-08-20'),
  (1, 1, '교내 체육대회 안내', '2024년 봄 체육대회를 아래와 같이 개최합니다.

일시: 2024년 5월 25일(토)
장소: 학교 운동장

종목:
- 달리기 (100m, 200m)
- 줄다리기
- 계주
- 피구

많은 참여 바랍니다.', 1, '2024-05-10'),
  (1, 1, '여름방학 안내', '2024년 여름방학을 안내드립니다.

방학기간: 2024년 7월 20일 ~ 8월 25일

방학 중 주의사항:
1. 안전사고 예방
2. 규칙적인 생활습관 유지
3. 방학숙제 계획적 수행

건강한 여름방학 보내세요!', 1, '2024-07-15'),
  (1, 2, '독서 토론회 참가자 모집', '독서 동아리에서 독서 토론회 참가자를 모집합니다.

도서: 어린 왕자
일시: 매주 금요일 방과 후
장소: 도서관

관심 있는 학생은 도서관 담당 선생님께 신청해 주세요.', 0, '2024-04-25'),
  (1, 3, '과학탐구반 신입부원 모집', '과학탐구반에서 함께할 부원을 모집합니다.

활동내용:
- 주 1회 실험 활동
- 과학 경진대회 참가
- 과학관 견학

신청기간: 4월 1일 ~ 4월 15일
신청방법: 과학실에서 신청서 작성', 0, '2024-04-01');
