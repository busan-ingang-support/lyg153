import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const teachers = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 라우트에 인증 적용
teachers.use('*', authMiddleware);

// ============================================
// 교사 목록 조회
// ============================================
teachers.get('/', async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;

  try {
    const { results } = await db.prepare(`
      SELECT t.*, u.name, u.email, u.phone
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.site_id = ? AND COALESCE(t.status, 1) = 1
      ORDER BY t.teacher_number
    `).bind(siteId).all();

    return c.json({ teachers: results });
  } catch (error: any) {
    console.error('교사 목록 조회 오류:', error);
    return c.json({ error: '교사 목록 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 교사 상세 조회
// ============================================
teachers.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const siteId = c.get('siteId') || 1;

  try {
    const teacher = await db.prepare(`
      SELECT t.*, u.name, u.email, u.phone
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ? AND t.site_id = ? AND COALESCE(t.status, 1) = 1
    `).bind(id, siteId).first();

    if (!teacher) {
      return c.json({ error: '교사를 찾을 수 없습니다' }, 404);
    }

    return c.json({ teacher });
  } catch (error: any) {
    console.error('교사 조회 오류:', error);
    return c.json({ error: '교사 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 교사 생성 (관리자 전용)
// ============================================
teachers.post('/', requireRole('admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const { user_id, teacher_number, subject, hire_date, position, department } = await c.req.json();

  if (!user_id || !teacher_number) {
    return c.json({ error: 'user_id와 teacher_number는 필수입니다' }, 400);
  }

  // 사용자가 teacher 역할인지 확인
  const targetUser = await db.prepare('SELECT role FROM users WHERE id = ? AND site_id = ?').bind(user_id, siteId).first();
  if (!targetUser) {
    return c.json({ error: '해당 사용자를 찾을 수 없습니다' }, 404);
  }
  if (targetUser.role !== 'teacher') {
    return c.json({ error: '해당 사용자는 교사 역할이 아닙니다' }, 400);
  }

  try {
    const result = await db.prepare(`
      INSERT INTO teachers (user_id, teacher_number, subject, hire_date, position, department, site_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user_id,
      teacher_number,
      subject || null,
      hire_date || null,
      position || null,
      department || null,
      siteId
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

// ============================================
// 교사 정보 수정 (관리자 전용)
// ============================================
teachers.put('/:id', requireRole('admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const siteId = c.get('siteId') || 1;
  const { teacher_number, subject, hire_date, position, department } = await c.req.json();

  try {
    const result = await db.prepare(`
      UPDATE teachers
      SET teacher_number = ?, subject = ?, hire_date = ?, position = ?, department = ?
      WHERE id = ? AND site_id = ?
    `).bind(
      teacher_number,
      subject || null,
      hire_date || null,
      position || null,
      department || null,
      id,
      siteId
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ error: '교사를 찾을 수 없습니다' }, 404);
    }

    return c.json({ message: '교사 정보가 수정되었습니다' });
  } catch (error: any) {
    console.error('교사 수정 오류:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'teacher_number가 중복됩니다' }, 409);
    }
    return c.json({ error: '교사 정보 수정 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 교사 삭제 (Soft Delete) (관리자 전용)
// ============================================
teachers.delete('/:id', requireRole('admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const siteId = c.get('siteId') || 1;

  try {
    const result = await db.prepare(`
      UPDATE teachers
      SET status = 0
      WHERE id = ? AND site_id = ?
    `).bind(id, siteId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: '교사를 찾을 수 없습니다' }, 404);
    }

    return c.json({ message: '교사 정보가 삭제되었습니다' });
  } catch (error: any) {
    console.error('교사 삭제 오류:', error);
    return c.json({ error: '교사 정보 삭제 중 오류가 발생했습니다' }, 500);
  }
});

export default teachers;
