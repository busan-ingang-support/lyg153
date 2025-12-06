import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const clubs = new Hono<{ Bindings: CloudflareBindings }>();

// 동아리 목록 조회
clubs.get('/', authMiddleware, async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { semester_id } = c.req.query();

  let query = `
    SELECT cl.*, u.name as advisor_name, s.name as semester_name
    FROM clubs cl
    JOIN semesters s ON cl.semester_id = s.id
    LEFT JOIN teachers t ON cl.advisor_teacher_id = t.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE cl.site_id = ?
  `;
  const params: any[] = [siteId];

  if (semester_id) {
    query += ' AND cl.semester_id = ?';
    params.push(Number(semester_id));
  }

  query += ' ORDER BY cl.name';

  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ clubs: results });
});

// 동아리 회원 조회
clubs.get('/:id/members', authMiddleware, async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const id = c.req.param('id');

  const { results } = await db.prepare(`
    SELECT cm.*, s.student_number, u.name as student_name, u.email
    FROM club_members cm
    JOIN students s ON cm.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE cm.club_id = ?
    AND cm.site_id = ?
    ORDER BY cm.role DESC, u.name
  `).bind(id, siteId).all();

  return c.json({ members: results });
});

// 동아리 생성
clubs.post('/', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const { name, description, advisor_teacher_id, semester_id, max_members } = await c.req.json();

  const result = await db.prepare(`
    INSERT INTO clubs (name, description, advisor_teacher_id, semester_id, max_members, site_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(name, description || null, advisor_teacher_id || null, semester_id, max_members || 20, siteId).run();

  return c.json({ message: 'Club created', clubId: result.meta.last_row_id }, 201);
});

// 동아리 가입
clubs.post('/:id/join', authMiddleware, async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const clubId = c.req.param('id');
  const { student_id, role } = await c.req.json();

  await db.prepare(`
    INSERT INTO club_members (club_id, student_id, role, site_id)
    VALUES (?, ?, ?, ?)
  `).bind(clubId, student_id, role || 'member', siteId).run();

  return c.json({ message: 'Joined club successfully' });
});

// 동아리 활동 기록
clubs.post('/:id/activities', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const db = c.env.DB;
  const clubId = c.req.param('id');
  const { activity_name, activity_date, description, location, participants_count, created_by } = await c.req.json();

  const result = await db.prepare(`
    INSERT INTO club_activities (club_id, activity_name, activity_date, description, location, participants_count, created_by, site_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(clubId, activity_name, activity_date, description || null, location || null, participants_count || null, created_by, siteId).run();

  return c.json({ message: 'Club activity recorded', activityId: result.meta.last_row_id }, 201);
});

export default clubs;
