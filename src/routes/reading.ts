import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// 독서활동 목록 조회 (특정 학생 또는 전체)
app.get('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const studentId = c.req.query('student_id');
  const semesterId = c.req.query('semester_id');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    let query = `
      SELECT
        r.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM reading_activities r
      LEFT JOIN students s ON r.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN semesters sem ON r.semester_id = sem.id
      WHERE r.site_id = ?
    `;
    const params: any[] = [siteId];

    if (studentId) {
      query += ` AND r.student_id = ?`;
      params.push(studentId);
    }

    if (semesterId) {
      query += ` AND r.semester_id = ?`;
      params.push(semesterId);
    }

    query += ` ORDER BY r.read_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await DB.prepare(query).bind(...params).all();

    // 전체 개수 조회
    let countQuery = `SELECT COUNT(*) as total FROM reading_activities WHERE site_id = ?`;
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
      reading_activities: result.results || [],
      total: countResult?.total || 0,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('독서활동 목록 조회 실패:', error);
    return c.json({ error: '독서활동 목록 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 특정 독서활동 조회
app.get('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const id = c.req.param('id');

  try {
    const result = await DB.prepare(`
      SELECT
        r.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM reading_activities r
      LEFT JOIN students s ON r.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN semesters sem ON r.semester_id = sem.id
      WHERE r.id = ? AND r.site_id = ?
    `).bind(id, siteId).first();

    if (!result) {
      return c.json({ error: '독서활동 정보를 찾을 수 없습니다.' }, 404);
    }

    return c.json(result);
  } catch (error: any) {
    console.error('독서활동 조회 실패:', error);
    return c.json({ error: '독서활동 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 독서활동 추가
app.post('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;

  try {
    const body = await c.req.json();
    const {
      student_id,
      semester_id,
      book_title,
      author,
      publisher,
      read_date,
      pages,
      reading_type,
      summary,
      review,
      rating
    } = body;

    // 필수 필드 검증
    if (!student_id || !semester_id || !book_title || !read_date) {
      return c.json({
        error: '필수 필드가 누락되었습니다. (student_id, semester_id, book_title, read_date)'
      }, 400);
    }

    const result = await DB.prepare(`
      INSERT INTO reading_activities (
        site_id, student_id, semester_id, book_title, author, publisher,
        read_date, pages, reading_type, summary, review, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      siteId,
      student_id,
      semester_id,
      book_title,
      author || null,
      publisher || null,
      read_date,
      pages || null,
      reading_type || null,
      summary || null,
      review || null,
      rating || null
    ).run();

    if (!result.success) {
      throw new Error('독서활동 추가 실패');
    }

    return c.json({
      message: '독서활동이 추가되었습니다.',
      id: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('독서활동 추가 실패:', error);
    return c.json({ error: '독서활동 추가 중 오류가 발생했습니다.' }, 500);
  }
});

// 독서활동 수정
app.put('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const {
      book_title,
      author,
      publisher,
      read_date,
      pages,
      reading_type,
      summary,
      review,
      rating
    } = body;

    const result = await DB.prepare(`
      UPDATE reading_activities
      SET
        book_title = COALESCE(?, book_title),
        author = COALESCE(?, author),
        publisher = COALESCE(?, publisher),
        read_date = COALESCE(?, read_date),
        pages = COALESCE(?, pages),
        reading_type = COALESCE(?, reading_type),
        summary = COALESCE(?, summary),
        review = COALESCE(?, review),
        rating = COALESCE(?, rating),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND site_id = ?
    `).bind(
      book_title || null,
      author || null,
      publisher || null,
      read_date || null,
      pages || null,
      reading_type || null,
      summary || null,
      review || null,
      rating || null,
      id,
      siteId
    ).run();

    if (!result.success) {
      throw new Error('독서활동 수정 실패');
    }

    return c.json({ message: '독서활동이 수정되었습니다.' });
  } catch (error: any) {
    console.error('독서활동 수정 실패:', error);
    return c.json({ error: '독서활동 수정 중 오류가 발생했습니다.' }, 500);
  }
});

// 독서활동 삭제
app.delete('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const id = c.req.param('id');

  try {
    const result = await DB.prepare('DELETE FROM reading_activities WHERE id = ? AND site_id = ?').bind(id, siteId).run();

    if (!result.success) {
      throw new Error('독서활동 삭제 실패');
    }

    return c.json({ message: '독서활동이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('독서활동 삭제 실패:', error);
    return c.json({ error: '독서활동 삭제 중 오류가 발생했습니다.' }, 500);
  }
});

// 학생별 독서활동 통계
app.get('/stats/by-student/:studentId', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const studentId = c.req.param('studentId');

  try {
    const result = await DB.prepare(`
      SELECT
        COUNT(*) as total_books,
        SUM(pages) as total_pages,
        AVG(rating) as average_rating,
        reading_type,
        COUNT(*) as count
      FROM reading_activities
      WHERE student_id = ? AND site_id = ?
      GROUP BY reading_type
    `).bind(studentId, siteId).all();

    return c.json({
      student_id: studentId,
      statistics: result.results || []
    });
  } catch (error: any) {
    console.error('독서활동 통계 조회 실패:', error);
    return c.json({ error: '독서활동 통계 조회 중 오류가 발생했습니다.' }, 500);
  }
});

export default app;
