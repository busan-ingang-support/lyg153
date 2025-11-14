import { Hono } from 'hono'
import type { CloudflareBindings } from '../types/bindings'

const studentClassHistory = new Hono<{ Bindings: CloudflareBindings }>()

// Get class history for a student
studentClassHistory.get('/student/:student_id', async (c) => {
  const { DB } = c.env
  const student_id = c.req.param('student_id')

  const result = await DB.prepare(`
    SELECT 
      sch.*,
      c.name as class_name,
      c.grade,
      sem.name as semester_name,
      sem.year,
      sem.semester
    FROM student_class_history sch
    JOIN classes c ON sch.class_id = c.id
    JOIN semesters sem ON sch.semester_id = sem.id
    WHERE sch.student_id = ?
    ORDER BY sem.year DESC, sem.semester DESC, sch.start_date DESC
  `).bind(student_id).all()

  return c.json({ success: true, history: result.results })
})

// Get all students in a class for a specific semester
studentClassHistory.get('/class/:class_id/semester/:semester_id', async (c) => {
  const { DB } = c.env
  const class_id = c.req.param('class_id')
  const semester_id = c.req.param('semester_id')

  const result = await DB.prepare(`
    SELECT 
      sch.*,
      s.name as student_name,
      s.student_number,
      s.gender,
      s.birth_date,
      u.email,
      u.username
    FROM student_class_history sch
    JOIN students s ON sch.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE sch.class_id = ? AND sch.semester_id = ? AND sch.is_active = 1
    ORDER BY s.student_number
  `).bind(class_id, semester_id).all()

  return c.json({ success: true, students: result.results })
})

// Get current class assignment for a student (active in current semester)
studentClassHistory.get('/student/:student_id/current', async (c) => {
  const { DB } = c.env
  const student_id = c.req.param('student_id')

  const result = await DB.prepare(`
    SELECT 
      sch.*,
      c.name as class_name,
      c.grade,
      sem.name as semester_name,
      sem.year,
      sem.semester
    FROM student_class_history sch
    JOIN classes c ON sch.class_id = c.id
    JOIN semesters sem ON sch.semester_id = sem.id
    WHERE sch.student_id = ? 
      AND sch.is_active = 1
      AND sem.is_current = 1
    ORDER BY sch.created_at DESC
    LIMIT 1
  `).bind(student_id).first()

  return c.json({ success: true, current_class: result })
})

// Assign student to class for a semester
studentClassHistory.post('/', async (c) => {
  const { DB } = c.env
  const { student_id, class_id, semester_id, start_date } = await c.req.json()

  // Validation
  if (!student_id || !class_id || !semester_id) {
    return c.json({
      success: false,
      message: '필수 항목을 모두 입력해주세요.'
    }, 400)
  }

  try {
    // 먼저 해당 학기의 기존 배정을 모두 삭제 (UNIQUE 제약조건 때문)
    await DB.prepare(`
      DELETE FROM student_class_history 
      WHERE student_id = ? AND semester_id = ?
    `).bind(student_id, semester_id).run()

    // 새 배정 생성
    const result = await DB.prepare(`
      INSERT INTO student_class_history (
        student_id,
        class_id,
        semester_id,
        start_date,
        is_active
      ) VALUES (?, ?, ?, ?, 1)
    `).bind(
      student_id,
      class_id,
      semester_id,
      start_date || new Date().toISOString().split('T')[0]
    ).run()

    if (result.success) {
      return c.json({
        success: true,
        message: '학생 반 배정이 완료되었습니다.',
        id: result.meta.last_row_id
      })
    } else {
      return c.json({ success: false, message: '반 배정에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Update class assignment (change class within same semester)
studentClassHistory.put('/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { class_id, start_date, end_date, is_active } = await c.req.json()

  if (!class_id) {
    return c.json({
      success: false,
      message: '반을 선택해주세요.'
    }, 400)
  }

  try {
    const result = await DB.prepare(`
      UPDATE student_class_history 
      SET 
        class_id = ?,
        start_date = ?,
        end_date = ?,
        is_active = ?
      WHERE id = ?
    `).bind(
      class_id,
      start_date || null,
      end_date || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    ).run()

    if (result.success) {
      return c.json({ success: true, message: '반 배정이 수정되었습니다.' })
    } else {
      return c.json({ success: false, message: '반 배정 수정에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Deactivate class assignment
studentClassHistory.delete('/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const result = await DB.prepare(`
      UPDATE student_class_history 
      SET 
        is_active = 0,
        end_date = date('now')
      WHERE id = ?
    `).bind(id).run()

    if (result.success) {
      return c.json({ success: true, message: '반 배정이 해제되었습니다.' })
    } else {
      return c.json({ success: false, message: '반 배정 해제에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Batch assign multiple students to a class for a semester
studentClassHistory.post('/batch', async (c) => {
  const { DB } = c.env
  const { student_ids, class_id, semester_id, start_date } = await c.req.json()

  // Validation
  if (!Array.isArray(student_ids) || student_ids.length === 0 || !class_id || !semester_id) {
    return c.json({
      success: false,
      message: '필수 항목을 모두 입력해주세요.'
    }, 400)
  }

  try {
    const results = []

    for (const student_id of student_ids) {
      // Check if already assigned
      const existing = await DB.prepare(`
        SELECT id FROM student_class_history 
        WHERE student_id = ? AND semester_id = ?
      `).bind(student_id, semester_id).first()

      if (existing) {
        results.push({
          student_id,
          success: false,
          message: '이미 배정됨'
        })
        continue
      }

      const result = await DB.prepare(`
        INSERT INTO student_class_history (
          student_id,
          class_id,
          semester_id,
          start_date,
          is_active
        ) VALUES (?, ?, ?, ?, 1)
      `).bind(
        student_id,
        class_id,
        semester_id,
        start_date || new Date().toISOString().split('T')[0]
      ).run()

      results.push({
        student_id,
        success: result.success,
        id: result.meta.last_row_id
      })
    }

    const successCount = results.filter(r => r.success).length
    return c.json({
      success: true,
      message: `${successCount}명의 학생이 반에 배정되었습니다.`,
      results
    })
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

export default studentClassHistory
