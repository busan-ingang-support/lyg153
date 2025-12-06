import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const classes = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 라우트에 인증 적용
classes.use('*', authMiddleware);

// 모든 반 조회
classes.get('/', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { semester_id, grade, class_ids } = c.req.query();

  let query = `
    SELECT c.*, s.name as semester_name, u.name as teacher_name
    FROM classes c
    JOIN semesters s ON c.semester_id = s.id
    LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE c.site_id = ? AND s.site_id = ?
  `;
  const params: any[] = [siteId, siteId];

  if (semester_id) {
    query += ' AND c.semester_id = ?';
    params.push(Number(semester_id));
  }
  if (grade) {
    query += ' AND c.grade = ?';
    params.push(Number(grade));
  }
  if (class_ids) {
    // 쉼표로 구분된 class_ids 필터링
    const ids = class_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length > 0) {
      query += ` AND c.id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }
  }

  query += ' ORDER BY c.grade, c.name';

  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ classes: results });
});

// 반 상세 정보 (학생 수, 담임 교사 등)
classes.get('/:id', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');

  // 반 기본 정보
  const classInfo = await db.prepare(`
    SELECT
      c.*,
      s.name as semester_name,
      s.year,
      s.semester,
      s.is_current as semester_is_active
    FROM classes c
    JOIN semesters s ON c.semester_id = s.id
    WHERE c.id = ? AND c.site_id = ? AND s.site_id = ?
  `).bind(id, siteId, siteId).first();

  if (!classInfo) {
    return c.json({ error: 'Class not found' }, 404);
  }

  // 담임 교사 정보 (teacher_homeroom 테이블에서)
  const homeroomTeacher = await db.prepare(`
    SELECT
      th.*,
      u.name as teacher_name,
      u.email as teacher_email,
      t.subject as teacher_subject
    FROM teacher_homeroom th
    JOIN teachers t ON th.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    WHERE th.class_id = ? AND th.semester_id = ? AND th.site_id = ? AND t.site_id = ? AND u.site_id = ?
  `).bind(id, classInfo.semester_id, siteId, siteId, siteId).first();

  // 학생 수
  const studentCount = await db.prepare(`
    SELECT COUNT(*) as count
    FROM student_class_history
    WHERE class_id = ? AND semester_id = ? AND is_active = 1 AND site_id = ?
  `).bind(id, classInfo.semester_id, siteId).first();

  return c.json({
    class: {
      ...classInfo,
      homeroom_teacher: homeroomTeacher,
      student_count: studentCount?.count || 0
    }
  });
});

// 반 학생 목록 (student_class_history 기반)
classes.get('/:id/students', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');
  const { semester_id } = c.req.query();

  // 반 정보 확인
  const classInfo = await db.prepare(`
    SELECT semester_id FROM classes WHERE id = ? AND site_id = ?
  `).bind(id, siteId).first();

  if (!classInfo) {
    return c.json({ error: 'Class not found' }, 404);
  }

  const targetSemesterId = semester_id || classInfo.semester_id;

  const { results } = await db.prepare(`
    SELECT
      s.id as student_id,
      s.student_number,
      s.grade,
      s.status,
      u.name as student_name,
      u.email,
      u.phone,
      sch.start_date as class_start_date,
      sch.is_active as is_active_in_class
    FROM student_class_history sch
    JOIN students s ON sch.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE sch.class_id = ? AND sch.semester_id = ? AND sch.is_active = 1 AND sch.site_id = ? AND s.site_id = ? AND u.site_id = ?
    ORDER BY s.student_number
  `).bind(id, targetSemesterId, siteId, siteId, siteId).all();

  return c.json({ students: results });
});

// 반별 출석 현황
classes.get('/:id/attendance', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');
  const { date, start_date, end_date } = c.req.query();

  // 반 정보 확인
  const classInfo = await db.prepare(`
    SELECT semester_id FROM classes WHERE id = ? AND site_id = ?
  `).bind(id, siteId).first();

  if (!classInfo) {
    return c.json({ error: 'Class not found' }, 404);
  }

  let query = `
    SELECT
      a.*,
      s.student_number,
      u.name as student_name
    FROM attendance a
    JOIN enrollments e ON a.enrollment_id = e.id
    JOIN students s ON e.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN student_class_history sch ON s.id = sch.student_id
    WHERE sch.class_id = ?
      AND sch.semester_id = ?
      AND sch.is_active = 1
      AND a.site_id = ?
      AND e.site_id = ?
      AND s.site_id = ?
      AND u.site_id = ?
      AND sch.site_id = ?
  `;
  const params: any[] = [id, classInfo.semester_id, siteId, siteId, siteId, siteId, siteId];

  if (date) {
    query += ' AND a.attendance_date = ?';
    params.push(date);
  }
  if (start_date) {
    query += ' AND a.attendance_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND a.attendance_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY a.attendance_date DESC, s.student_number';

  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ attendance: results });
});

// 반별 성적 현황
classes.get('/:id/grades', async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');
  const { course_id } = c.req.query();

  // 반 정보 확인
  const classInfo = await db.prepare(`
    SELECT semester_id FROM classes WHERE id = ? AND site_id = ?
  `).bind(id, siteId).first();

  if (!classInfo) {
    return c.json({ error: 'Class not found' }, 404);
  }

  let query = `
    SELECT
      g.*,
      s.student_number,
      u.name as student_name,
      c.course_name,
      subj.name as subject_name
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.id
    JOIN students s ON e.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN courses c ON e.course_id = c.id
    JOIN subjects subj ON c.subject_id = subj.id
    JOIN student_class_history sch ON s.id = sch.student_id
    WHERE sch.class_id = ?
      AND sch.semester_id = ?
      AND sch.is_active = 1
      AND c.semester_id = ?
      AND g.site_id = ?
      AND e.site_id = ?
      AND s.site_id = ?
      AND u.site_id = ?
      AND c.site_id = ?
      AND subj.site_id = ?
      AND sch.site_id = ?
  `;
  const params: any[] = [id, classInfo.semester_id, classInfo.semester_id, siteId, siteId, siteId, siteId, siteId, siteId, siteId];

  if (course_id) {
    query += ' AND c.id = ?';
    params.push(course_id);
  }

  query += ' ORDER BY s.student_number, subj.name, g.exam_type';

  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ grades: results });
});

// 반 생성
classes.post('/', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { name, grade, semester_id, homeroom_teacher_id, room_number, max_students } = await c.req.json();

  const result = await db.prepare(`
    INSERT INTO classes (name, grade, semester_id, homeroom_teacher_id, room_number, max_students, site_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(name, grade, semester_id, homeroom_teacher_id || null, room_number || null, max_students || 30, siteId).run();

  return c.json({ message: 'Class created', classId: result.meta.last_row_id }, 201);
});

export default classes;
