import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { verifyToken } from '../utils/auth';

const teacherPermissions = new Hono<{ Bindings: CloudflareBindings }>();

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
// 교사 권한 목록 조회
// ============================================
teacherPermissions.get('/', async (c) => {
  const db = c.env.DB;
  const teacher_id = c.req.query('teacher_id');
  
  try {
    let query = `
      SELECT 
        tp.*,
        u.name as granted_by_name
      FROM teacher_permissions tp
      LEFT JOIN users u ON tp.granted_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (teacher_id) {
      query += ' AND tp.teacher_id = ?';
      params.push(parseInt(teacher_id));
    }
    
    query += ' ORDER BY tp.granted_at DESC';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ permissions: results || [] });
  } catch (error: any) {
    console.error('교사 권한 조회 오류:', error);
    return c.json({ error: '교사 권한 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 교사 권한 부여 (관리자 전용)
// ============================================
teacherPermissions.post('/', async (c) => {
  const db = c.env.DB;
  const { teacher_id, permission_type } = await c.req.json();
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }
  
  if (!teacher_id || !permission_type) {
    return c.json({ error: '필수 필드가 누락되었습니다' }, 400);
  }
  
  try {
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
    }
    
    // 관리자 권한 확인
    const user = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return c.json({ error: '권한이 없습니다' }, 403);
    }
    
    // 권한 부여
    const result = await db.prepare(`
      INSERT OR REPLACE INTO teacher_permissions (teacher_id, permission_type, granted_by)
      VALUES (?, ?, ?)
    `).bind(teacher_id, permission_type, userId).run();
    
    return c.json({ 
      message: '권한이 부여되었습니다',
      id: result.meta.last_row_id 
    }, 201);
  } catch (error: any) {
    console.error('권한 부여 오류:', error);
    return c.json({ error: '권한 부여 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 교사 권한 제거 (관리자 전용)
// ============================================
teacherPermissions.delete('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }
  
  try {
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
    }
    
    // 관리자 권한 확인
    const user = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return c.json({ error: '권한이 없습니다' }, 403);
    }
    
    const result = await db.prepare('DELETE FROM teacher_permissions WHERE id = ?').bind(id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: '권한을 찾을 수 없습니다' }, 404);
    }
    
    return c.json({ message: '권한이 제거되었습니다' });
  } catch (error: any) {
    console.error('권한 제거 오류:', error);
    return c.json({ error: '권한 제거 중 오류가 발생했습니다' }, 500);
  }
});

export default teacherPermissions;

