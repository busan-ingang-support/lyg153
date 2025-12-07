import { Context, Next } from 'hono';
import type { CloudflareBindings } from '../types/bindings';

// 도메인-사이트 매핑 캐시 (성능 최적화)
let domainCache: Map<string, number> = new Map();
let cacheExpiry: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * DB에서 도메인-사이트 매핑 조회
 */
async function getDomainMapping(db: D1Database): Promise<Map<string, number>> {
  const now = Date.now();

  // 캐시가 유효하면 캐시 반환
  if (domainCache.size > 0 && now < cacheExpiry) {
    return domainCache;
  }

  // DB에서 조회
  try {
    const { results } = await db.prepare(`
      SELECT id, domain FROM sites WHERE is_active = 1
    `).all();

    const newCache = new Map<string, number>();

    // 개발 환경 기본값
    newCache.set('localhost', 1);
    newCache.set('127.0.0.1', 1);

    // DB에서 가져온 도메인 매핑
    if (results) {
      for (const site of results as any[]) {
        if (site.domain) {
          newCache.set(site.domain, site.id);
        }
      }
    }

    domainCache = newCache;
    cacheExpiry = now + CACHE_TTL;

    return domainCache;
  } catch (error) {
    console.error('도메인 매핑 조회 오류:', error);
    // 오류 시 기본값 반환
    return new Map([['localhost', 1], ['127.0.0.1', 1]]);
  }
}

/**
 * 도메인에서 site_id를 추출하여 컨텍스트에 저장하는 미들웨어
 * - DB 기반 동적 매핑 (코드 수정 없이 사이트 추가 가능)
 */
export async function siteMiddleware(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  // 요청 호스트명 추출
  const host = c.req.header('host') || 'localhost';
  const hostname = host.split(':')[0]; // 포트 제거

  // DB에서 도메인 매핑 조회
  const domainMap = await getDomainMapping(c.env.DB);

  // 정확한 도메인 매칭
  let siteId = domainMap.get(hostname);

  // 정확히 매핑되지 않은 경우 패턴 매칭
  if (!siteId) {
    // Cloudflare Pages preview 도메인 (*.lyg153.pages.dev)
    if (hostname.endsWith('.lyg153.pages.dev')) {
      siteId = domainMap.get('lyg153.pages.dev') || 1;
    }
    // 서브도메인 패턴 매칭 (예: sub.example.com -> example.com)
    else {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const baseDomain = parts.slice(-2).join('.');
        siteId = domainMap.get(baseDomain);
      }
    }

    // 여전히 없으면 기본값
    if (!siteId) {
      console.warn(`Unknown domain: ${hostname}, defaulting to site_id=1`);
      siteId = 1;
    }
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
