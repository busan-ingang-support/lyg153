import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const schedules = new Hono<{ Bindings: CloudflareBindings }>();

// ============================================
// 시간표 목록 조회 (반별/요일별)
// ============================================
schedules.get('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const class_id = c.req.query('class_id');
  const day_of_week = c.req.query('day_of_week');

  try {
    let query = `
      SELECT
        sch.*,
        c.course_name,
        s.name as subject_name,
        s.code as subject_code,
        u.name as teacher_name,
        cl.name as class_name
      FROM schedules sch
      LEFT JOIN courses c ON sch.course_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN subjects s ON c.subject_id = s.id AND s.deleted_at IS NULL
      LEFT JOIN teachers t ON c.teacher_id = t.id AND t.deleted_at IS NULL
      LEFT JOIN users u ON t.user_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN classes cl ON sch.class_id = cl.id AND cl.deleted_at IS NULL
      WHERE sch.site_id = ? AND sch.deleted_at IS NULL
    `;

    const params: any[] = [siteId];

    if (class_id) {
      query += ' AND sch.class_id = ?';
      params.push(parseInt(class_id));
    }

    if (day_of_week) {
      query += ' AND sch.day_of_week = ?';
      params.push(day_of_week);
    }

    query += ' ORDER BY sch.day_of_week, sch.period';

    const { results } = await db.prepare(query).bind(...params).all();

    return c.json({ schedules: results || [] });
  } catch (error: any) {
    console.error('시간표 조회 오류:', error);
    return c.json({ error: '시간표 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 반별 주간 시간표 조회 (그리드 형태)
// ============================================
schedules.get('/weekly/:classId', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const classId = c.req.param('classId');

  try {
    const { results } = await db.prepare(`
      SELECT
        sch.*,
        c.course_name,
        s.name as subject_name,
        s.code as subject_code,
        u.name as teacher_name
      FROM schedules sch
      LEFT JOIN courses c ON sch.course_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN subjects s ON c.subject_id = s.id AND s.deleted_at IS NULL
      LEFT JOIN teachers t ON c.teacher_id = t.id AND t.deleted_at IS NULL
      LEFT JOIN users u ON t.user_id = u.id AND u.deleted_at IS NULL
      WHERE sch.class_id = ? AND sch.site_id = ? AND sch.deleted_at IS NULL
      ORDER BY sch.day_of_week, sch.period
    `).bind(classId, siteId).all();
    
    // 요일별, 교시별로 그룹화
    const weekDays = ['월', '화', '수', '목', '금'];
    const schedule: any = {};
    
    weekDays.forEach(day => {
      schedule[day] = {};
      for (let period = 1; period <= 7; period++) {
        schedule[day][period] = null;
      }
    });
    
    (results || []).forEach((item: any) => {
      if (schedule[item.day_of_week]) {
        schedule[item.day_of_week][item.period] = item;
      }
    });
    
    return c.json({ 
      class_id: classId,
      schedule: schedule 
    });
  } catch (error: any) {
    console.error('주간 시간표 조회 오류:', error);
    return c.json({ error: '주간 시간표 조회 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 시간표 항목 생성/수정 (Upsert)
// ============================================
schedules.post('/', async (c) => {
  const db = c.env.DB;
  const { class_id, course_id, day_of_week, period, room_number } = await c.req.json();
  
  // 필수 필드 검증
  if (!class_id || !course_id || !day_of_week || !period) {
    return c.json({ 
      error: '필수 필드가 누락되었습니다 (class_id, course_id, day_of_week, period)' 
    }, 400);
  }
  
  // 요일 검증
  const validDays = ['월', '화', '수', '목', '금'];
  if (!validDays.includes(day_of_week)) {
    return c.json({ error: '유효하지 않은 요일입니다' }, 400);
  }
  
  // 교시 검증
  if (period < 1 || period > 7) {
    return c.json({ error: '교시는 1~7 사이여야 합니다' }, 400);
  }
  
  try {
    const siteId = c.get('siteId') || 1;

    // 기존 시간표 확인 (같은 반, 요일, 교시)
    const existing = await db.prepare(`
      SELECT id FROM schedules
      WHERE class_id = ? AND day_of_week = ? AND period = ? AND site_id = ? AND deleted_at IS NULL
    `).bind(class_id, day_of_week, period, siteId).first();

    if (existing) {
      // 업데이트
      await db.prepare(`
        UPDATE schedules
        SET course_id = ?, room_number = ?
        WHERE id = ? AND site_id = ?
      `).bind(course_id, room_number || null, existing.id, siteId).run();

      return c.json({
        message: '시간표가 수정되었습니다',
        id: existing.id
      });
    } else {
      // 삽입
      const result = await db.prepare(`
        INSERT INTO schedules (site_id, class_id, course_id, day_of_week, period, room_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(siteId, class_id, course_id, day_of_week, period, room_number || null).run();

      return c.json({
        message: '시간표가 생성되었습니다',
        id: result.meta.last_row_id
      }, 201);
    }
  } catch (error: any) {
    console.error('시간표 저장 오류:', error);
    return c.json({ error: '시간표 저장 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 시간표 항목 삭제
// ============================================
schedules.delete('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    const result = await db.prepare('UPDATE schedules SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?').bind(id, siteId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: '시간표 항목을 찾을 수 없습니다' }, 404);
    }

    return c.json({ message: '시간표 항목이 삭제되었습니다' });
  } catch (error: any) {
    console.error('시간표 삭제 오류:', error);
    return c.json({ error: '시간표 삭제 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 특정 시간표 항목 삭제 (반, 요일, 교시로)
// ============================================
schedules.delete('/slot/:classId/:dayOfWeek/:period', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const classId = c.req.param('classId');
  const dayOfWeek = c.req.param('dayOfWeek');
  const period = c.req.param('period');

  try {
    const result = await db.prepare(`
      UPDATE schedules
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE class_id = ? AND day_of_week = ? AND period = ? AND site_id = ?
    `).bind(classId, dayOfWeek, period, siteId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: '시간표 항목을 찾을 수 없습니다' }, 404);
    }

    return c.json({ message: '시간표 항목이 삭제되었습니다' });
  } catch (error: any) {
    console.error('시간표 삭제 오류:', error);
    return c.json({ error: '시간표 삭제 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 시간표 충돌 체크
// ============================================
schedules.post('/check-conflict', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { teacher_id, day_of_week, period, exclude_class_id } = await c.req.json();

  try {
    let query = `
      SELECT
        sch.*,
        cl.name as class_name,
        c.course_name
      FROM schedules sch
      LEFT JOIN courses c ON sch.course_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN classes cl ON sch.class_id = cl.id AND cl.deleted_at IS NULL
      WHERE c.teacher_id = ?
        AND sch.day_of_week = ?
        AND sch.period = ?
        AND sch.site_id = ?
        AND sch.deleted_at IS NULL
    `;

    const params: any[] = [teacher_id, day_of_week, period, siteId];

    if (exclude_class_id) {
      query += ' AND sch.class_id != ?';
      params.push(exclude_class_id);
    }

    const { results } = await db.prepare(query).bind(...params).all();

    return c.json({
      has_conflict: (results?.length || 0) > 0,
      conflicts: results || []
    });
  } catch (error: any) {
    console.error('충돌 체크 오류:', error);
    return c.json({ error: '충돌 체크 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 교시별 시간 정보 조회
// ============================================
schedules.get('/periods', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;

  try {
    const { results } = await db.prepare(`
      SELECT * FROM schedule_periods
      WHERE is_active = 1 AND site_id = ? AND deleted_at IS NULL
      ORDER BY period_number
    `).bind(siteId).all();

    return c.json({ periods: results || [] });
  } catch (error: any) {
    console.error('교시 시간 조회 오류:', error);
    return c.json({ error: '교시 시간 조회 중 오류가 발생했습니다' }, 500);
  }
});

export default schedules;
