# 학적 관리 시스템 (Multi-tenant SaaS)

대안학교를 위한 **멀티테넌트** 통합 학적 관리 시스템

## 링크
- **프로덕션:** https://2a04156c.lyg153.pages.dev/
- **GitHub:** https://github.com/busan-ingang-support/lyg153
- **대시보드:** https://dash.cloudflare.com/5d199369a23f91feb4ef82d6679e73c3/pages/view/lyg153

## 기술 스택
- **프레임워크:** Hono + TypeScript
- **배포:** Cloudflare Pages
- **데이터베이스:** Cloudflare D1 (SQLite)
- **스타일:** TailwindCSS v3
- **지도:** Naver Maps API

---

## 빠른 시작

### 로컬 개발
```bash
# 1. 의존성 설치
npm install

# 2. 로컬 DB 초기화
npm run db:reset

# 3. CSS 빌드
npm run build:css

# 4. 개발 서버 실행
npm run dev  # http://localhost:5173
```

### 프로덕션 배포
```bash
# 스키마 변경 + 코드 배포 (일반적)
npm run deploy:full

# DB 스키마만 변경
npm run deploy:db

# 코드만 배포
npm run deploy

# 실제 데이터 추가
npm run db:data:prod  # production-data.sql 실행
```

## 테스트 계정
| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 최고관리자 | lyg | lyg123 |
| 관리자 | admin | admin123 |
| 교사 | teacher | teacher123 |
| 학생 | student | student123 |
| 학부모 | parent | parent123 |

> 모든 사이트에서 동일한 아이디 사용 (site_id로 구분)

---

## 프로젝트 구조

### 디렉토리
```
malgn_edu/
├── migrations/              # DB 스키마 변경 (16개 파일)
├── seed.sql                 # 테스트 데이터 (로컬 전용)
├── production-data.sql      # 운영 데이터 추가용
├── src/
│   ├── index.tsx           # 메인 진입점 + HTML 템플릿
│   ├── routes/             # API 라우트 (29개)
│   ├── middleware/         # 인증/사이트 미들웨어
│   ├── utils/              # 유틸리티 함수
│   └── types.ts            # TypeScript 타입 정의
├── public/static/          # 프론트엔드 JS/CSS (20개 JS 파일)
└── wrangler.jsonc          # Cloudflare 설정
```

### API 라우트 (29개)
| 라우트 | 설명 |
|--------|------|
| `/api/auth` | 로그인/로그아웃 |
| `/api/users` | 사용자 관리 |
| `/api/students` | 학생 관리 |
| `/api/teachers` | 교사 관리 |
| `/api/classes` | 반 관리 |
| `/api/semesters` | 학기 관리 |
| `/api/subjects` | 과목 관리 |
| `/api/courses` | 수업 관리 |
| `/api/schedules` | 시간표 관리 |
| `/api/attendance` | 출석 관리 |
| `/api/grades` | 성적 관리 |
| `/api/volunteer` | 봉사활동 |
| `/api/clubs` | 동아리 |
| `/api/counseling` | 상담 기록 |
| `/api/awards` | 수상 내역 |
| `/api/reading` | 독서 기록 |
| `/api/assignments` | 과제 관리 |
| `/api/boards` | 게시판 |
| `/api/course-qna` | 과목 Q&A |
| `/api/homepage` | 학교 홈페이지 설정 |
| `/api/homepage-modules` | 홈페이지 모듈 관리 |
| `/api/notifications` | 알림 |
| `/api/settings` | 시스템 설정 |
| `/api/module-settings` | 모듈 활성화 설정 |
| `/api/teacher-homeroom` | 담임 배정 |
| `/api/teacher-permissions` | 교사 권한 |
| `/api/student-class-history` | 반 배정 이력 |
| `/api/student-report` | 학생 리포트 |
| `/api/sites` | 사이트 관리 (super_admin) |

### 프론트엔드 JS (20개)
| 파일 | 설명 |
|------|------|
| `app.js` | 메인 앱 로직, 라우팅, 인증 |
| `public-home.js` | 공개 홈페이지 |
| `student-home.js` | 학생 포털 |
| `parent-home.js` | 학부모 포털 |
| `admin.js` | 관리자 기능 |
| `user-management.js` | 사용자 관리 |
| `teacher-management.js` | 교사 관리 |
| `student-detail.js` | 학생 상세 |
| `class-detail.js` | 반 상세 |
| `subject-management.js` | 과목 관리 |
| `schedule-management.js` | 시간표 관리 |
| `attendance-improved.js` | 출석 관리 |
| `assignment-management.js` | 과제 관리 |
| `counseling.js` | 상담 관리 |
| `reports.js` | 성적표/생활기록부 출력 |
| `settings.js` | 시스템 설정 |
| `homepage-module-management.js` | 홈페이지 모듈 관리 |
| `add-pages-functions.js` | 추가 페이지 기능 |
| `naver-map.js` | 네이버 지도 연동 |

---

## 주요 기능

### 멀티테넌트 아키텍처
- **사이트별 데이터 분리**: 모든 테이블에 `site_id` 컬럼
- **도메인 기반 자동 매핑**: 도메인별로 사이트 자동 구분
- **사이트 관리**: 최고관리자가 새 사이트 추가/관리

### 역할별 기능

#### 학생
- 개인 시간표 조회
- 성적 조회
- 반 커뮤니티 게시판
- 과목별 Q&A
- 과제 확인 및 제출

#### 학부모
- 자녀 정보 조회
- 성적/출석 현황 확인
- 상담 기록 열람

#### 교사
- 담당 반/과목 관리
- 출석 입력 (담임반 + 담당과목)
- 성적 입력 (담임반 + 담당과목)
- 상담 기록 작성
- 과제 출제 및 관리

#### 관리자
- 학생/교사/반/과목 전체 관리
- 학기 관리
- 시스템 설정
- 홈페이지 모듈 설정
- 교사 권한 관리

#### 최고관리자 (super_admin)
- 사이트 추가/수정/삭제
- 전체 시스템 관리

### 핵심 모듈
1. **사용자 관리** - 5가지 권한 레벨
2. **학생 관리** - 20+ 필드 (기본정보, 보호자, 학력, 건강정보)
3. **학기/과목 관리** - 학기별 과목, 교사-과목 연결
4. **반 관리** - 반 생성, 학생 배정, 담임 배정
5. **시간표 관리** - 요일/교시별 수업 배정
6. **출석 관리** - 날짜별 출석 입력, 통계
7. **성적 관리** - 학생별/반별 성적 현황
8. **봉사활동** - 활동 등록, 승인, 통계
9. **동아리** - 동아리 생성, 회원 관리
10. **상담 관리** - 상담 기록, 유형별 분류
11. **과제 관리** - 과제 출제, 제출, 채점
12. **수상/독서** - 수상 내역, 독서 기록
13. **홈페이지 관리** - 모듈별 컨텐츠 관리 (뉴스, 연혁, 교훈 등)
14. **성적표 출력** - PDF 출력
15. **생활기록부** - 종합 정보 PDF 출력

---

## 데이터베이스

### 주요 테이블
| 테이블 | 설명 |
|--------|------|
| `sites` | 사이트 (멀티테넌트) |
| `users` | 사용자 계정 |
| `students` | 학생 정보 (20+ 필드) |
| `teachers` | 교사 정보 |
| `semesters` | 학기 |
| `classes` | 반 |
| `subjects` | 과목 |
| `courses` | 수업 |
| `schedules` | 시간표 |
| `enrollments` | 수강 신청 |
| `attendance` | 출석 기록 |
| `grades` | 성적 |
| `assignments` | 과제 |
| `assignment_submissions` | 과제 제출 |
| `volunteer_activities` | 봉사활동 |
| `clubs` | 동아리 |
| `counseling_records` | 상담 내역 |
| `awards` | 수상 내역 |
| `reading_records` | 독서 기록 |
| `boards` | 게시판 |
| `board_posts` | 게시글 |
| `homepage_modules` | 홈페이지 모듈 |
| `teacher_homeroom` | 담임 배정 |
| `teacher_permissions` | 교사 권한 |
| `student_class_history` | 반 배정 이력 |
| `system_settings` | 시스템 설정 |
| `module_settings` | 모듈 활성화 |

---

## 배포 명령어

| 명령어 | 스키마 | 데이터 | 코드 | 사용처 |
|--------|--------|--------|------|--------|
| `deploy:full` | O | X | O | **일반 개발** |
| `deploy:db` | O | X | X | DB만 수정 |
| `deploy` | X | X | O | 코드만 수정 |
| `deploy:init` | O | ! | O | **처음 한 번만** |
| `db:data:prod` | X | O | X | 운영 데이터 추가 |

**주의:**
- `deploy:full`은 데이터를 건드리지 않음 (안전)
- `deploy:init`는 시드 데이터 실행하므로 기존 데이터 주의
- 마이그레이션 파일은 배포 후 수정 금지

---

## Git 설정

### 다중 GitHub 계정
```bash
# SSH Config (~/.ssh/config)
Host github.com-busan
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_busan

# Git Remote
origin: git@github.com-busan:busan-ingang-support/lyg153.git
```

---

## 보안 주의사항

현재 버전은 개발용입니다:
- 비밀번호 해싱: SHA-256 (bcrypt 권장)
- 토큰: Base64 인코딩 (실제 JWT 권장)
- HTTPS 사용 권장
- 입력값 검증 강화 필요

---

## 문의
- **개발:** AI Assistant (Claude)
- **의뢰:** 예광
- **목적:** 기독교 대안학교 학적 관리

## 라이선스
MIT License

---

**마지막 업데이트:** 2025-12-07
**현재 버전:** v1.0.0

### 최근 변경사항 (v1.0.0)
- 멀티테넌트 아키텍처 완성 (site_id 기반 데이터 분리)
- 사이트 관리 기능 추가 (super_admin)
- 시간표 관리 개선
- 홈페이지 모듈 관리 (뉴스, 연혁, 교훈, 위치 등)
- 네이버 지도 연동
- 과제 관리 시스템
- 인증 안정성 개선 (토큰 만료 체크)

### 이전 주요 업데이트 (v0.9.x)
- 역할별 UI/메뉴 분리
- 공개 홈페이지 추가
- 학생/학부모 포털
- 교사 대시보드
- 과목별 담당 교사 연결
