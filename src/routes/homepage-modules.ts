import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'
import { verifyToken } from '../utils/auth'

const modules = new Hono<{ Bindings: CloudflareBindings }>()

// 토큰에서 사용자 정보 추출 헬퍼
async function getUserFromToken(token: string): Promise<{ userId: number; role: string } | null> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }
    return {
      userId: payload.userId,
      role: payload.role || ''
    };
  } catch {
    return null;
  }
}

// 최고 관리자 권한 체크
async function checkSuperAdminPermission(c: any): Promise<boolean> {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return false;
  }
  
  const user = await getUserFromToken(token);
  if (!user) {
    return false;
  }
  
  return user.role === 'super_admin';
}

// 모든 모듈 조회 (공개 API)
modules.get('/', async (c) => {
  const { DB } = c.env

  try {
    // 먼저 모듈 목록 조회
    const result = await DB.prepare(`
      SELECT * FROM homepage_modules
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all()

    // 각 모듈의 설정과 슬라이드 항목도 함께 조회
    const modulesWithData = await Promise.all(
      result.results.map(async (row: any) => {
        const module: any = {
          id: row.id,
          module_type: row.module_type,
          display_order: row.display_order,
          container_type: row.container_type,
          background_color: row.background_color,
          background_image: row.background_image,
          padding_top: row.padding_top,
          padding_bottom: row.padding_bottom,
          margin_top: row.margin_top,
          margin_bottom: row.margin_bottom
        };

        // 설정 조회
        const settingsResult = await DB.prepare(`
          SELECT setting_key, setting_value, setting_type
          FROM homepage_module_settings
          WHERE module_id = ?
        `).bind(row.id).all();

        settingsResult.results.forEach((setting: any) => {
          let value = setting.setting_value;
          if (setting.setting_type === 'json') {
            try {
              value = JSON.parse(value);
            } catch {}
          } else if (setting.setting_type === 'number') {
            value = Number(value);
          } else if (setting.setting_type === 'boolean') {
            value = value === 'true' || value === '1';
          }
          module[setting.setting_key] = value;
        });

        // 슬라이드 모듈인 경우 슬라이드 항목 조회
        if (row.module_type === 'slides') {
          const slides = await DB.prepare(`
            SELECT * FROM homepage_slides
            WHERE module_id = ? AND is_active = 1
            ORDER BY slide_order ASC
          `).bind(row.id).all();
          module.slides = slides.results;
        }

        return module;
      })
    );

    return c.json({ success: true, modules: modulesWithData })
  } catch (error: any) {
    console.error('모듈 조회 오류:', error);
    return c.json({ success: false, message: error.message || '모듈을 불러오는 중 오류가 발생했습니다.' }, 500)
  }
})

// 모든 모듈 조회 (관리자용 - 비활성 포함)
modules.get('/admin', async (c) => {
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '최고 관리자만 접근할 수 있습니다.' }, 403);
  }

  const { DB } = c.env

  try {
    // 먼저 모듈 목록 조회
    const result = await DB.prepare(`
      SELECT * FROM homepage_modules
      ORDER BY display_order ASC
    `).all()

    // 각 모듈의 설정과 슬라이드 항목도 함께 조회
    const modulesWithData = await Promise.all(
      result.results.map(async (row: any) => {
        const module: any = {
          id: row.id,
          module_type: row.module_type,
          display_order: row.display_order,
          is_active: row.is_active,
          container_type: row.container_type,
          background_color: row.background_color,
          background_image: row.background_image,
          padding_top: row.padding_top,
          padding_bottom: row.padding_bottom,
          margin_top: row.margin_top,
          margin_bottom: row.margin_bottom
        };

        // 설정 조회
        const settingsResult = await DB.prepare(`
          SELECT setting_key, setting_value, setting_type
          FROM homepage_module_settings
          WHERE module_id = ?
        `).bind(row.id).all();

        settingsResult.results.forEach((setting: any) => {
          let value = setting.setting_value;
          if (setting.setting_type === 'json') {
            try {
              value = JSON.parse(value);
            } catch {}
          } else if (setting.setting_type === 'number') {
            value = Number(value);
          } else if (setting.setting_type === 'boolean') {
            value = value === 'true' || value === '1';
          }
          module[setting.setting_key] = value;
        });

        // 슬라이드 모듈인 경우 슬라이드 항목 조회
        if (row.module_type === 'slides') {
          const slides = await DB.prepare(`
            SELECT * FROM homepage_slides
            WHERE module_id = ?
            ORDER BY slide_order ASC
          `).bind(row.id).all();
          module.slides = slides.results;
        }

        return module;
      })
    );

    return c.json({ success: true, modules: modulesWithData })
  } catch (error: any) {
    console.error('모듈 조회 오류:', error);
    return c.json({ success: false, message: error.message || '모듈을 불러오는 중 오류가 발생했습니다.' }, 500)
  }
})

// 모듈 생성
modules.post('/', async (c) => {
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '최고 관리자만 접근할 수 있습니다.' }, 403);
  }

  const { DB } = c.env
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const user = await getUserFromToken(token!);
  
  const data = await c.req.json()
  const {
    module_type,
    display_order,
    is_active = 1,
    container_type = 'container',
    background_color,
    background_image,
    padding_top = 0,
    padding_bottom = 0,
    margin_top = 0,
    margin_bottom = 0,
    settings = {},
    slides = []
  } = data

  try {
    // 모듈 생성
    const result = await DB.prepare(`
      INSERT INTO homepage_modules (
        module_type, display_order, is_active, container_type,
        background_color, background_image,
        padding_top, padding_bottom, margin_top, margin_bottom,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      module_type,
      display_order || 0,
      is_active,
      container_type,
      background_color || null,
      background_image || null,
      padding_top,
      padding_bottom,
      margin_top,
      margin_bottom,
      user?.userId || null
    ).run()

    const moduleId = result.meta.last_row_id

    // 설정 저장
    for (const [key, value] of Object.entries(settings)) {
      let settingValue = value;
      let settingType = 'string';
      
      if (typeof value === 'object') {
        settingValue = JSON.stringify(value);
        settingType = 'json';
      } else if (typeof value === 'number') {
        settingType = 'number';
      } else if (typeof value === 'boolean') {
        settingType = 'boolean';
        settingValue = value ? '1' : '0';
      } else {
        settingValue = String(value);
      }

      await DB.prepare(`
        INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type)
        VALUES (?, ?, ?, ?)
      `).bind(moduleId, key, settingValue, settingType).run()
    }

    // 슬라이드 항목 저장
    if (module_type === 'slides' && Array.isArray(slides)) {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        await DB.prepare(`
          INSERT INTO homepage_slides (
            module_id, slide_order, title, subtitle, image_url, image_alt, link_url, link_text, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          moduleId,
          i,
          slide.title || null,
          slide.subtitle || null,
          slide.image_url || '',
          slide.image_alt || null,
          slide.link_url || null,
          slide.link_text || null,
          slide.is_active !== false ? 1 : 0
        ).run()
      }
    }

    return c.json({ success: true, message: '모듈이 생성되었습니다.', id: moduleId })
  } catch (error: any) {
    console.error('모듈 생성 오류:', error);
    return c.json({ success: false, message: error.message }, 500)
  }
})

// 모듈 업데이트
modules.put('/:id', async (c) => {
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '최고 관리자만 접근할 수 있습니다.' }, 403);
  }

  const { DB } = c.env
  const moduleId = parseInt(c.req.param('id'))
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const user = await getUserFromToken(token!);
  
  const data = await c.req.json()
  const {
    display_order,
    is_active,
    container_type,
    background_color,
    background_image,
    padding_top,
    padding_bottom,
    margin_top,
    margin_bottom,
    settings = {},
    slides = []
  } = data

  try {
    // 모듈 업데이트
    await DB.prepare(`
      UPDATE homepage_modules
      SET 
        display_order = ?,
        is_active = ?,
        container_type = ?,
        background_color = ?,
        background_image = ?,
        padding_top = ?,
        padding_bottom = ?,
        margin_top = ?,
        margin_bottom = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      display_order,
      is_active,
      container_type,
      background_color || null,
      background_image || null,
      padding_top,
      padding_bottom,
      margin_top,
      margin_bottom,
      user?.userId || null,
      moduleId
    ).run()

    // 기존 설정 삭제 후 재생성
    await DB.prepare(`DELETE FROM homepage_module_settings WHERE module_id = ?`).bind(moduleId).run()

    // 새 설정 저장
    for (const [key, value] of Object.entries(settings)) {
      let settingValue = value;
      let settingType = 'string';
      
      if (typeof value === 'object') {
        settingValue = JSON.stringify(value);
        settingType = 'json';
      } else if (typeof value === 'number') {
        settingType = 'number';
      } else if (typeof value === 'boolean') {
        settingType = 'boolean';
        settingValue = value ? '1' : '0';
      } else {
        settingValue = String(value);
      }

      await DB.prepare(`
        INSERT INTO homepage_module_settings (module_id, setting_key, setting_value, setting_type)
        VALUES (?, ?, ?, ?)
      `).bind(moduleId, key, settingValue, settingType).run()
    }

    // 슬라이드 모듈인 경우 슬라이드 항목 업데이트
    const module = await DB.prepare(`SELECT module_type FROM homepage_modules WHERE id = ?`).bind(moduleId).first() as any;
    if (module?.module_type === 'slides' && Array.isArray(slides)) {
      // 기존 슬라이드 삭제
      await DB.prepare(`DELETE FROM homepage_slides WHERE module_id = ?`).bind(moduleId).run()
      
      // 새 슬라이드 저장
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        await DB.prepare(`
          INSERT INTO homepage_slides (
            module_id, slide_order, title, subtitle, image_url, image_alt, link_url, link_text, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          moduleId,
          i,
          slide.title || null,
          slide.subtitle || null,
          slide.image_url || '',
          slide.image_alt || null,
          slide.link_url || null,
          slide.link_text || null,
          slide.is_active !== false ? 1 : 0
        ).run()
      }
    }

    return c.json({ success: true, message: '모듈이 업데이트되었습니다.' })
  } catch (error: any) {
    console.error('모듈 업데이트 오류:', error);
    return c.json({ success: false, message: error.message }, 500)
  }
})

// 모듈 삭제
modules.delete('/:id', async (c) => {
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '최고 관리자만 접근할 수 있습니다.' }, 403);
  }

  const { DB } = c.env
  const moduleId = parseInt(c.req.param('id'))

  try {
    // CASCADE로 설정되어 있어서 관련 데이터도 자동 삭제됨
    await DB.prepare(`DELETE FROM homepage_modules WHERE id = ?`).bind(moduleId).run()

    return c.json({ success: true, message: '모듈이 삭제되었습니다.' })
  } catch (error: any) {
    console.error('모듈 삭제 오류:', error);
    return c.json({ success: false, message: error.message }, 500)
  }
})

// 모듈 순서 업데이트 (일괄)
modules.post('/reorder', async (c) => {
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '최고 관리자만 접근할 수 있습니다.' }, 403);
  }

  const { DB } = c.env
  const { moduleOrders } = await c.req.json() // [{id: 1, display_order: 0}, {id: 2, display_order: 1}, ...]

  try {
    for (const item of moduleOrders) {
      await DB.prepare(`
        UPDATE homepage_modules
        SET display_order = ?
        WHERE id = ?
      `).bind(item.display_order, item.id).run()
    }

    return c.json({ success: true, message: '모듈 순서가 업데이트되었습니다.' })
  } catch (error: any) {
    console.error('모듈 순서 업데이트 오류:', error);
    return c.json({ success: false, message: error.message }, 500)
  }
})

export default modules

