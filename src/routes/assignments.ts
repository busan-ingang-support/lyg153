import { Hono } from 'hono';

import type { CloudflareBindings } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const assignments = new Hono<{ Bindings: CloudflareBindings }>();

// 인증이 필요한 모든 엔드포인트에 authMiddleware 적용
assignments.use('/*', authMiddleware);

// ============================================
// Bug 2 Fix: 더 구체적인 라우트를 먼저 정의
// /student/:student_id 라우트를 /:id 라우트보다 먼저 정의
// ============================================

// 학생별 과제 목록 (학부모용 + 학생 본인 + 교사/관리자)
// Bug 3 Fix: 적절한 권한 검증 추가
assignments.get('/student/:student_id', async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const studentId = c.req.param('student_id');
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  // Bug 3 Fix: 역할별 권한 검증
  if (userRole === 'student') {
    // 학생 본인인지 확인
    const student = await db.prepare(`
      SELECT id FROM students WHERE user_id = ? AND id = ? AND site_id = ?
    `).bind(userId, studentId, siteId).first();

    if (!student) {
      return c.json({ error: 'Forbidden: You can only view your own assignments' }, 403);
    }
  } else if (userRole === 'parent') {
    // 학부모인 경우 자녀 확인
    const relation = await db.prepare(`
      SELECT id FROM parent_student WHERE parent_user_id = ? AND student_id = ? AND COALESCE(status, 1) = 1
    `).bind(userId, studentId).first();

    if (!relation) {
      return c.json({ error: 'Forbidden: Not your child' }, 403);
    }
  } else if (userRole === 'teacher') {
    // 교사인 경우: 해당 학생이 본인이 담당하는 반/과목에 속해있는지 확인
    const teacher = await db.prepare(`
      SELECT id FROM teachers WHERE user_id = ? AND site_id = ?
    `).bind(userId, siteId).first() as any;

    if (!teacher) {
      return c.json({ error: 'Teacher not found' }, 404);
    }

    // 해당 학생이 교사의 담당 반 또는 담당 과목에 속해 있는지 확인
    const hasAccess = await db.prepare(`
      SELECT 1 FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE e.student_id = ? AND e.status = 'active' AND e.site_id = ?
        AND (c.teacher_id = ? OR cl.homeroom_teacher_id = ?)
      LIMIT 1
    `).bind(studentId, siteId, teacher.id, teacher.id).first();

    if (!hasAccess) {
      return c.json({ error: 'Forbidden: You can only view assignments of students in your classes' }, 403);
    }
  } else if (userRole !== 'admin' && userRole !== 'super_admin') {
    // 관리자/최고관리자가 아닌 경우 거부
    return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
  }

  const { results } = await db.prepare(`
    SELECT
      a.*,
      c.course_name,
      sub.name as subject_name,
      asub.id as submission_id,
      asub.submitted_at,
      asub.score,
      asub.status as submission_status
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    LEFT JOIN subjects sub ON c.subject_id = sub.id
    JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?
    LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = ?
    WHERE a.status = 1 AND a.is_published = 1 AND e.status = 'active' AND a.site_id = ?
    ORDER BY a.due_date ASC
  `).bind(studentId, studentId, siteId).all();

  return c.json({ assignments: results });
});

// 과제 목록 조회
assignments.get('/', async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const { course_id, teacher_id, is_published, status } = c.req.query();
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  let query = `
    SELECT
      a.*,
      c.course_name,
      sub.name as subject_name,
      u.name as teacher_name,
      (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id AND asub.status > 0 AND asub.site_id = ?) as submission_count,
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = a.course_id AND e.status = 'active' AND e.site_id = ?) as total_students
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    LEFT JOIN subjects sub ON c.subject_id = sub.id
    JOIN users u ON a.created_by = u.id
    WHERE a.status = 1 AND a.site_id = ?
  `;
  const params: any[] = [siteId, siteId, siteId];

  if (course_id) {
    query += ' AND a.course_id = ?';
    params.push(Number(course_id));
  }

  if (teacher_id) {
    query += ' AND a.created_by = ?';
    params.push(Number(teacher_id));
  }

  if (is_published !== undefined) {
    query += ' AND a.is_published = ?';
    params.push(Number(is_published));
  }

  // 학생인 경우: 본인이 수강하는 과목의 공개된 과제만
  if (userRole === 'student') {
    const student = await db.prepare(`
      SELECT id FROM students WHERE user_id = ? AND site_id = ?
    `).bind(userId, siteId).first();

    if (student) {
      query += ` AND a.course_id IN (
        SELECT course_id FROM enrollments WHERE student_id = ? AND status = 'active' AND site_id = ?
      ) AND a.is_published = 1`;
      params.push(student.id, siteId);
    }
  }

  // 학부모인 경우: 자녀가 수강하는 과목의 공개된 과제만
  if (userRole === 'parent') {
    query += ` AND a.course_id IN (
      SELECT e.course_id
      FROM enrollments e
      JOIN parent_student ps ON e.student_id = ps.student_id
      WHERE ps.parent_user_id = ? AND e.status = 'active' AND COALESCE(ps.status, 1) = 1 AND e.site_id = ?
    ) AND a.is_published = 1`;
    params.push(userId, siteId);
  }

  // 교사인 경우: 본인이 담당하는 과목의 과제만
  if (userRole === 'teacher') {
    const teacher = await db.prepare(`
      SELECT id FROM teachers WHERE user_id = ? AND site_id = ?
    `).bind(userId, siteId).first();

    if (teacher) {
      query += ' AND c.teacher_id = ?';
      params.push(teacher.id);
    }
  }

  query += ' ORDER BY a.due_date ASC, a.created_at DESC';

  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ assignments: results });
});

// 과제 상세 조회 (/:id 라우트는 /student/:student_id 보다 뒤에 정의)
assignments.get('/:id', async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const assignmentId = c.req.param('id');

  const assignment = await db.prepare(`
    SELECT
      a.*,
      c.course_name,
      sub.name as subject_name,
      u.name as teacher_name
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    LEFT JOIN subjects sub ON c.subject_id = sub.id
    JOIN users u ON a.created_by = u.id
    WHERE a.id = ? AND a.status = 1 AND a.site_id = ?
  `).bind(assignmentId, siteId).first();

  if (!assignment) {
    return c.json({ error: 'Assignment not found' }, 404);
  }

  return c.json({ assignment });
});

// 과제 생성 (교사, 관리자만)
assignments.post('/', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const userId = c.get('userId');
  const data = await c.req.json();

  const {
    course_id,
    title,
    description,
    assignment_type = 'homework',
    due_date,
    max_score = 100,
    weight = 1.0,
    file_url,
    is_published = 0,
    notify_students = true,
    notify_parents = true
  } = data;

  if (!course_id || !title) {
    return c.json({ error: 'course_id and title are required' }, 400);
  }

  try {
    const result = await db.prepare(`
      INSERT INTO assignments (
        course_id, title, description, assignment_type, due_date,
        max_score, weight, file_url, is_published, published_at, created_by, site_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      course_id,
      title,
      description || null,
      assignment_type,
      due_date || null,
      max_score,
      weight,
      file_url || null,
      is_published,
      is_published ? new Date().toISOString() : null,
      userId,
      siteId
    ).run();

    const assignmentId = result.meta.last_row_id;

    // 공개된 과제인 경우 알림 발송
    if (is_published && (notify_students || notify_parents)) {
      await sendAssignmentNotifications(db, assignmentId, course_id, title, due_date, notify_students, notify_parents, siteId);
    }

    return c.json({
      success: true,
      message: 'Assignment created',
      id: assignmentId
    });
  } catch (error: any) {
    console.error('과제 생성 실패:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 과제 수정 (교사, 관리자만)
assignments.put('/:id', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const assignmentId = c.req.param('id');
  const data = await c.req.json();

  // 과제 존재 확인 및 권한 확인
  const existing = await db.prepare(`
    SELECT a.*, c.teacher_id
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    WHERE a.id = ? AND a.status = 1 AND a.site_id = ?
  `).bind(assignmentId, siteId).first() as any;

  if (!existing) {
    return c.json({ error: 'Assignment not found' }, 404);
  }

  // 교사인 경우 본인 과제만 수정 가능
  if (userRole === 'teacher') {
    const teacher = await db.prepare(`
      SELECT id FROM teachers WHERE user_id = ? AND site_id = ?
    `).bind(userId, siteId).first() as any;

    if (!teacher || teacher.id !== existing.teacher_id) {
      return c.json({ error: 'Forbidden: You can only edit your own assignments' }, 403);
    }
  }

  const {
    title,
    description,
    assignment_type,
    due_date,
    max_score,
    weight,
    file_url,
    is_published,
    notify_students = false,
    notify_parents = false
  } = data;

  // 비공개 → 공개로 변경 시 알림 발송 여부
  const wasPublished = existing.is_published;
  const willBePublished = is_published !== undefined ? is_published : wasPublished;
  const justPublished = !wasPublished && willBePublished;

  try {
    await db.prepare(`
      UPDATE assignments SET
        title = COALESCE(?, title),
        description = ?,
        assignment_type = COALESCE(?, assignment_type),
        due_date = ?,
        max_score = COALESCE(?, max_score),
        weight = COALESCE(?, weight),
        file_url = ?,
        is_published = COALESCE(?, is_published),
        published_at = CASE WHEN ? = 1 AND is_published = 0 THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND site_id = ?
    `).bind(
      title,
      description !== undefined ? description : existing.description,
      assignment_type,
      due_date !== undefined ? due_date : existing.due_date,
      max_score,
      weight,
      file_url !== undefined ? file_url : existing.file_url,
      is_published,
      is_published,
      assignmentId,
      siteId
    ).run();

    // 방금 공개된 경우 알림 발송
    if (justPublished && (notify_students || notify_parents)) {
      await sendAssignmentNotifications(
        db,
        Number(assignmentId),
        existing.course_id,
        title || existing.title,
        due_date || existing.due_date,
        notify_students,
        notify_parents,
        siteId
      );
    }

    return c.json({ success: true, message: 'Assignment updated' });
  } catch (error: any) {
    console.error('과제 수정 실패:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 과제 삭제 (Soft Delete)
assignments.delete('/:id', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const assignmentId = c.req.param('id');

  // 과제 존재 확인 및 권한 확인
  const existing = await db.prepare(`
    SELECT a.*, c.teacher_id
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    WHERE a.id = ? AND a.status = 1 AND a.site_id = ?
  `).bind(assignmentId, siteId).first() as any;

  if (!existing) {
    return c.json({ error: 'Assignment not found' }, 404);
  }

  // 교사인 경우 본인 과제만 삭제 가능
  if (userRole === 'teacher') {
    const teacher = await db.prepare(`
      SELECT id FROM teachers WHERE user_id = ? AND site_id = ?
    `).bind(userId, siteId).first() as any;

    if (!teacher || teacher.id !== existing.teacher_id) {
      return c.json({ error: 'Forbidden: You can only delete your own assignments' }, 403);
    }
  }

  // Soft Delete
  await db.prepare(`
    UPDATE assignments SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?
  `).bind(assignmentId, siteId).run();

  return c.json({ success: true, message: 'Assignment deleted' });
});

// 과제 제출 (학생)
assignments.post('/:id/submit', requireRole('student'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const userId = c.get('userId');
  const assignmentId = c.req.param('id');
  const data = await c.req.json();

  const { content, file_url } = data;

  // 학생 ID 조회
  const student = await db.prepare(`
    SELECT id FROM students WHERE user_id = ? AND site_id = ?
  `).bind(userId, siteId).first() as any;

  if (!student) {
    return c.json({ error: 'Student not found' }, 404);
  }

  // 과제 존재 및 수강 확인
  const assignment = await db.prepare(`
    SELECT a.*
    FROM assignments a
    JOIN enrollments e ON e.course_id = a.course_id
    WHERE a.id = ? AND a.status = 1 AND a.is_published = 1 AND a.site_id = ?
      AND e.student_id = ? AND e.status = 'active' AND e.site_id = ?
  `).bind(assignmentId, siteId, student.id, siteId).first();

  if (!assignment) {
    return c.json({ error: 'Assignment not found or not enrolled' }, 404);
  }

  try {
    // UPSERT
    await db.prepare(`
      INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url, status, site_id)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(assignment_id, student_id)
      DO UPDATE SET content = ?, file_url = ?, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    `).bind(
      assignmentId,
      student.id,
      content || null,
      file_url || null,
      siteId,
      content || null,
      file_url || null
    ).run();

    return c.json({ success: true, message: 'Assignment submitted' });
  } catch (error: any) {
    console.error('과제 제출 실패:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 과제 제출 목록 조회 (교사, 관리자)
assignments.get('/:id/submissions', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const assignmentId = c.req.param('id');

  const { results } = await db.prepare(`
    SELECT
      asub.*,
      s.student_number,
      u.name as student_name,
      grader.name as grader_name
    FROM assignment_submissions asub
    JOIN students s ON asub.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN users grader ON asub.graded_by = grader.id
    WHERE asub.assignment_id = ? AND asub.status > 0 AND asub.site_id = ?
    ORDER BY asub.submitted_at DESC
  `).bind(assignmentId, siteId).all();

  return c.json({ submissions: results });
});

// 과제 채점 (교사, 관리자)
assignments.put('/:id/submissions/:submission_id/grade', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  const db = c.env.DB;
  const siteId = c.get('siteId') || 1;
  const userId = c.get('userId');
  const submissionId = c.req.param('submission_id');
  const data = await c.req.json();

  const { score, feedback } = data;

  if (score === undefined) {
    return c.json({ error: 'score is required' }, 400);
  }

  try {
    await db.prepare(`
      UPDATE assignment_submissions SET
        score = ?,
        feedback = ?,
        graded_by = ?,
        graded_at = CURRENT_TIMESTAMP,
        status = 2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND site_id = ?
    `).bind(score, feedback || null, userId, submissionId, siteId).run();

    // 학생에게 알림 발송
    const submission = await db.prepare(`
      SELECT asub.*, a.title as assignment_title, s.user_id as student_user_id
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN students s ON asub.student_id = s.id
      WHERE asub.id = ? AND asub.site_id = ?
    `).bind(submissionId, siteId).first() as any;

    if (submission) {
      await db.prepare(`
        INSERT INTO notifications (user_id, notification_type, title, message, reference_type, reference_id, site_id)
        VALUES (?, 'grade', ?, ?, 'assignment_submission', ?, ?)
      `).bind(
        submission.student_user_id,
        '과제 채점 완료',
        `"${submission.assignment_title}" 과제가 채점되었습니다. 점수: ${score}점`,
        submissionId,
        siteId
      ).run();
    }

    return c.json({ success: true, message: 'Submission graded' });
  } catch (error: any) {
    console.error('채점 실패:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 알림 발송 헬퍼 함수
async function sendAssignmentNotifications(
  db: any,
  assignmentId: number,
  courseId: number,
  title: string,
  dueDate: string | null,
  notifyStudents: boolean,
  notifyParents: boolean,
  siteId: number
) {
  try {
    // 수강 학생 조회
    const { results: enrollments } = await db.prepare(`
      SELECT e.student_id, s.user_id as student_user_id
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      WHERE e.course_id = ? AND e.status = 'active' AND e.site_id = ?
    `).bind(courseId, siteId).all();

    const dueDateStr = dueDate ? ` (마감: ${new Date(dueDate).toLocaleDateString('ko-KR')})` : '';
    const message = `새로운 과제가 등록되었습니다: "${title}"${dueDateStr}`;

    // 학생에게 알림
    if (notifyStudents) {
      for (const enrollment of enrollments) {
        await db.prepare(`
          INSERT INTO notifications (user_id, notification_type, title, message, reference_type, reference_id, site_id)
          VALUES (?, 'assignment', ?, ?, 'assignment', ?, ?)
        `).bind(
          enrollment.student_user_id,
          '새 과제 등록',
          message,
          assignmentId,
          siteId
        ).run();
      }
    }

    // 학부모에게 알림
    if (notifyParents) {
      for (const enrollment of enrollments) {
        // 해당 학생의 학부모 조회
        const { results: parents } = await db.prepare(`
          SELECT parent_user_id FROM parent_student WHERE student_id = ? AND COALESCE(status, 1) = 1
        `).bind(enrollment.student_id).all();

        for (const parent of parents) {
          await db.prepare(`
            INSERT INTO notifications (user_id, notification_type, title, message, reference_type, reference_id, site_id)
            VALUES (?, 'assignment', ?, ?, 'assignment', ?, ?)
          `).bind(
            parent.parent_user_id,
            '자녀 새 과제 등록',
            message,
            assignmentId,
            siteId
          ).run();
        }
      }
    }
  } catch (error) {
    console.error('알림 발송 실패:', error);
    // 알림 실패해도 과제 생성은 성공으로 처리
  }
}

export default assignments;
