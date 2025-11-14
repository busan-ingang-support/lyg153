-- Step 4: 출석, 성적, 상담, 봉사활동 기록

-- 출석 기록 (100건)
INSERT INTO attendance (enrollment_id, attendance_date, status, recorded_by)
SELECT 
  e.id,
  date('2024-11-0' || (1 + ABS(RANDOM()) % 7)),
  CASE ABS(RANDOM()) % 10
    WHEN 0 THEN 'absent'
    WHEN 1 THEN 'late'
    WHEN 2 THEN 'excused'
    ELSE 'present'
  END,
  1
FROM enrollments e
LIMIT 100;

-- 성적 기록 (100건)
INSERT INTO grades (enrollment_id, exam_type, score, exam_date, recorded_by)
SELECT 
  e.id,
  'midterm',
  60 + ABS(RANDOM()) % 41,
  '2024-10-15',
  1
FROM enrollments e
LIMIT 100;

-- 상담 기록 (20건)
INSERT INTO counseling_records (student_id, counselor_id, counseling_date, counseling_type, title, content)
SELECT 
  s.id,
  1,
  date('2024-10-' || (10 + ABS(RANDOM()) % 20)),
  CASE ABS(RANDOM()) % 5
    WHEN 0 THEN 'academic'
    WHEN 1 THEN 'career'
    WHEN 2 THEN 'personal'
    WHEN 3 THEN 'behavior'
    ELSE 'family'
  END,
  '학생 상담',
  '상담 내용 기록'
FROM students s
LIMIT 20;

-- 봉사활동 (20건)
INSERT INTO volunteer_activities (student_id, activity_name, organization, hours, activity_date, category, status)
SELECT 
  s.id,
  '봉사활동',
  '봉사기관',
  4,
  date('2024-10-15'),
  'community',
  'approved'
FROM students s
LIMIT 20;
