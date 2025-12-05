import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const courses = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 라우트에 인증 적용
courses.use('*', authMiddleware);

// ============================================
// 수업 목록 조회 (과목+학기+교사+반 조인)
// ============================================
courses.get('/', async (c) => {
  const db = c.env.DB;
  const semester_id = c.req.query('semester_id');
  const class_id = c.req.query('class_id');
  const teacher_id = c.req.query('teacher_id');
  const subject_id = c.req.query('subject_id');
  const student_id = c.req.query('student_id');
  
  try {
    let query = `
      SELECT 
        c.*,
        s.name as subject_name,
        s.code as subject_code,
        s.credits,
        s.grade as subject_grade,
        sem.name as semester_name,
        u.name as teacher_name,
        cl.name as class_name,
        cl.grade as class_grade
      FROM courses c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN semesters sem ON c.semester_id = sem.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN classes cl ON c.class_id = cl.id
    `;
    
    const params: any[] = [];
    
    // 학생 ID가 있으면 enrollments 테이블과 조인
    if (student_id) {
      query += `
        INNER JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ?
      `;
      params.push(parseInt(student_id));
    } else {
      query += ' WHERE 1=1';
    }
    
    if (semester_id) {
      query += ' AND c.semester_id = ?';
      params.push(parseInt(semester_id));
    }
    
    if (class_id) {
      query += ' AND c.class_id = ?';
      params.push(parseInt(class_id));
    }
    
    if (teacher_id) {
      query += ' AND c.teacher_id = ?';
      params.push(parseInt(teacher_id));
    }
    
    if (subject_id) {
      query += ' AND c.subject_id = ?';
      params.push(parseInt(subject_id));
    }
    
    query += ' ORDER BY cl.grade, cl.name, s.name';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ courses: results || [] });
  } catch (error: any) {
    console.error('수업 목록 조회 오류:', error);
    return c.json({ error: '수업 목록 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 특정 수업 조회
// ============================================
courses.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const result = await db.prepare(`
      SELECT 
        c.*,
        s.name as subject_name,
        s.code as subject_code,
        s.credits,
        s.grade as subject_grade,
        sem.name as semester_name,
        u.name as teacher_name,
        cl.name as class_name,
        cl.grade as class_grade
      FROM courses c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN semesters sem ON c.semester_id = sem.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE c.id = ?
    `).bind(id).first();
    
    if (!result) {
      return c.json({ error: '수업을 찾을 수 없습니다' }, 404);
    }
    
    return c.json(result);
  } catch (error: any) {
    console.error('수업 조회 오류:', error);
    return c.json({ error: '수업 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 수업 생성
// ============================================
courses.post('/', async (c) => {
  const db = c.env.DB;
  const { subject_id, semester_id, teacher_id, class_id, course_name, schedule, max_students } = await c.req.json();
  
  // 필수 필드 검증
  if (!subject_id || !semester_id || !teacher_id || !course_name) {
    return c.json({ 
      error: '필수 필드가 누락되었습니다 (subject_id, semester_id, teacher_id, course_name)' 
    }, 400);
  }
  
  try {
    const result = await db.prepare(`
      INSERT INTO courses (
        subject_id, semester_id, teacher_id, class_id, 
        course_name, schedule, max_students, site_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      subject_id,
      semester_id,
      teacher_id,
      class_id || null,
      course_name,
      schedule || null,
      max_students || 30
    ).run();
    
    const courseId = result.meta.last_row_id;
    
    // class_id가 있으면 해당 반의 학생들을 자동으로 수업에 등록
    if (class_id) {
      const students = await db.prepare(`
        SELECT student_id FROM student_class_history 
        WHERE class_id = ? AND semester_id = ? AND is_active = 1
      `).bind(class_id, semester_id).all();
      
      for (const student of students.results as any[]) {
        await db.prepare(`
          INSERT OR IGNORE INTO enrollments (student_id, course_id, site_id)
          VALUES (?, ?, 1)
        `).bind(student.student_id, courseId).run();
      }
    }
    
    return c.json({ 
      message: '수업이 생성되었습니다',
      id: courseId 
    }, 201);
  } catch (error: any) {
    console.error('수업 생성 오류:', error);
    return c.json({ error: `수업 생성 중 오류: ${error.message}` }, 500);
  }
});

// ============================================
// 수업 수정
// ============================================
courses.put('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { subject_id, semester_id, teacher_id, class_id, course_name, schedule, max_students } = await c.req.json();
  
  try {
    const result = await db.prepare(`
      UPDATE courses 
      SET subject_id = ?, semester_id = ?, teacher_id = ?, class_id = ?,
          course_name = ?, schedule = ?, max_students = ?
      WHERE id = ?
    `).bind(
      subject_id,
      semester_id,
      teacher_id,
      class_id || null,
      course_name,
      schedule || null,
      max_students || 30,
      id
    ).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: '수업을 찾을 수 없습니다' }, 404);
    }
    
    return c.json({ message: '수업이 수정되었습니다' });
  } catch (error: any) {
    console.error('수업 수정 오류:', error);
    return c.json({ error: '수업 수정 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 수업 삭제
// ============================================
courses.delete('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const result = await db.prepare('DELETE FROM courses WHERE id = ?').bind(id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: '수업을 찾을 수 없습니다' }, 404);
    }
    
    return c.json({ message: '수업이 삭제되었습니다' });
  } catch (error: any) {
    console.error('수업 삭제 오류:', error);
    return c.json({ error: '수업 삭제 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 반별 수업 통계
// ============================================
courses.get('/stats/by-class/:classId', async (c) => {
  const db = c.env.DB;
  const classId = c.req.param('classId');
  
  try {
    const { results } = await db.prepare(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(DISTINCT c.subject_id) as unique_subjects,
        COUNT(DISTINCT c.teacher_id) as unique_teachers
      FROM courses c
      WHERE c.class_id = ?
    `).bind(classId).all();
    
    return c.json({ 
      class_id: classId,
      statistics: results?.[0] || {}
    });
  } catch (error: any) {
    console.error('수업 통계 조회 오류:', error);
    return c.json({ error: '수업 통계 조회 중 오류가 발생했습니다' }, 500);
  }
});

export default courses;
