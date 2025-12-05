import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const subjects = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 라우트에 인증 적용
subjects.use('*', authMiddleware);

// ============================================
// 과목 목록 조회 (학년/학기 필터링 지원)
// ============================================
subjects.get('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const grade = c.req.query('grade');
  const subject_type = c.req.query('subject_type');

  let query = `
    SELECT
      s.*,
      t.id as teacher_table_id,
      t.subject as teacher_subject,
      u.name as teacher_name,
      u.id as teacher_user_id
    FROM subjects s
    LEFT JOIN teachers t ON s.teacher_id = t.id AND t.site_id = ?
    LEFT JOIN users u ON t.user_id = u.id AND u.site_id = ?
    WHERE s.site_id = ?
  `;
  const params: any[] = [siteId, siteId, siteId];

  if (grade) {
    query += ' AND s.grade = ?';
    params.push(parseInt(grade));
  }

  if (subject_type) {
    query += ' AND s.subject_type = ?';
    params.push(subject_type);
  }

  query += ' ORDER BY s.grade, s.name';

  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ subjects: results });
});

// ============================================
// 특정 과목 조회
// ============================================
subjects.get('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');

  const result = await db.prepare(`
    SELECT
      s.*,
      t.id as teacher_table_id,
      t.subject as teacher_subject,
      u.name as teacher_name,
      u.id as teacher_user_id
    FROM subjects s
    LEFT JOIN teachers t ON s.teacher_id = t.id AND t.site_id = ?
    LEFT JOIN users u ON t.user_id = u.id AND u.site_id = ?
    WHERE s.id = ? AND s.site_id = ?
  `).bind(siteId, siteId, id, siteId).first();

  if (!result) {
    return c.json({ error: '과목을 찾을 수 없습니다' }, 404);
  }

  return c.json({ subject: result });
});

// ============================================
// 과목 생성 (+ 자동으로 수업 생성)
// ============================================
subjects.post('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { name, code, description, credits, subject_type, grade, performance_ratio, written_ratio, teacher_id } = await c.req.json();

  // 필수 필드 검증
  if (!name || !code) {
    return c.json({ error: '과목명과 과목코드는 필수입니다' }, 400);
  }

  try {
    // 1. 과목 생성
    const result = await db.prepare(`
      INSERT INTO subjects (
        name, code, description, credits, subject_type,
        grade, performance_ratio, written_ratio, teacher_id, site_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      code,
      description || null,
      credits || 1,
      subject_type || 'required',
      grade || null,
      performance_ratio || 40,
      written_ratio || 60,
      teacher_id || null,
      siteId
    ).run();

    const subjectId = result.meta.last_row_id;

    // 2. 현재 활성 학기 조회
    const activeSemester = await db.prepare(`
      SELECT id FROM semesters WHERE is_current = 1 AND site_id = ? LIMIT 1
    `).bind(siteId).first() as any;

    // 3. 담당 교사가 있고 활성 학기가 있으면 자동으로 수업(course) 생성
    if (activeSemester && teacher_id) {
      const courseName = `${grade ? grade + '학년 ' : ''}${name}`;
      await db.prepare(`
        INSERT INTO courses (subject_id, semester_id, teacher_id, course_name, max_students, site_id)
        VALUES (?, ?, ?, ?, 30, ?)
      `).bind(subjectId, activeSemester.id, teacher_id, courseName, siteId).run();
    }

    return c.json({
      message: '과목이 생성되었습니다',
      id: subjectId
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
// 과목 수정 (+ 연결된 수업도 업데이트)
// ============================================
subjects.put('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');
  const { name, code, description, credits, subject_type, grade, performance_ratio, written_ratio, teacher_id } = await c.req.json();

  try {
    // 1. 과목 수정
    const result = await db.prepare(`
      UPDATE subjects
      SET name = ?, code = ?, description = ?, credits = ?,
          subject_type = ?, grade = ?, performance_ratio = ?, written_ratio = ?, teacher_id = ?
      WHERE id = ? AND site_id = ?
    `).bind(
      name,
      code,
      description || null,
      credits || 1,
      subject_type || 'required',
      grade || null,
      performance_ratio || 40,
      written_ratio || 60,
      teacher_id || null,
      id,
      siteId
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ error: '과목을 찾을 수 없습니다' }, 404);
    }

    // 2. 현재 활성 학기 조회
    const activeSemester = await db.prepare(`
      SELECT id FROM semesters WHERE is_current = 1 AND site_id = ? LIMIT 1
    `).bind(siteId).first() as any;

    if (activeSemester) {
      // 3. 이 과목의 현재 학기 수업이 있는지 확인
      const existingCourse = await db.prepare(`
        SELECT id FROM courses WHERE subject_id = ? AND semester_id = ? AND site_id = ?
      `).bind(id, activeSemester.id, siteId).first() as any;

      if (existingCourse) {
        // 기존 수업이 있으면 교사 정보 업데이트
        const courseName = `${grade ? grade + '학년 ' : ''}${name}`;
        await db.prepare(`
          UPDATE courses SET teacher_id = ?, course_name = ? WHERE id = ? AND site_id = ?
        `).bind(teacher_id || null, courseName, existingCourse.id, siteId).run();
      } else if (teacher_id) {
        // 기존 수업이 없고 담당 교사가 지정되면 새로 생성
        const courseName = `${grade ? grade + '학년 ' : ''}${name}`;
        await db.prepare(`
          INSERT INTO courses (subject_id, semester_id, teacher_id, course_name, max_students, site_id)
          VALUES (?, ?, ?, ?, 30, ?)
        `).bind(id, activeSemester.id, teacher_id, courseName, siteId).run();
      }
    }

    return c.json({ message: '과목이 수정되었습니다' });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: '이미 존재하는 과목 코드입니다' }, 400);
    }
    console.error('과목 수정 오류:', error);
    return c.json({ error: `과목 수정 중 오류: ${error.message || error}` }, 500);
  }
});

// ============================================
// 과목 삭제
// ============================================
subjects.delete('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    const result = await db.prepare('DELETE FROM subjects WHERE id = ? AND site_id = ?').bind(id, siteId).run();

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
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;

  const { results } = await db.prepare(`
    SELECT
      grade,
      COUNT(*) as total,
      SUM(CASE WHEN subject_type = 'required' THEN 1 ELSE 0 END) as required_count,
      SUM(CASE WHEN subject_type = 'elective' THEN 1 ELSE 0 END) as elective_count
    FROM subjects
    WHERE grade IS NOT NULL AND site_id = ?
    GROUP BY grade
    ORDER BY grade
  `).bind(siteId).all();

  return c.json({ statistics: results });
});

export default subjects;
