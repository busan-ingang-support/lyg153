import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const subjects = new Hono<{ Bindings: CloudflareBindings }>();

// ============================================
// 과목 목록 조회 (학년/학기 필터링 지원)
// ============================================
subjects.get('/', async (c) => {
  const db = c.env.DB;
  const grade = c.req.query('grade');
  const subject_type = c.req.query('subject_type');
  
  let query = 'SELECT * FROM subjects WHERE 1=1';
  const params: any[] = [];
  
  if (grade) {
    query += ' AND grade = ?';
    params.push(parseInt(grade));
  }
  
  if (subject_type) {
    query += ' AND subject_type = ?';
    params.push(subject_type);
  }
  
  query += ' ORDER BY grade, name';
  
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ subjects: results });
});

// ============================================
// 특정 과목 조회
// ============================================
subjects.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  const result = await db.prepare('SELECT * FROM subjects WHERE id = ?').bind(id).first();
  
  if (!result) {
    return c.json({ error: '과목을 찾을 수 없습니다' }, 404);
  }
  
  return c.json(result);
});

// ============================================
// 과목 생성
// ============================================
subjects.post('/', async (c) => {
  const db = c.env.DB;
  const { name, code, description, credits, subject_type, grade, performance_ratio, written_ratio } = await c.req.json();
  
  // 필수 필드 검증
  if (!name || !code) {
    return c.json({ error: '과목명과 과목코드는 필수입니다' }, 400);
  }
  
  try {
    const result = await db.prepare(`
      INSERT INTO subjects (
        name, code, description, credits, subject_type, 
        grade, performance_ratio, written_ratio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name, 
      code, 
      description || null, 
      credits || 1, 
      subject_type || 'required',
      grade || null,
      performance_ratio || 40,
      written_ratio || 60
    ).run();
    
    return c.json({ 
      message: '과목이 생성되었습니다', 
      id: result.meta.last_row_id 
    }, 201);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: '이미 존재하는 과목 코드입니다' }, 400);
    }
    console.error('과목 생성 오류:', error);
    return c.json({ error: '과목 생성 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 과목 수정
// ============================================
subjects.put('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { name, code, description, credits, subject_type, grade, performance_ratio, written_ratio } = await c.req.json();
  
  try {
    const result = await db.prepare(`
      UPDATE subjects 
      SET name = ?, code = ?, description = ?, credits = ?, 
          subject_type = ?, grade = ?, performance_ratio = ?, written_ratio = ?
      WHERE id = ?
    `).bind(
      name, 
      code, 
      description || null, 
      credits || 1, 
      subject_type || 'required',
      grade || null,
      performance_ratio || 40,
      written_ratio || 60,
      id
    ).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: '과목을 찾을 수 없습니다' }, 404);
    }
    
    return c.json({ message: '과목이 수정되었습니다' });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: '이미 존재하는 과목 코드입니다' }, 400);
    }
    console.error('과목 수정 오류:', error);
    return c.json({ error: '과목 수정 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 과목 삭제
// ============================================
subjects.delete('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  try {
    const result = await db.prepare('DELETE FROM subjects WHERE id = ?').bind(id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: '과목을 찾을 수 없습니다' }, 404);
    }
    
    return c.json({ message: '과목이 삭제되었습니다' });
  } catch (error: any) {
    console.error('과목 삭제 오류:', error);
    return c.json({ error: '과목 삭제 중 오류가 발생했습니다' }, 500);
  }
});

// ============================================
// 학년별 과목 통계
// ============================================
subjects.get('/stats/by-grade', async (c) => {
  const db = c.env.DB;
  
  const { results } = await db.prepare(`
    SELECT 
      grade,
      COUNT(*) as total,
      SUM(CASE WHEN subject_type = 'required' THEN 1 ELSE 0 END) as required_count,
      SUM(CASE WHEN subject_type = 'elective' THEN 1 ELSE 0 END) as elective_count
    FROM subjects
    WHERE grade IS NOT NULL
    GROUP BY grade
    ORDER BY grade
  `).all();
  
  return c.json({ statistics: results });
});

export default subjects;
