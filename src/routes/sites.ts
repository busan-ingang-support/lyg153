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

    return c.json({
      message: '사이트가 추가되었습니다',
      id: result.meta.last_row_id
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
