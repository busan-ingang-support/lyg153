import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const semesters = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 학기 조회
semesters.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { year } = c.req.query();
    
    let query = 'SELECT * FROM semesters WHERE 1=1';
    const params: any[] = [];
    
    if (year) {
      query += ' AND year = ?';
      params.push(Number(year));
    }
    
    query += ' ORDER BY year DESC, semester DESC';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ semesters: results });
  } catch (error) {
    console.error('Get semesters error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 현재 학기 조회
semesters.get('/current', async (c) => {
  try {
    const db = c.env.DB;
    
    const semester = await db.prepare(
      'SELECT * FROM semesters WHERE is_current = 1'
    ).first();
    
    if (!semester) {
      return c.json({ error: 'No current semester found' }, 404);
    }
    
    return c.json({ semester });
  } catch (error) {
    console.error('Get current semester error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 학기 생성 (관리자 전용)
semesters.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const { name, year, semester, start_date, end_date, is_current } = await c.req.json();
    
    if (!name || !year || !semester || !start_date || !end_date) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // 현재 학기로 설정하는 경우 다른 학기의 is_current를 0으로
    if (is_current) {
      await db.prepare('UPDATE semesters SET is_current = 0').run();
    }
    
    const result = await db.prepare(`
      INSERT INTO semesters (name, year, semester, start_date, end_date, is_current)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, year, semester, start_date, end_date, is_current ? 1 : 0).run();
    
    return c.json({
      message: 'Semester created successfully',
      semesterId: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('Create semester error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Semester already exists for this year' }, 409);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 학기 수정
semesters.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const { name, start_date, end_date, is_current } = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (start_date) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (end_date) {
      updates.push('end_date = ?');
      params.push(end_date);
    }
    if (is_current !== undefined) {
      // 현재 학기로 설정하는 경우 다른 학기의 is_current를 0으로
      if (is_current) {
        await db.prepare('UPDATE semesters SET is_current = 0').run();
      }
      updates.push('is_current = ?');
      params.push(is_current ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    params.push(id);
    
    await db.prepare(
      `UPDATE semesters SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();
    
    return c.json({ message: 'Semester updated successfully' });
  } catch (error) {
    console.error('Update semester error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default semesters;
