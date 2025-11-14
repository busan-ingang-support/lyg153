import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { verifyToken } from '../utils/auth';

const teachers = new Hono<{ Bindings: CloudflareBindings }>();

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
// 교사 생성 (관리자 전용)
// ============================================
teachers.post('/', async (c) => {
  const db = c.env.DB;
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }

  const userId = await getUserIdFromToken(token);
  if (!userId) {
    return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
  }

  // 관리자 권한 확인
  const user = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return c.json({ error: '권한이 없습니다' }, 403);
  }

  const { user_id, teacher_number, subject, hire_date, position, department } = await c.req.json();

  if (!user_id || !teacher_number) {
    return c.json({ error: 'user_id와 teacher_number는 필수입니다' }, 400);
  }

  // 사용자가 teacher 역할인지 확인
  const targetUser = await db.prepare('SELECT role FROM users WHERE id = ?').bind(user_id).first();
  if (!targetUser || targetUser.role !== 'teacher') {
    return c.json({ error: '해당 사용자는 교사 역할이 아닙니다' }, 400);
  }

  try {
    const result = await db.prepare(`
      INSERT INTO teachers (user_id, teacher_number, subject, hire_date, position, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user_id,
      teacher_number,
      subject || null,
      hire_date || null,
      position || null,
      department || null
    ).run();

    if (!result.success) {
      return c.json({ error: '교사 정보 생성에 실패했습니다' }, 500);
    }

    return c.json({
      message: '교사 정보가 생성되었습니다',
      id: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('교사 생성 오류:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: '이미 교사 정보가 존재하거나 teacher_number가 중복됩니다' }, 409);
    }
    return c.json({ error: '교사 정보 생성 중 오류가 발생했습니다' }, 500);
  }
});

export default teachers;

