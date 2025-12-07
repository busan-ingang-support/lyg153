import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'
import { verifyToken } from '../utils/auth'

const homepage = new Hono<{ Bindings: CloudflareBindings }>()

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

// 홈페이지 설정 조회 (공개 API - 인증 불필요)
homepage.get('/', async (c) => {
  const { DB } = c.env
  const siteId = c.get('siteId') || 1

  const result = await DB.prepare(`
    SELECT setting_key, setting_value, setting_type, description
    FROM system_settings
    WHERE setting_key LIKE 'homepage_%'
      AND site_id = ?
    ORDER BY setting_key
  `).bind(siteId).all()

  // 설정값을 객체로 변환
  const settings: Record<string, any> = {};
  result.results.forEach((row: any) => {
    const key = row.setting_key.replace('homepage_', '');
    let value = row.setting_value;

    // JSON 파싱 시도
    if (row.setting_type === 'json') {
      try {
        value = JSON.parse(value);
      } catch {
        // 파싱 실패 시 원본 값 사용
      }
    }

    settings[key] = value;
  })

  return c.json({ success: true, settings, siteId })
})

// 홈페이지 설정 조회 (관리자용 - 인증 필요)
homepage.get('/admin', async (c) => {
  // 최고 관리자 권한 체크
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '홈페이지 관리는 최고 관리자만 접근할 수 있습니다.' }, 403);
  }

  const { DB } = c.env
  const siteId = c.get('siteId') || 1

  const result = await DB.prepare(`
    SELECT setting_key, setting_value, setting_type, description
    FROM system_settings
    WHERE setting_key LIKE 'homepage_%'
      AND site_id = ?
    ORDER BY setting_key
  `).bind(siteId).all()

  // 설정값을 객체로 변환
  const settings: Record<string, any> = {};
  result.results.forEach((row: any) => {
    const key = row.setting_key.replace('homepage_', '');
    let value = row.setting_value;
    
    // JSON 파싱 시도
    if (row.setting_type === 'json') {
      try {
        value = JSON.parse(value);
      } catch {
        // 파싱 실패 시 원본 값 사용
      }
    }
    
    settings[key] = value;
  })

  return c.json({ success: true, settings })
})

// 홈페이지 설정 저장
homepage.post('/', async (c) => {
  // 최고 관리자 권한 체크
  const hasPermission = await checkSuperAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '홈페이지 관리는 최고 관리자만 수정할 수 있습니다.' }, 403);
  }

  const { DB } = c.env
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const user = await getUserFromToken(token!);
  const siteId = c.get('siteId') || 1

  const settings = await c.req.json()

  try {
    // 각 설정값을 저장
    for (const [key, value] of Object.entries(settings)) {
      const settingKey = `homepage_${key}`;
      let settingValue = value;
      let settingType = 'string';

      // 값 타입에 따라 처리
      if (typeof value === 'object') {
        settingValue = JSON.stringify(value);
        settingType = 'json';
      } else {
        settingValue = String(value);
      }

      // 기존 설정 확인 (site_id 포함)
      const existing = await DB.prepare(`
        SELECT id FROM system_settings WHERE setting_key = ? AND site_id = ?
      `).bind(settingKey, siteId).first()

      if (existing) {
        // 업데이트
        await DB.prepare(`
          UPDATE system_settings
          SET setting_value = ?, setting_type = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE setting_key = ? AND site_id = ?
        `).bind(settingValue, settingType, user?.userId || null, settingKey, siteId).run()
      } else {
        // 생성
        await DB.prepare(`
          INSERT INTO system_settings (site_id, setting_key, setting_value, setting_type, description, updated_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(siteId, settingKey, settingValue, settingType, `홈페이지 ${key} 설정`, user?.userId || null).run()
      }
    }

    return c.json({ success: true, message: '홈페이지 설정이 저장되었습니다.' })
  } catch (error: any) {
    console.error('홈페이지 설정 저장 오류:', error);
    return c.json({ success: false, message: error.message }, 500)
  }
})

export default homepage

