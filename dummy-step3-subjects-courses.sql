-- Step 3: 수업 생성 (enrollments는 별도로)

-- 과정(Courses) 생성 - course_name 포함
INSERT INTO courses (semester_id, subject_id, teacher_id, course_name)
SELECT 1, subj.id, 
  CASE 
    WHEN subj.name = '국어' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024001' LIMIT 1)
    WHEN subj.name = '영어' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024001' LIMIT 1)
    WHEN subj.name = '수학' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024002' LIMIT 1)
    WHEN subj.name = '과학' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024004' LIMIT 1)
    WHEN subj.name = '사회' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024005' LIMIT 1)
    WHEN subj.name = '음악' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024006' LIMIT 1)
    WHEN subj.name = '미술' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024007' LIMIT 1)
    WHEN subj.name = '체육' THEN (SELECT id FROM teachers WHERE teacher_number = 'T2024008' LIMIT 1)
  END,
  subj.name || ' - 2024학년도 1학기'
FROM subjects subj
WHERE subj.id NOT IN (SELECT subject_id FROM courses WHERE semester_id = 1);
