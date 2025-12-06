import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// 수상 목록 조회 (특정 학생 또는 전체)
app.get('/', authMiddleware, async (c) => {
  const { DB } = c.env;
  const siteId = c.get('siteId') || 1;
  const studentId = c.req.query('student_id');
  const semesterId = c.req.query('semester_id');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    let query = `
      SELECT
        a.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM awards a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN semesters sem ON a.semester_id = sem.id
      WHERE a.site_id = ? AND a.deleted_at IS NULL
    `;
    const params: any[] = [siteId];

    if (studentId) {
      query += ` AND a.student_id = ?`;
      params.push(studentId);
    }

    if (semesterId) {
      query += ` AND a.semester_id = ?`;
      params.push(semesterId);
    }

    query += ` ORDER BY a.award_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await DB.prepare(query).bind(...params).all();

    // 전체 개수 조회
    let countQuery = `SELECT COUNT(*) as total FROM awards WHERE site_id = ? AND deleted_at IS NULL`;
    const countParams: any[] = [siteId];

    if (studentId) {
      countQuery += ` AND student_id = ?`;
      countParams.push(studentId);
    }

    if (semesterId) {
      countQuery += ` AND semester_id = ?`;
      countParams.push(semesterId);
    }

    const countResult = await DB.prepare(countQuery).bind(...countParams).first();

    return c.json({
      awards: result.results || [],
      total: countResult?.total || 0,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('수상 목록 조회 실패:', error);
    return c.json({ error: '수상 목록 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 특정 수상 조회
app.get('/:id', authMiddleware, async (c) => {
  const { DB } = c.env;
  const siteId = c.get('siteId') || 1;
  const id = c.req.param('id');

  try {
    const result = await DB.prepare(`
      SELECT
        a.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM awards a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN semesters sem ON a.semester_id = sem.id
      WHERE a.id = ? AND a.site_id = ? AND a.deleted_at IS NULL
    `).bind(id, siteId).first();

    if (!result) {
      return c.json({ error: '수상 정보를 찾을 수 없습니다.' }, 404);
    }

    return c.json(result);
  } catch (error: any) {
    console.error('수상 조회 실패:', error);
    return c.json({ error: '수상 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 수상 추가
app.post('/', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const { DB } = c.env;
  const siteId = c.get('siteId') || 1;

  try {
    const body = await c.req.json();
    const {
      student_id,
      semester_id,
      award_name,
      award_category,
      award_level,
      award_date,
      organizer,
      description
    } = body;

    // 필수 필드 검증
    if (!student_id || !semester_id || !award_name || !award_date) {
      return c.json({
        error: '필수 필드가 누락되었습니다. (student_id, semester_id, award_name, award_date)'
      }, 400);
    }

    const result = await DB.prepare(`
      INSERT INTO awards (
        site_id, student_id, semester_id, award_name, award_category,
        award_level, award_date, organizer, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      siteId,
      student_id,
      semester_id,
      award_name,
      award_category || null,
      award_level || null,
      award_date,
      organizer || null,
      description || null
    ).run();

    if (!result.success) {
      throw new Error('수상 추가 실패');
    }

    return c.json({
      message: '수상이 추가되었습니다.',
      id: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('수상 추가 실패:', error);
    return c.json({ error: '수상 추가 중 오류가 발생했습니다.' }, 500);
  }
});

// 수상 수정
app.put('/:id', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const { DB } = c.env;
  const siteId = c.get('siteId') || 1;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const {
      award_name,
      award_category,
      award_level,
      award_date,
      organizer,
      description
    } = body;

    const result = await DB.prepare(`
      UPDATE awards
      SET
        award_name = COALESCE(?, award_name),
        award_category = COALESCE(?, award_category),
        award_level = COALESCE(?, award_level),
        award_date = COALESCE(?, award_date),
        organizer = COALESCE(?, organizer),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND site_id = ?
    `).bind(
      award_name || null,
      award_category || null,
      award_level || null,
      award_date || null,
      organizer || null,
      description || null,
      id,
      siteId
    ).run();

    if (!result.success) {
      throw new Error('수상 수정 실패');
    }

    return c.json({ message: '수상이 수정되었습니다.' });
  } catch (error: any) {
    console.error('수상 수정 실패:', error);
    return c.json({ error: '수상 수정 중 오류가 발생했습니다.' }, 500);
  }
});

// 수상 삭제 - Soft Delete
app.delete('/:id', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const { DB } = c.env;
  const siteId = c.get('siteId') || 1;
  const id = c.req.param('id');

  try {
    const result = await DB.prepare('UPDATE awards SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?').bind(id, siteId).run();

    if (!result.success) {
      throw new Error('수상 삭제 실패');
    }

    return c.json({ message: '수상이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('수상 삭제 실패:', error);
    return c.json({ error: '수상 삭제 중 오류가 발생했습니다.' }, 500);
  }
});

// 학생별 수상 통계
app.get('/stats/by-student/:studentId', authMiddleware, async (c) => {
  const { DB } = c.env;
  const siteId = c.get('siteId') || 1;
  const studentId = c.req.param('studentId');

  try {
    const result = await DB.prepare(`
      SELECT
        COUNT(*) as total_awards,
        award_category,
        COUNT(*) as count
      FROM awards
      WHERE student_id = ? AND site_id = ? AND deleted_at IS NULL
      GROUP BY award_category
    `).bind(studentId, siteId).all();

    return c.json({
      student_id: studentId,
      statistics: result.results || []
    });
  } catch (error: any) {
    console.error('수상 통계 조회 실패:', error);
    return c.json({ error: '수상 통계 조회 중 오류가 발생했습니다.' }, 500);
  }
});

export default app;
