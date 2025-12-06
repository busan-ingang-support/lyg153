import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { requireRole } from '../middleware/auth';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 모듈 설정 조회
app.get('/', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;

  try {
    const result = await DB.prepare(`
      SELECT * FROM module_settings
      WHERE site_id = ?
      ORDER BY display_order ASC, module_name ASC
    `).bind(siteId).all();

    return c.json({
      modules: result.results || []
    });
  } catch (error: any) {
    console.error('모듈 설정 조회 실패:', error);
    return c.json({ error: '모듈 설정 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 활성화된 모듈만 조회
app.get('/enabled', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;

  try {
    const result = await DB.prepare(`
      SELECT * FROM module_settings
      WHERE is_enabled = 1 AND site_id = ?
      ORDER BY display_order ASC, module_name ASC
    `).bind(siteId).all();

    return c.json({
      modules: result.results || []
    });
  } catch (error: any) {
    console.error('활성화된 모듈 조회 실패:', error);
    return c.json({ error: '활성화된 모듈 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 특정 모듈 설정 조회
app.get('/:moduleName', async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const moduleName = c.req.param('moduleName');

  try {
    const result = await DB.prepare(`
      SELECT * FROM module_settings
      WHERE module_name = ? AND site_id = ?
    `).bind(moduleName, siteId).first();

    if (!result) {
      return c.json({ error: '모듈을 찾을 수 없습니다.' }, 404);
    }

    return c.json(result);
  } catch (error: any) {
    console.error('모듈 설정 조회 실패:', error);
    return c.json({ error: '모듈 설정 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 모듈 활성화/비활성화 토글
app.patch('/:moduleName/toggle', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const moduleName = c.req.param('moduleName');

  try {
    // 현재 상태 조회
    const current = await DB.prepare(`
      SELECT is_enabled FROM module_settings
      WHERE module_name = ? AND site_id = ?
    `).bind(moduleName, siteId).first();

    if (!current) {
      return c.json({ error: '모듈을 찾을 수 없습니다.' }, 404);
    }

    // 상태 반전
    const newState = current.is_enabled === 1 ? 0 : 1;

    const result = await DB.prepare(`
      UPDATE module_settings
      SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE module_name = ? AND site_id = ?
    `).bind(newState, moduleName, siteId).run();

    if (!result.success) {
      throw new Error('모듈 설정 업데이트 실패');
    }

    return c.json({
      message: '모듈 설정이 업데이트되었습니다.',
      module_name: moduleName,
      is_enabled: newState
    });
  } catch (error: any) {
    console.error('모듈 설정 토글 실패:', error);
    return c.json({ error: '모듈 설정 토글 중 오류가 발생했습니다.' }, 500);
  }
});

// 모듈 설정 업데이트 (전체)
app.put('/:moduleName', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;
  const moduleName = c.req.param('moduleName');

  try {
    const body = await c.req.json();
    const { module_label, is_enabled, display_order, icon } = body;

    const result = await DB.prepare(`
      UPDATE module_settings
      SET
        module_label = COALESCE(?, module_label),
        is_enabled = COALESCE(?, is_enabled),
        display_order = COALESCE(?, display_order),
        icon = COALESCE(?, icon),
        updated_at = CURRENT_TIMESTAMP
      WHERE module_name = ? AND site_id = ?
    `).bind(
      module_label || null,
      is_enabled !== undefined ? is_enabled : null,
      display_order !== undefined ? display_order : null,
      icon || null,
      moduleName,
      siteId
    ).run();

    if (!result.success) {
      throw new Error('모듈 설정 업데이트 실패');
    }

    return c.json({ message: '모듈 설정이 업데이트되었습니다.' });
  } catch (error: any) {
    console.error('모듈 설정 업데이트 실패:', error);
    return c.json({ error: '모듈 설정 업데이트 중 오류가 발생했습니다.' }, 500);
  }
});

// 여러 모듈 설정 일괄 업데이트
app.put('/', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;

  try {
    const body = await c.req.json();
    const { modules } = body;

    if (!Array.isArray(modules)) {
      return c.json({ error: 'modules 배열이 필요합니다.' }, 400);
    }

    // 트랜잭션으로 처리하고 싶지만 D1은 현재 트랜잭션 미지원
    // 순차적으로 업데이트
    for (const module of modules) {
      await DB.prepare(`
        UPDATE module_settings
        SET
          is_enabled = ?,
          display_order = COALESCE(?, display_order),
          updated_at = CURRENT_TIMESTAMP
        WHERE module_name = ? AND site_id = ?
      `).bind(
        module.is_enabled !== undefined ? module.is_enabled : 1,
        module.display_order || null,
        module.module_name,
        siteId
      ).run();
    }

    return c.json({ message: '모듈 설정이 일괄 업데이트되었습니다.' });
  } catch (error: any) {
    console.error('모듈 설정 일괄 업데이트 실패:', error);
    return c.json({ error: '모듈 설정 일괄 업데이트 중 오류가 발생했습니다.' }, 500);
  }
});

// 모듈 추가 (동적으로 새 모듈 등록)
app.post('/', requireRole('admin', 'super_admin'), async (c) => {
  const siteId = c.get('siteId') || 1;
  const { DB } = c.env;

  try {
    const body = await c.req.json();
    const { module_name, module_label, is_enabled, display_order, icon } = body;

    if (!module_name || !module_label) {
      return c.json({ error: 'module_name과 module_label은 필수입니다.' }, 400);
    }

    const result = await DB.prepare(`
      INSERT INTO module_settings (
        site_id, module_name, module_label, is_enabled, display_order, icon
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      siteId,
      module_name,
      module_label,
      is_enabled !== undefined ? is_enabled : 1,
      display_order || 0,
      icon || 'fa-cube'
    ).run();

    if (!result.success) {
      throw new Error('모듈 추가 실패');
    }

    return c.json({
      message: '모듈이 추가되었습니다.',
      id: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('모듈 추가 실패:', error);
    return c.json({ error: '모듈 추가 중 오류가 발생했습니다.' }, 500);
  }
});

export default app;
