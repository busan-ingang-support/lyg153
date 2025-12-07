import { Hono } from 'hono'
import { authMiddleware, requireRole } from '../middleware/auth'

const sites = new Hono<{ Bindings: { DB: D1Database } }>()

// 모든 라우트에 인증 적용
sites.use('*', authMiddleware)

// ============================================
// 사이트 목록 조회 (super_admin only)
// ============================================
sites.get('/', requireRole('super_admin'), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, domain, name, logo_url, primary_color, is_active, created_at, updated_at
      FROM sites
      ORDER BY id ASC
    `).all()

    return c.json({ sites: results || [] })
  } catch (error: any) {
    console.error('사이트 목록 조회 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 사이트 단일 조회 (super_admin only)
// ============================================
sites.get('/:id', requireRole('super_admin'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const site = await c.env.DB.prepare(`
      SELECT id, domain, name, logo_url, primary_color, settings, is_active, created_at, updated_at
      FROM sites
      WHERE id = ?
    `).bind(id).first()

    if (!site) {
      return c.json({ error: '사이트를 찾을 수 없습니다' }, 404)
    }

    return c.json({ site })
  } catch (error: any) {
    console.error('사이트 조회 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 사이트 추가 (super_admin only)
// - 사이트 생성 시 기본 데이터 자동 생성
// ============================================
sites.post('/', requireRole('super_admin'), async (c) => {
  try {
    const data = await c.req.json()

    // 필수 필드 검증
    if (!data.domain || !data.name) {
      return c.json({ error: '도메인과 사이트명은 필수입니다' }, 400)
    }

    // 도메인 중복 체크
    const existing = await c.env.DB.prepare(
      'SELECT id FROM sites WHERE domain = ?'
    ).bind(data.domain).first()

    if (existing) {
      return c.json({ error: '이미 등록된 도메인입니다' }, 400)
    }

    // 1. 사이트 생성
    const result = await c.env.DB.prepare(`
      INSERT INTO sites (domain, name, logo_url, primary_color, settings, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.domain,
      data.name,
      data.logo_url || null,
      data.primary_color || '#4169E1',
      data.settings ? JSON.stringify(data.settings) : null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
    ).run()

    const siteId = result.meta.last_row_id

    // 2. 기본 게시판 생성
    await c.env.DB.prepare(`
      INSERT INTO boards (name, board_type, target_id, description, is_active, site_id)
      VALUES
        ('공지사항', 'student', NULL, '학교 전체 공지사항', 1, ?),
        ('자유게시판', 'student', NULL, '학생들의 자유로운 소통 공간', 1, ?),
        ('가정통신문', 'student', NULL, '학부모님께 전하는 소식', 1, ?),
        ('학사일정', 'student', NULL, '학교 행사 및 일정 안내', 1, ?)
    `).bind(siteId, siteId, siteId, siteId).run()

    // 3. 기본 관리자 계정 생성 (요청에 포함된 경우)
    if (data.admin_username && data.admin_password) {
      await c.env.DB.prepare(`
        INSERT INTO users (username, password_hash, email, name, role, site_id)
        VALUES (?, ?, ?, ?, 'admin', ?)
      `).bind(
        data.admin_username,
        data.admin_password, // 실제로는 해시 필요
        data.admin_email || `${data.admin_username}@${data.domain}`,
        data.admin_name || '관리자',
        siteId
      ).run()
    }

    // 4. 기본 학기 생성
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const semester = currentMonth >= 3 && currentMonth <= 8 ? 1 : 2
    const isCurrent = 1

    await c.env.DB.prepare(`
      INSERT INTO semesters (name, year, semester, start_date, end_date, is_current, site_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `${currentYear}학년도 ${semester}학기`,
      currentYear,
      semester,
      semester === 1 ? `${currentYear}-03-01` : `${currentYear}-09-01`,
      semester === 1 ? `${currentYear}-08-31` : `${currentYear + 1}-02-28`,
      isCurrent,
      siteId
    ).run()

    // 5. 기본 모듈 설정 생성
    const defaultModules = [
      'attendance', 'grades', 'volunteer', 'clubs',
      'counseling', 'awards', 'reading', 'assignments'
    ]
    for (const moduleName of defaultModules) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO module_settings (module_name, is_enabled, site_id)
        VALUES (?, 1, ?)
      `).bind(moduleName, siteId).run()
    }

    return c.json({
      message: '사이트가 추가되었습니다',
      id: siteId,
      created: {
        boards: 4,
        semester: 1,
        modules: defaultModules.length,
        admin: data.admin_username ? 1 : 0
      }
    }, 201)
  } catch (error: any) {
    console.error('사이트 추가 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 사이트 수정 (super_admin only)
// ============================================
sites.put('/:id', requireRole('super_admin'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const data = await c.req.json()

    // 필수 필드 검증
    if (!data.domain || !data.name) {
      return c.json({ error: '도메인과 사이트명은 필수입니다' }, 400)
    }

    // 도메인 중복 체크 (자기 자신 제외)
    const existing = await c.env.DB.prepare(
      'SELECT id FROM sites WHERE domain = ? AND id != ?'
    ).bind(data.domain, id).first()

    if (existing) {
      return c.json({ error: '이미 등록된 도메인입니다' }, 400)
    }

    const result = await c.env.DB.prepare(`
      UPDATE sites
      SET domain = ?, name = ?, logo_url = ?, primary_color = ?, settings = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.domain,
      data.name,
      data.logo_url || null,
      data.primary_color || '#4169E1',
      data.settings ? JSON.stringify(data.settings) : null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      id
    ).run()

    if (result.meta.changes === 0) {
      return c.json({ error: '사이트를 찾을 수 없습니다' }, 404)
    }

    return c.json({ message: '사이트가 수정되었습니다' })
  } catch (error: any) {
    console.error('사이트 수정 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 사이트 삭제 (super_admin only)
// ============================================
sites.delete('/:id', requireRole('super_admin'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    // 기본 사이트(id=1)는 삭제 불가
    if (id === 1) {
      return c.json({ error: '기본 사이트는 삭제할 수 없습니다' }, 400)
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM sites WHERE id = ?'
    ).bind(id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: '사이트를 찾을 수 없습니다' }, 404)
    }

    return c.json({ message: '사이트가 삭제되었습니다' })
  } catch (error: any) {
    console.error('사이트 삭제 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default sites
