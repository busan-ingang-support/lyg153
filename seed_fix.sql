-- student_class_history에 신규 학생들 추가
INSERT OR IGNORE INTO student_class_history (student_id, class_id, semester_id, start_date, is_active) VALUES
  (3, 1, 1, '2024-03-01', 1),
  (4, 1, 1, '2024-03-01', 1),
  (5, 2, 1, '2024-03-01', 1),
  (6, 2, 1, '2024-03-01', 1),
  (7, 3, 1, '2023-03-01', 1),
  (8, 3, 1, '2023-03-01', 1),
  (9, 3, 1, '2023-03-01', 1),
  (10, 3, 1, '2023-03-01', 1),
  (11, 3, 1, '2023-03-01', 1),
  (12, 4, 1, '2022-03-01', 1),
  (13, 4, 1, '2022-03-01', 1),
  (14, 4, 1, '2022-03-01', 1),
  (15, 4, 1, '2022-03-01', 1);

-- teacher_homeroom에 담임 배정
INSERT OR IGNORE INTO teacher_homeroom (teacher_id, class_id, semester_id) VALUES
  (1, 1, 1),
  (2, 2, 1),
  (1, 3, 1),
  (1, 4, 1);

