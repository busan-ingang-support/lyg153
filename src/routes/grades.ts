import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { requireRole } from '../middleware/auth';

const grades = new Hono<{ Bindings: CloudflareBindings }>();

// 성적 조회
grades.get('/', async (c) => {
  const db = c.env.DB;
  const { student_id, course_id, semester_id } = c.req.query();
  
  let query = `
    SELECT g.*, e.student_id, e.course_id, s.student_number, u.name as student_name, 
           c.course_name, sub.name as subject_name
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.id
    JOIN students s ON e.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN courses c ON e.course_id = c.id
    JOIN subjects sub ON c.subject_id = sub.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (student_id) {
    query += ' AND e.student_id = ?';
    params.push(Number(student_id));
  }
  if (course_id) {
    query += ' AND e.course_id = ?';
    params.push(Number(course_id));
  }
  if (semester_id) {
    query += ' AND c.semester_id = ?';
    params.push(Number(semester_id));
  }
  
  query += ' ORDER BY g.exam_date DESC';
  
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ grades: results });
});

// 성적 입력 (교사, 관리자만 가능)
grades.post('/', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const { enrollment_id, exam_type, score, max_score, weight, exam_date, note, recorded_by } = await c.req.json();
  
  const result = await db.prepare(`
    INSERT INTO grades (enrollment_id, exam_type, score, max_score, weight, exam_date, note, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    enrollment_id,
    exam_type,
    score,
    max_score || 100,
    weight || 1.0,
    exam_date || null,
    note || null,
    recorded_by
  ).run();
  
  return c.json({ message: 'Grade recorded', gradeId: result.meta.last_row_id }, 201);
});

// 최종 성적 계산 및 저장 (교사, 관리자만 가능)
grades.post('/final', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const { enrollment_id, approved_by } = await c.req.json();

  // 모든 성적 조회
  const { results: allGrades } = await db.prepare(
    'SELECT * FROM grades WHERE enrollment_id = ?'
  ).bind(enrollment_id).all();

  // 가중 평균 계산
  let totalScore = 0;
  let totalWeight = 0;

  for (const grade of allGrades as any[]) {
    const normalizedScore = (grade.score / grade.max_score) * 100;
    totalScore += normalizedScore * grade.weight;
    totalWeight += grade.weight;
  }

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  // 등급 계산
  let letterGrade = 'F';
  if (finalScore >= 95) letterGrade = 'A+';
  else if (finalScore >= 90) letterGrade = 'A';
  else if (finalScore >= 85) letterGrade = 'B+';
  else if (finalScore >= 80) letterGrade = 'B';
  else if (finalScore >= 75) letterGrade = 'C+';
  else if (finalScore >= 70) letterGrade = 'C';
  else if (finalScore >= 65) letterGrade = 'D+';
  else if (finalScore >= 60) letterGrade = 'D';

  // 최종 성적 저장
  await db.prepare(`
    INSERT INTO final_grades (enrollment_id, total_score, letter_grade, approved_by, approved_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(enrollment_id)
    DO UPDATE SET total_score = ?, letter_grade = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
  `).bind(
    enrollment_id,
    finalScore,
    letterGrade,
    approved_by,
    finalScore,
    letterGrade,
    approved_by
  ).run();

  return c.json({ message: 'Final grade calculated', finalScore, letterGrade });
});

// 학생별 성적 조회 (학부모/학생/교사/관리자)
grades.get('/student/:student_id', async (c) => {
  const db = c.env.DB;
  const studentId = c.req.param('student_id');
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  // 권한 체크
  if (userRole === 'parent') {
    // 학부모: 자녀만 조회 가능
    const relation = await db.prepare(`
      SELECT id FROM parent_student WHERE parent_user_id = ? AND student_id = ? AND COALESCE(status, 1) = 1
    `).bind(userId, studentId).first();

    if (!relation) {
      return c.json({ error: 'Forbidden: Not your child' }, 403);
    }
  } else if (userRole === 'student') {
    // 학생: 본인만 조회 가능
    const student = await db.prepare(`
      SELECT id FROM students WHERE user_id = ? AND id = ?
    `).bind(userId, studentId).first();

    if (!student) {
      return c.json({ error: 'Forbidden: Not your record' }, 403);
    }
  }
  // 교사, 관리자, super_admin은 모두 조회 가능

  try {
    // 성적 조회
    const { results } = await db.prepare(`
      SELECT
        g.id,
        g.exam_type as type,
        g.score,
        g.max_score,
        g.weight,
        g.exam_date as date,
        g.note,
        c.course_name,
        sub.name as subject_name,
        sem.name as semester_name
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.id
      JOIN courses c ON e.course_id = c.id
      JOIN subjects sub ON c.subject_id = sub.id
      JOIN semesters sem ON c.semester_id = sem.id
      WHERE e.student_id = ?
      ORDER BY g.exam_date DESC, sub.name, g.exam_type
    `).bind(studentId).all();

    return c.json({ grades: results });
  } catch (error: any) {
    console.error('성적 조회 실패:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default grades;
