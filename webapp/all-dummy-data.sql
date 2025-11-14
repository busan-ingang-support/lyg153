-- ============================================
-- 과목 데이터
-- ============================================
INSERT OR IGNORE INTO subjects (name, code, subject_type, credits, grade) VALUES
('국어', 'KOR01', 'required', 3, 1),
('영어', 'ENG01', 'required', 3, 1),
('수학', 'MAT01', 'required', 3, 1),
('과학', 'SCI01', 'required', 2, 1),
('역사', 'HIS01', 'required', 2, 1),
('음악', 'MUS01', 'elective', 2, 1),
('미술', 'ART01', 'elective', 2, 1),
('체육', 'PE01', 'required', 2, 1);

INSERT OR IGNORE INTO subjects (name, code, subject_type, credits, grade) VALUES
('국어', 'KOR02', 'required', 3, 2),
('영어', 'ENG02', 'required', 3, 2),
('수학', 'MAT02', 'required', 3, 2),
('과학', 'SCI02', 'required', 2, 2),
('사회', 'SOC02', 'required', 2, 2);

-- ============================================
-- 반 데이터 추가
-- ============================================
INSERT OR IGNORE INTO classes (name, grade, semester_id) VALUES
('1학년 1반', 1, 1),
('1학년 2반', 1, 1),
('2학년 1반', 2, 1),
('2학년 2반', 2, 1),
('3학년 1반', 3, 1);

-- 학생 class_id 업데이트로 반 배정
UPDATE students SET class_id = 1 WHERE id = 1;
UPDATE students SET class_id = 1 WHERE id = 2;
UPDATE students SET class_id = 2 WHERE id = 3;

-- ============================================
-- 수상기록 데이터 (award_category, award_level, organizer 사용)
-- ============================================
INSERT OR IGNORE INTO awards (student_id, semester_id, award_name, award_category, award_level, award_date, organizer, description) VALUES
(1, 1, '전교 1등', 'academic', 'school', '2024-06-15', '학교', '1학기 중간고사 전교 1등'),
(1, 1, '모범상', 'behavior', 'school', '2024-07-20', '학교', '모범적인 학교생활'),
(2, 1, '과학경시대회 금상', 'academic', 'regional', '2024-05-10', '교육청', '지역 과학경시대회 금상 수상'),
(2, 1, '봉사상', 'service', 'school', '2024-06-30', '학교', '꾸준한 봉사활동'),
(3, 1, '체육대회 우승', 'sports', 'school', '2024-05-25', '학교', '체육대회 축구부문 우승');

-- ============================================
-- 독서활동 데이터 (reading_type, summary 사용)
-- ============================================
INSERT OR IGNORE INTO reading_activities (student_id, semester_id, book_title, author, publisher, read_date, pages, reading_type, rating, summary, review) VALUES
(1, 1, '데미안', '헤르만 헤세', '민음사', '2024-04-10', 280, 'fiction', 5, '자아 찾기와 성장에 관한 이야기', '자아 정체성에 대해 깊이 생각해보게 된 책'),
(1, 1, '총균쇠', '재레드 다이아몬드', '문학사상', '2024-05-15', 752, 'non-fiction', 5, '문명의 발전과 지리적 요인', '문명의 발전 과정을 이해하는데 큰 도움이 됨'),
(2, 1, '어린왕자', '생텍쥐페리', '문학동네', '2024-04-05', 120, 'fiction', 4, '어른들을 위한 동화', '어른들에게 들려주는 동화'),
(2, 1, '코스모스', '칼 세이건', '사이언스북스', '2024-06-01', 650, 'science', 5, '우주와 인류의 역사', '우주에 대한 경외감을 느낌'),
(3, 1, '해리포터와 마법사의 돌', 'J.K. 롤링', '문학수첩', '2024-03-20', 360, 'fantasy', 5, '마법 세계의 모험', '재미있게 읽었음');

-- ============================================
-- 봉사활동 데이터
-- ============================================
INSERT OR IGNORE INTO volunteer_activities (student_id, semester_id, activity_name, organization, activity_type, activity_date, hours, location, description, recognition) VALUES
(1, 1, '지역아동센터 학습지도', '○○지역아동센터', '교육', '2024-04-10', 4.0, '지역아동센터', '초등학생 수학 학습 도움', '봉사활동확인서'),
(1, 1, '환경정화 활동', '학교', '환경', '2024-05-15', 2.0, '학교 주변', '학교 주변 쓰레기 줍기', '봉사활동확인서'),
(2, 1, '요양원 방문', '○○요양원', '복지', '2024-04-20', 3.0, '요양원', '어르신들과 대화 및 말벗', '봉사활동확인서'),
(2, 1, '헌혈 캠페인 도우미', '적십자사', '의료', '2024-06-05', 5.0, '헌혈의 집', '헌혈 캠페인 홍보 및 안내', '봉사활동확인서'),
(3, 1, '도서관 정리', '시립도서관', '문화', '2024-05-10', 4.0, '시립도서관', '도서 정리 및 반납 업무 보조', '봉사활동확인서');

-- ============================================
-- 상담기록 데이터
-- ============================================
INSERT OR IGNORE INTO counseling_records (student_id, semester_id, counseling_date, counseling_type, counselor_name, topic, content, follow_up, is_confidential) VALUES
(1, 1, '2024-03-15', '진로상담', '김선생님', '진로 고민', '대학 진학과 진로에 대한 상담. 이공계 진학을 희망하며 특히 컴퓨터공학에 관심이 많음.', '다음 상담 때 구체적인 대학 정보 제공 예정', 0),
(1, 1, '2024-05-20', '학업상담', '김선생님', '학업 스트레스', '시험 기간 스트레스 관리에 대한 상담. 효과적인 학습 방법과 휴식의 중요성 안내.', '꾸준한 관찰 필요', 0),
(2, 1, '2024-04-10', '교우관계', '이선생님', '친구 관계', '반 친구들과의 관계 개선에 대한 상담. 적극적인 소통의 중요성 강조.', '한 달 후 재상담', 0),
(3, 1, '2024-03-25', '진로상담', '박선생님', '진로 탐색', '운동선수의 꿈과 학업 병행에 대한 고민. 체육특기생 진학 경로 안내.', '체육 관련 진로 자료 제공 예정', 0),
(3, 1, '2024-06-15', '가정상담', '박선생님', '가정 환경', '가정 내 어려움에 대한 상담. 필요시 학교 지원 방안 모색.', '지속적인 관심과 지원 필요', 1);

-- ============================================
-- 모듈 설정 (수상, 독서, 봉사, 상담 활성화)
-- ============================================
INSERT OR IGNORE INTO module_settings (module_name, is_enabled, display_order) VALUES
('awards', 1, 1),
('reading', 1, 2),
('volunteer', 1, 3),
('counseling', 1, 4);
