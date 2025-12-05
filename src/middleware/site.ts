import { Context, Next } from 'hono';
import type { CloudflareBindings } from '../types/bindings';

/**
 * 도메인별 site_id 매핑
 * - lyg153.pages.dev → site_id = 1
 * - lyg153.healthyeduministry.com → site_id = 2
 * - localhost → site_id = 1 (개발 환경)
 */
const DOMAIN_SITE_MAP: Record<string, number> = {
  'localhost': 1,
  '127.0.0.1': 1,
  'lyg153.pages.dev': 1,
  '2a04156c.lyg153.pages.dev': 1, // Cloudflare Pages preview
  'lyg153.healthyeduministry.com': 2,
};

/**
 * 도메인에서 site_id를 추출하여 컨텍스트에 저장하는 미들웨어
 */
export async function siteMiddleware(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  // 요청 호스트명 추출
  const host = c.req.header('host') || 'localhost';
  const hostname = host.split(':')[0]; // 포트 제거

  // 도메인에서 site_id 매핑
  let siteId = DOMAIN_SITE_MAP[hostname];

  // 매핑되지 않은 도메인인 경우 기본값 1 사용
  if (!siteId) {
    console.warn(`Unknown domain: ${hostname}, defaulting to site_id=1`);
    siteId = 1;
  }

  // site_id를 컨텍스트에 저장
  c.set('siteId', siteId);

  await next();
}

/**
 * 현재 요청의 site_id를 가져오는 헬퍼 함수
 */
export function getSiteId(c: Context<{ Bindings: CloudflareBindings }>): number {
  const siteId = c.get('siteId');
  return siteId || 1;
}

/**
 * super_admin이 다른 사이트에 접근할 때 사용하는 미들웨어
 * Authorization 헤더에 X-Site-Override 헤더가 있으면 해당 site_id 사용
 */
export async function siteOverrideMiddleware(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const siteOverride = c.req.header('X-Site-Override');
  const userRole = c.get('userRole');

  // super_admin만 사이트 오버라이드 가능
  if (siteOverride && userRole === 'super_admin') {
    const overrideSiteId = parseInt(siteOverride, 10);
    if (!isNaN(overrideSiteId) && overrideSiteId > 0) {
      c.set('siteId', overrideSiteId);
    }
  }

  await next();
}
