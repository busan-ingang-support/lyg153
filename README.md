# 학적 관리 시스템 (lyg153)

대안학교를 위한 통합 학적 관리 시스템

## 🔗 링크
- **프로덕션:** https://2a04156c.lyg153.pages.dev/
- **GitHub:** https://github.com/busan-ingang-support/lyg153
- **대시보드:** https://dash.cloudflare.com/5d199369a23f91feb4ef82d6679e73c3/pages/view/lyg153

## 💻 기술 스택
- **프레임워크:** Hono + TypeScript
- **배포:** Cloudflare Pages
- **데이터베이스:** Cloudflare D1 (SQLite)
- **스타일:** TailwindCSS v3

---

## 🚀 빠른 시작

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

## 🔑 테스트 계정
| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin | admin123 |
| 교사 | teacher1 | teacher123 |
| 학생 | student1 | student123 |
| 학부모 | parent1 | parent123 |

---

## 🏗️ 프로젝트 구조

### 개발 환경
- **로컬 DB:** `.wrangler/state/v3/d1/` (프로덕션과 분리)
- **용도:** 개발 및 테스트 전용

### 프로덕션 환경
- **DB:** Cloudflare D1 (클라우드)
- **배포:** Cloudflare Pages
- **용도:** 실제 서비스

### 중요 파일
```
malgn_edu/
├── migrations/              # DB 스키마 변경 (중요!)
├── seed.sql                 # 테스트 데이터 (로컬 전용)
├── production-data.sql      # 운영 데이터 추가용
├── src/
│   ├── index.tsx           # 메인 진입점
│   ├── routes/             # API 라우트
│   └── middleware/         # 인증 미들웨어
├── public/static/          # 프론트엔드 JS/CSS
└── wrangler.jsonc          # Cloudflare 설정
```

---

## 🔄 일반 워크플로우

### 개발 프로세스
```bash
# 1. 로컬에서 개발
npm run dev

# 2. DB 스키마 변경 시
# migrations/ 폴더에 새 SQL 파일 생성
# 예: migrations/0007_add_new_table.sql

# 3. 로컬 테스트
npm run db:reset

# 4. Git 커밋 & 푸시
git add -A
git commit -m "기능 추가"
git push origin main

# 5. 프로덕션 배포
npm run deploy:full
```

### Git 설정 (다중 GitHub 계정)
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

## ⚠️ 중요 사항

### 배포 명령어 주의
| 명령어 | 스키마 | 데이터 | 코드 | 사용처 |
|--------|--------|--------|------|--------|
| `deploy:full` | ✅ | ❌ | ✅ | **일반 개발** |
| `deploy:db` | ✅ | ❌ | ❌ | DB만 수정 |
| `deploy` | ❌ | ❌ | ✅ | 코드만 수정 |
| `deploy:init` | ✅ | ⚠️ | ✅ | **처음 한 번만** |
| `db:data:prod` | ❌ | ✅ | ❌ | 운영 데이터 추가 |

**주의:**
- `deploy:full`은 **데이터를 건드리지 않음** (안전)
- `deploy:init`는 시드 데이터를 실행하므로 **기존 데이터 주의**
- 마이그레이션 파일은 한 번 배포 후 수정 금지

---

## 📊 주요 기능

### ✅ 완료된 기능

#### 🎨 UI/UX
1. **공개 홈페이지** - 로그인 전 학교 소개 페이지 (학교 정보, 교훈, 위치 등)
2. **역할별 대시보드** - 로그인 후 역할에 따라 다른 UI/메뉴 표시
   - **학생**: 시간표, 성적 조회, 반 커뮤니티, 과목 Q&A
   - **교사**: 담당 반/과목 관리, 출석/성적 입력, 상담 기록
   - **관리자**: 전체 학생/교사/반/과목 관리, 시스템 설정
   - **학부모**: 자녀 정보 조회, 성적 확인

#### 📚 핵심 기능
3. **사용자 관리** - 5가지 권한 레벨 (학생/학부모/교사/관리자/최고관리자)
4. **학생 관리** - 20+ 필드 (기본정보, 보호자, 학력, 건강정보)
5. **학기/과목 관리** - 학기별 과목 관리, 교사-과목 연결
6. **반 관리** - 반 생성, 학생 배정, 담임 배정
7. **출석 관리** - 날짜별 출석 입력, 통계, 검색/필터링 (담임+과목 교사)
8. **성적 관리** - 학생별 수강 과목 조회, 반별 성적 현황 (담임+과목 교사)
9. **봉사활동 관리** - 활동 등록, 승인, 통계
10. **동아리 관리** - 동아리 생성, 회원 관리, 활동 기록
11. **상담 관리** - 상담 기록 CRUD, 유형별 분류 (담임+과목 교사)
12. **시스템 설정** - 학교 정보, 출석/성적/봉사 설정
13. **담임 배정** - 학기별 담임 교사 관리
14. **성적표 출력** - 학기별 성적표 조회 및 PDF 출력
15. **생활기록부** - 종합 학생 정보 조회 및 PDF 출력
16. **교사 권한 관리** - 과목별 담당 교사 배정, 권한 세분화

### 🚧 추가 예정
- 성적 입력 고도화
- 수강 신청 시스템
- 대시보드 통계 차트
- 알림 시스템

---

## 📋 데이터베이스 구조

### 주요 테이블 (24개)
- `users` - 사용자 계정
- `students` - 학생 정보 (20+ 필드)
- `teachers` - 교사 정보
- `semesters` - 학기
- `classes` - 반
- `subjects` - 과목 (+ `teacher_id` 담당 교사)
- `courses` - 수업
- `enrollments` - 수강 신청
- `attendance` - 출석 기록
- `grades` - 성적
- `volunteer_activities` - 봉사활동
- `clubs` - 동아리
- `counseling_records` - 상담 내역
- `student_class_history` - 반 배정 이력
- `teacher_homeroom` - 담임 배정
- `teacher_permissions` - 교사 권한
- `system_settings` - 시스템 설정
- 외 7개 테이블

---

## 📞 문의
- **개발:** AI Assistant
- **의뢰:** 예광
- **목적:** 기독교 대안학교 학적 관리

## 📝 라이선스
MIT License

---

## 🔧 보안 주의사항
⚠️ 현재 버전은 개발용입니다
- 비밀번호 해싱 강화 필요
- JWT 시크릿 환경 변수 관리
- HTTPS 사용 권장
- 입력값 검증 강화 필요

---

**마지막 업데이트:** 2025-11-14
**현재 버전:** v0.9.1

**주요 변경사항 (v0.9.1):**
- 과목에 담당 교사 연결 기능 추가 (`subjects.teacher_id`)
- 과목 추가 페이지 UI 개선 (모달 → 전용 페이지)
- 사용자 관리에서 교사-과목 연결 관리 기능
- 교사의 출석/성적/상담 관리 범위를 담임반 + 담당과목으로 확대

**이전 주요 업데이트:**
- 역할별 UI/메뉴 분리 (학생/교사/관리자/학부모)
- 학교 공개 홈페이지 추가 (로그인 전 화면)
- 학생 포털 (시간표, 반 커뮤니티, 과목 Q&A, 게시판)
- 교사 대시보드 (담당 반/과목 중심 UI)
