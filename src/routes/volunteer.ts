import { Hono } from 'hono'
import { authMiddleware, requireRole } from '../middleware/auth'

const volunteer = new Hono<{ Bindings: { DB: D1Database } }>()

// 모든 라우트에 인증 적용
volunteer.use('*', authMiddleware)

// ============================================
// 봉사활동 목록 조회
// ============================================
volunteer.get('/', async (c) => {
  try {
    const siteId = c.get('siteId') || 1
    const { semester_id, student_id } = c.req.query()

    let query = `
      SELECT
        va.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM volunteer_activities va
      LEFT JOIN students s ON va.student_id = s.id AND s.deleted_at IS NULL
      LEFT JOIN users u ON s.user_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN semesters sem ON va.semester_id = sem.id AND sem.deleted_at IS NULL
      WHERE va.site_id = ? AND va.deleted_at IS NULL
    `

    const params: any[] = [siteId]

    if (semester_id) {
      query += ' AND va.semester_id = ?'
      params.push(parseInt(semester_id))
    }

    if (student_id) {
      query += ' AND va.student_id = ?'
      params.push(parseInt(student_id))
    }

    query += ' ORDER BY va.activity_date DESC, va.created_at DESC'

    const stmt = c.env.DB.prepare(query).bind(...params)
    const { results } = await stmt.all()

    return c.json({ activities: results || [] })
  } catch (error: any) {
    console.error('봉사활동 조회 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 봉사활동 단일 조회
// ============================================
volunteer.get('/:id', async (c) => {
  try {
    const siteId = c.get('siteId') || 1
    const id = parseInt(c.req.param('id'))

    const stmt = c.env.DB.prepare(`
      SELECT
        va.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM volunteer_activities va
      LEFT JOIN students s ON va.student_id = s.id AND s.deleted_at IS NULL
      LEFT JOIN users u ON s.user_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN semesters sem ON va.semester_id = sem.id AND sem.deleted_at IS NULL
      WHERE va.id = ? AND va.site_id = ? AND va.deleted_at IS NULL
    `).bind(id, siteId)

    const result = await stmt.first()

    if (!result) {
      return c.json({ error: '봉사활동을 찾을 수 없습니다' }, 404)
    }

    return c.json(result)
  } catch (error: any) {
    console.error('봉사활동 조회 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 봉사활동 추가
// ============================================
volunteer.post('/', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  try {
    const siteId = c.get('siteId') || 1
    const data = await c.req.json()

    // 필수 필드 검증
    if (!data.student_id || !data.semester_id || !data.activity_name || !data.activity_date || !data.hours) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }

    const stmt = c.env.DB.prepare(`
      INSERT INTO volunteer_activities (
        student_id, semester_id, activity_name, organization, activity_type,
        activity_date, hours, location, description, recognition, site_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.student_id,
      data.semester_id,
      data.activity_name,
      data.organization || null,
      data.activity_type || null,
      data.activity_date,
      data.hours,
      data.location || null,
      data.description || null,
      data.recognition || null,
      siteId
    )

    const result = await stmt.run()

    return c.json({
      message: '봉사활동이 추가되었습니다',
      id: result.meta.last_row_id
    }, 201)
  } catch (error: any) {
    console.error('봉사활동 추가 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 봉사활동 수정
// ============================================
volunteer.put('/:id', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  try {
    const siteId = c.get('siteId') || 1
    const id = parseInt(c.req.param('id'))
    const data = await c.req.json()

    // 필수 필드 검증
    if (!data.student_id || !data.semester_id || !data.activity_name || !data.activity_date || !data.hours) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }

    const stmt = c.env.DB.prepare(`
      UPDATE volunteer_activities
      SET student_id = ?, semester_id = ?, activity_name = ?, organization = ?,
          activity_type = ?, activity_date = ?, hours = ?, location = ?,
          description = ?, recognition = ?
      WHERE id = ? AND site_id = ?
    `).bind(
      data.student_id,
      data.semester_id,
      data.activity_name,
      data.organization || null,
      data.activity_type || null,
      data.activity_date,
      data.hours,
      data.location || null,
      data.description || null,
      data.recognition || null,
      id,
      siteId
    )

    const result = await stmt.run()

    if (result.meta.changes === 0) {
      return c.json({ error: '봉사활동을 찾을 수 없습니다' }, 404)
    }

    return c.json({ message: '봉사활동이 수정되었습니다' })
  } catch (error: any) {
    console.error('봉사활동 수정 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 봉사활동 삭제
// ============================================
volunteer.delete('/:id', requireRole('teacher', 'admin', 'super_admin'), async (c) => {
  try {
    const siteId = c.get('siteId') || 1
    const id = parseInt(c.req.param('id'))

    const stmt = c.env.DB.prepare('UPDATE volunteer_activities SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?').bind(id, siteId)
    const result = await stmt.run()

    if (result.meta.changes === 0) {
      return c.json({ error: '봉사활동을 찾을 수 없습니다' }, 404)
    }

    return c.json({ message: '봉사활동이 삭제되었습니다' })
  } catch (error: any) {
    console.error('봉사활동 삭제 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default volunteer
