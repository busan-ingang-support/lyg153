import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { verifyToken } from '../utils/auth';

const boards = new Hono<{ Bindings: CloudflareBindings }>();

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
// 게시판 목록 조회
// ============================================
boards.get('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const board_type = c.req.query('board_type');
  const target_id = c.req.query('target_id');

  try {
    let query = 'SELECT * FROM boards WHERE is_active = 1 AND site_id = ?';
    const params: any[] = [siteId];

    if (board_type) {
      query += ' AND board_type = ?';
      params.push(board_type);
    }

    if (target_id) {
      query += ' AND target_id = ?';
      params.push(target_id);
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await db.prepare(query).bind(...params).all();

    return c.json({ boards: results || [] });
  } catch (error: any) {
    console.error('게시판 조회 오류:', error);
    return c.json({ error: '게시판 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 게시글 목록 조회
// ============================================
boards.get('/posts', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const board_id = c.req.query('board_id');
  const board_type = c.req.query('board_type');
  const is_notice = c.req.query('is_notice');
  const limit = c.req.query('limit') || '20';
  const offset = c.req.query('offset') || '0';

  try {
    let query = `
      SELECT
        bp.*,
        u.name as author_name,
        b.name as board_name,
        b.board_type,
        c.subject_id,
        s.name as subject_name
      FROM board_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN boards b ON bp.board_id = b.id
      LEFT JOIN courses c ON b.target_id = c.id AND b.board_type = 'course'
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE bp.is_deleted = 0 AND bp.site_id = ?
    `;
    const params: any[] = [siteId];

    if (board_id) {
      query += ' AND bp.board_id = ?';
      params.push(board_id);
    }

    if (board_type) {
      query += ' AND b.board_type = ?';
      params.push(board_type);
    }

    if (is_notice) {
      query += ' AND bp.is_notice = ?';
      params.push(is_notice);
    }

    // 공지사항은 교사(teacher) 또는 관리자(admin, super_admin)가 작성한 글만
    if (is_notice === '1') {
      query += ' AND u.role IN (\'teacher\', \'admin\', \'super_admin\')';
    }

    query += ' ORDER BY bp.is_notice DESC, bp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const { results } = await db.prepare(query).bind(...params).all();

    return c.json({ posts: results || [] });
  } catch (error: any) {
    console.error('게시글 조회 오류:', error);
    return c.json({ error: '게시글 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 게시글 상세 조회
// ============================================
boards.get('/posts/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    // 조회수 증가
    await db.prepare('UPDATE board_posts SET view_count = view_count + 1 WHERE id = ? AND site_id = ?').bind(id, siteId).run();

    // 게시글 조회
    const post = await db.prepare(`
      SELECT
        bp.*,
        u.name as author_name,
        b.name as board_name,
        b.board_type
      FROM board_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN boards b ON bp.board_id = b.id
      WHERE bp.id = ? AND bp.is_deleted = 0 AND bp.site_id = ?
    `).bind(id, siteId).first();

    if (!post) {
      return c.json({ error: '게시글을 찾을 수 없습니다' }, 404);
    }

    // 댓글 조회
    const { results: comments } = await db.prepare(`
      SELECT
        bc.*,
        u.name as author_name
      FROM board_comments bc
      LEFT JOIN users u ON bc.author_id = u.id
      WHERE bc.post_id = ? AND bc.is_deleted = 0 AND bc.site_id = ?
      ORDER BY bc.created_at ASC
    `).bind(id, siteId).all();

    return c.json({
      post,
      comments: comments || []
    });
  } catch (error: any) {
    console.error('게시글 상세 조회 오류:', error);
    return c.json({ error: '게시글 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 게시글 작성
// ============================================
boards.post('/posts', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { board_id, title, content, is_notice } = await c.req.json();
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }

  if (!board_id || !title || !content) {
    return c.json({ error: '필수 필드가 누락되었습니다' }, 400);
  }

  try {
    // JWT 토큰에서 사용자 정보 추출
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
    }

    const author_id = payload.userId;
    const user_role = payload.role;

    // 학생은 공지사항을 작성할 수 없음
    if (is_notice === 1 && user_role === 'student') {
      return c.json({ error: '학생은 공지사항을 작성할 수 없습니다' }, 403);
    }

    const result = await db.prepare(`
      INSERT INTO board_posts (board_id, author_id, title, content, is_notice, site_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(board_id, author_id, title, content, is_notice || 0, siteId).run();

    return c.json({
      message: '게시글이 작성되었습니다',
      id: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('게시글 작성 오류:', error);
    return c.json({ error: '게시글 작성 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 댓글 작성
// ============================================
boards.post('/comments', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { post_id, content, parent_comment_id } = await c.req.json();
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }

  if (!post_id || !content) {
    return c.json({ error: '필수 필드가 누락되었습니다' }, 400);
  }

  try {
    // JWT 토큰에서 사용자 ID 추출
    const author_id = await getUserIdFromToken(token);
    if (!author_id) {
      return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
    }

    const result = await db.prepare(`
      INSERT INTO board_comments (post_id, author_id, content, parent_comment_id, site_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(post_id, author_id, content, parent_comment_id || null, siteId).run();

    return c.json({
      message: '댓글이 작성되었습니다',
      id: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('댓글 작성 오류:', error);
    return c.json({ error: '댓글 작성 중 오류가 발생했습니다' }, 500);
  }
});

export default boards;
