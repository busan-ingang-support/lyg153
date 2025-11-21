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

export default grades;
