import { Hono } from 'hono'
import type { CloudflareBindings } from '../types/bindings'

const teacherHomeroom = new Hono<{ Bindings: CloudflareBindings }>()

// Get all homeroom assignments
teacherHomeroom.get('/', async (c) => {
  const { DB } = c.env
  const { semester_id, teacher_id, class_id } = c.req.query()

  let query = `
    SELECT 
      th.*,
      t.subject as teacher_subject,
      u.name as teacher_name,
      u.username as teacher_username,
      c.name as class_name,
      c.grade,

      sem.name as semester_name,
      sem.year,
      sem.semester
    FROM teacher_homeroom th
    JOIN teachers t ON th.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    JOIN classes c ON th.class_id = c.id
    JOIN semesters sem ON th.semester_id = sem.id
    WHERE 1=1
  `
  const params: any[] = []

  if (semester_id) {
    query += ` AND th.semester_id = ?`
    params.push(semester_id)
  }

  if (teacher_id) {
    query += ` AND th.teacher_id = ?`
    params.push(teacher_id)
  }

  if (class_id) {
    query += ` AND th.class_id = ?`
    params.push(class_id)
  }

  query += ` ORDER BY sem.year DESC, sem.semester DESC, c.grade, c.name`

  const result = await DB.prepare(query).bind(...params).all()
  return c.json({ success: true, homerooms: result.results })
})

// Get homeroom teacher for a class in a specific semester
teacherHomeroom.get('/class/:class_id/semester/:semester_id', async (c) => {
  const { DB } = c.env
  const class_id = c.req.param('class_id')
  const semester_id = c.req.param('semester_id')

  const result = await DB.prepare(`
    SELECT 
      th.*,
      t.subject as teacher_subject,
      u.name as teacher_name,
      u.username as teacher_username,
      u.email as teacher_email,
      c.name as class_name,
      c.grade,
      c.class_number
    FROM teacher_homeroom th
    JOIN teachers t ON th.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    JOIN classes c ON th.class_id = c.id
    WHERE th.class_id = ? AND th.semester_id = ?
  `).bind(class_id, semester_id).first()

  return c.json({ success: true, homeroom_teacher: result })
})

// Get all classes assigned to a teacher in a specific semester
teacherHomeroom.get('/teacher/:teacher_id/semester/:semester_id', async (c) => {
  const { DB } = c.env
  const teacher_id = c.req.param('teacher_id')
  const semester_id = c.req.param('semester_id')

  const result = await DB.prepare(`
    SELECT 
      th.*,
      c.name as class_name,
      c.grade,

      c.room_number,
      (SELECT COUNT(*) FROM student_class_history sch 
       WHERE sch.class_id = c.id 
       AND sch.semester_id = th.semester_id 
       AND sch.is_active = 1) as student_count
    FROM teacher_homeroom th
    JOIN classes c ON th.class_id = c.id
    WHERE th.teacher_id = ? AND th.semester_id = ?
    ORDER BY c.grade, c.name
  `).bind(teacher_id, semester_id).all()

  return c.json({ success: true, homeroom_classes: result.results })
})

// Assign homeroom teacher to class
teacherHomeroom.post('/', async (c) => {
  const { DB } = c.env
  const { teacher_id, class_id, semester_id } = await c.req.json()

  // Validation
  if (!teacher_id || !class_id || !semester_id) {
    return c.json({
      success: false,
      message: '필수 항목을 모두 입력해주세요.'
    }, 400)
  }

  try {
    // Check if class already has a homeroom teacher for this semester
    const existing = await DB.prepare(`
      SELECT id, teacher_id FROM teacher_homeroom 
      WHERE class_id = ? AND semester_id = ?
    `).bind(class_id, semester_id).first()

    if (existing) {
      return c.json({
        success: false,
        message: '해당 반에 이미 담임 교사가 배정되어 있습니다.'
      }, 400)
    }

    const result = await DB.prepare(`
      INSERT INTO teacher_homeroom (
        teacher_id,
        class_id,
        semester_id
      ) VALUES (?, ?, ?)
    `).bind(teacher_id, class_id, semester_id).run()

    if (result.success) {
      return c.json({
        success: true,
        message: '담임 교사가 배정되었습니다.',
        id: result.meta.last_row_id
      })
    } else {
      return c.json({ success: false, message: '담임 배정에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Update homeroom assignment (change teacher)
teacherHomeroom.put('/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { teacher_id } = await c.req.json()

  if (!teacher_id) {
    return c.json({
      success: false,
      message: '교사를 선택해주세요.'
    }, 400)
  }

  try {
    const result = await DB.prepare(`
      UPDATE teacher_homeroom 
      SET teacher_id = ?
      WHERE id = ?
    `).bind(teacher_id, id).run()

    if (result.success) {
      return c.json({ success: true, message: '담임 교사가 변경되었습니다.' })
    } else {
      return c.json({ success: false, message: '담임 변경에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Remove homeroom assignment
teacherHomeroom.delete('/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const result = await DB.prepare(`
      DELETE FROM teacher_homeroom WHERE id = ?
    `).bind(id).run()

    if (result.success) {
      return c.json({ success: true, message: '담임 배정이 해제되었습니다.' })
    } else {
      return c.json({ success: false, message: '담임 해제에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Get teacher's current homeroom class (in active semester)
teacherHomeroom.get('/teacher/:teacher_id/current', async (c) => {
  const { DB } = c.env
  const teacher_id = c.req.param('teacher_id')

  const result = await DB.prepare(`
    SELECT 
      th.*,
      c.name as class_name,
      c.grade,

      c.room_number,
      sem.name as semester_name,
      sem.year,
      sem.semester,
      (SELECT COUNT(*) FROM student_class_history sch 
       WHERE sch.class_id = c.id 
       AND sch.semester_id = th.semester_id 
       AND sch.is_active = 1) as student_count
    FROM teacher_homeroom th
    JOIN classes c ON th.class_id = c.id
    JOIN semesters sem ON th.semester_id = sem.id
    WHERE th.teacher_id = ? AND sem.is_current = 1
    ORDER BY c.grade, c.name
  `).bind(teacher_id).all()

  return c.json({ success: true, current_homerooms: result.results })
})

export default teacherHomeroom
