-- students 테이블에 학생 상세정보 추가 (user_id는 서브쿼리로 조회)
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

-- teachers 테이블에 교사 상세정보 추가
INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) 
SELECT id, 'T2024003', '영어', '2024-03-01', '교사', '영어과' FROM users WHERE username = 'teacher3';

INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) 
SELECT id, 'T2024004', '과학', '2024-03-01', '교사', '과학과' FROM users WHERE username = 'teacher4';

INSERT OR IGNORE INTO teachers (user_id, teacher_number, subject, hire_date, position, department) 
SELECT id, 'T2024005', '체육', '2024-03-01', '교사', '체육과' FROM users WHERE username = 'teacher5';

