import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { verifyToken } from '../utils/auth';

const courseQna = new Hono<{ Bindings: CloudflareBindings }>();

// 토큰에서 사용자 ID 추출 헬퍼
async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    const payload = await verifyToken(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

// ============================================
// Q&A 목록 조회
// ============================================
courseQna.get('/', async (c) => {
  const db = c.env.DB;
  const course_id = c.req.query('course_id');
  const student_id = c.req.query('student_id');
  const status = c.req.query('status');
  
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const currentUserId = token ? await getUserIdFromToken(token) : null;
  
  try {
    let query = `
      SELECT 
        qna.*,
        c.course_name,
        s.name as subject_name,
        st.student_number,
        u_student.name as student_name,
        u_teacher.name as teacher_name
      FROM course_qna qna
      LEFT JOIN courses c ON qna.course_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN students st ON qna.student_id = st.id
      LEFT JOIN users u_student ON st.user_id = u_student.id
      LEFT JOIN teachers t ON qna.answered_by = t.id
      LEFT JOIN users u_teacher ON t.user_id = u_teacher.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (course_id) {
      query += ' AND qna.course_id = ?';
      params.push(course_id);
    }
    
    if (student_id) {
      query += ' AND qna.student_id = ?';
      params.push(student_id);
    }
    
    if (status) {
      query += ' AND qna.status = ?';
      params.push(status);
    }
    
    // 비공개 질문은 본인 또는 교사만 볼 수 있음
    if (currentUserId) {
      // 학생인 경우: 본인 질문만, 또는 공개 질문
      // 교사인 경우: 모든 질문
      // TODO: 역할 확인 로직 추가
    }
    
    query += ' ORDER BY qna.created_at DESC';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ qnas: results || [] });
  } catch (error: any) {
    console.error('Q&A 조회 오류:', error);
    return c.json({ error: 'Q&A 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// Q&A 상세 조회
// ============================================
courseQna.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const qna = await db.prepare(`
      SELECT 
        qna.*,
        c.course_name,
        s.name as subject_name,
        st.student_number,
        u_student.name as student_name,
        u_teacher.name as teacher_name
      FROM course_qna qna
      LEFT JOIN courses c ON qna.course_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN students st ON qna.student_id = st.id
      LEFT JOIN users u_student ON st.user_id = u_student.id
      LEFT JOIN teachers t ON qna.answered_by = t.id
      LEFT JOIN users u_teacher ON t.user_id = u_teacher.id
      WHERE qna.id = ?
    `).bind(id).first();
    
    if (!qna) {
      return c.json({ error: 'Q&A를 찾을 수 없습니다' }, 404);
    }
    
    return c.json({ qna });
  } catch (error: any) {
    console.error('Q&A 상세 조회 오류:', error);
    return c.json({ error: 'Q&A 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 질문 작성
// ============================================
courseQna.post('/', async (c) => {
  const db = c.env.DB;
  const { course_id, title, question, is_private } = await c.req.json();
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }
  
  if (!course_id || !title || !question) {
    return c.json({ error: '필수 필드가 누락되었습니다' }, 400);
  }
  
  try {
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
    }
    
    // 학생 정보 조회
    const student = await db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).bind(userId).first();
    
    if (!student) {
      return c.json({ error: '학생 정보를 찾을 수 없습니다' }, 404);
    }
    
    const result = await db.prepare(`
      INSERT INTO course_qna (course_id, student_id, title, question, is_private, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).bind(course_id, student.id, title, question, is_private || 0).run();
    
    return c.json({ 
      message: '질문이 등록되었습니다',
      id: result.meta.last_row_id 
    }, 201);
  } catch (error: any) {
    console.error('질문 작성 오류:', error);
    return c.json({ error: '질문 작성 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 답변 작성 (교사용)
// ============================================
courseQna.post('/:id/answer', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { answer } = await c.req.json();
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }
  
  if (!answer) {
    return c.json({ error: '답변 내용이 필요합니다' }, 400);
  }
  
  try {
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
    }
    
    // 교사 정보 조회
    const teacher = await db.prepare(
      'SELECT id FROM teachers WHERE user_id = ?'
    ).bind(userId).first();
    
    if (!teacher) {
      return c.json({ error: '교사 정보를 찾을 수 없습니다' }, 403);
    }
    
    // Q&A 업데이트
    await db.prepare(`
      UPDATE course_qna 
      SET answer = ?, answered_by = ?, answered_at = CURRENT_TIMESTAMP, status = 'answered'
      WHERE id = ?
    `).bind(answer, teacher.id, id).run();
    
    return c.json({ message: '답변이 등록되었습니다' });
  } catch (error: any) {
    console.error('답변 작성 오류:', error);
    return c.json({ error: '답변 작성 중 오류가 발생했습니다' }, 500);
  }
});

export default courseQna;

