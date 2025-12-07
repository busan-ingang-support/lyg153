import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { hashPassword } from '../utils/auth';
import { requireRole } from '../middleware/auth';

const users = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 사용자 조회 (관리자 전용)
users.get('/', requireRole('admin', 'super_admin'), async (c) => {
  try {
    const db = c.env.DB;
    const siteId = c.get('siteId') || 1;
    const userRole = c.get('userRole');
    const { role, search, limit = 50, offset = 0 } = c.req.query();

    const params: any[] = [];
    let query: string;

    // teacher 역할인 경우 teachers 테이블과 조인하여 teacher_id 포함
    if (role === 'teacher') {
      query = `
        SELECT
          u.id,
          u.username,
          u.email,
          u.name,
          u.role,
          u.phone,
          u.is_active,
          u.created_at,
          u.site_id,
          t.id as teacher_id,
          t.subject as teacher_subject
        FROM users u
        LEFT JOIN teachers t ON u.id = t.user_id AND t.site_id = ?
        WHERE u.role = ? AND u.deleted_at IS NULL AND u.site_id = ?
      `;
      params.push(siteId, role, siteId);
    } else if (role) {
      // 특정 역할 필터링 (teacher 제외)
      query = 'SELECT id, username, email, name, role, phone, is_active, created_at, site_id FROM users WHERE deleted_at IS NULL AND role = ? AND site_id = ?';
      params.push(role, siteId);
    } else {
      // 전체 사용자 조회
      query = 'SELECT id, username, email, name, role, phone, is_active, created_at, site_id FROM users WHERE deleted_at IS NULL AND site_id = ?';
      params.push(siteId);
    }

    // 검색 조건 추가
    if (search) {
      if (role === 'teacher') {
        query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
      } else {
        query += ' AND (name LIKE ? OR email LIKE ? OR username LIKE ?)';
      }
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 정렬 및 페이징
    if (role === 'teacher') {
      query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    } else {
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    }
    params.push(Number(limit), Number(offset));

    const { results } = await db.prepare(query).bind(...params).all();

    return c.json({ users: results });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 특정 사용자 조회
users.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const siteId = c.get('siteId') || 1;
    const currentUser = c.get('user');

    // 자기 자신이 아니고, 관리자도 아니면 접근 거부
    if (currentUser?.userId != id && !['admin', 'super_admin'].includes(currentUser?.role)) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // 현재 사이트의 사용자만 조회 가능
    const user = await db.prepare(
      'SELECT id, username, email, name, role, phone, is_active, created_at, site_id FROM users WHERE id = ? AND site_id = ? AND deleted_at IS NULL'
    ).bind(id, siteId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 역할별 추가 정보 조회
    let additionalInfo: any = {};
    
    if (user.role === 'student') {
      const student = await db.prepare(
        'SELECT * FROM students WHERE user_id = ?'
      ).bind(id).first();
      
      if (student) {
        // 반 정보 조회
        if (student.class_id) {
          const classInfo = await db.prepare(
            'SELECT * FROM classes WHERE id = ?'
          ).bind(student.class_id).first();
          additionalInfo.class = classInfo;
        }
        additionalInfo.student = student;
      }
    } else if (user.role === 'teacher') {
      const teacher = await db.prepare(
        'SELECT * FROM teachers WHERE user_id = ?'
      ).bind(id).first();
      additionalInfo.teacher = teacher;
    } else if (user.role === 'parent') {
      const children = await db.prepare(`
        SELECT s.*, u.name as student_name, ps.relationship
        FROM parent_student ps
        JOIN students s ON ps.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ps.parent_user_id = ?
      `).bind(id).all();
      additionalInfo.children = children.results;
    }
    
    return c.json({ user, ...additionalInfo });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 새 사용자 생성 (관리자 전용)
users.post('/', requireRole('admin', 'super_admin'), async (c) => {
  try {
    const db = c.env.DB;
    const siteId = c.get('siteId') || 1;
    const { username, password, email, name, role, phone } = await c.req.json();

    if (!username || !password || !email || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const result = await db.prepare(
      'INSERT INTO users (username, password_hash, email, name, role, phone, site_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(username, passwordHash, email, name, role, phone || null, siteId).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create user' }, 500);
    }
    
    return c.json({ 
      message: 'User created successfully',
      userId: result.meta.last_row_id 
    }, 201);
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Username or email already exists' }, 409);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 정보 수정
users.put('/:id', requireRole('admin', 'super_admin'), async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const siteId = c.get('siteId') || 1;
    const { email, name, phone, is_active, password } = await c.req.json();

    const updates: string[] = [];
    const params: any[] = [];

    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }
    if (password !== undefined && password !== '') {
      updates.push('password_hash = ?');
      const passwordHash = await hashPassword(password);
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, siteId);

    // 현재 사이트의 사용자만 수정 가능
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND site_id = ?`;

    await db.prepare(updateQuery).bind(...params).run();
    
    return c.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 권한 변경 (최고관리자 전용)
users.put('/:id/role', requireRole('super_admin'), async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const siteId = c.get('siteId') || 1;
    const { role } = await c.req.json();

    if (!role) {
      return c.json({ error: 'Role is required' }, 400);
    }

    const validRoles = ['super_admin', 'admin', 'teacher', 'student', 'parent'];
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // 현재 사이트의 사용자만 권한 변경 가능
    await db.prepare(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?'
    ).bind(role, id, siteId).run();
    
    return c.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 삭제 (최고관리자 전용) - Soft Delete
users.delete('/:id', requireRole('super_admin'), async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const siteId = c.get('siteId') || 1;

    // Soft delete: 현재 사이트의 사용자만 삭제 가능
    await db.prepare(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?'
    ).bind(id, siteId).run();

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default users;
