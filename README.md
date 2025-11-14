# 학적 관리 시스템 (School Management System)

대안학교를 위한 통합 학적 관리 시스템

## 프로젝트 개요

- **이름**: 학적 관리 시스템
- **목적**: 대안학교의 학생, 교사, 학부모, 관리자를 위한 통합 관리 플랫폼
- **기술 스택**: Hono + TypeScript + Cloudflare Pages + D1 Database + TailwindCSS

## 주요 기능

### ✅ 완료된 기능

1. **사용자 관리 (완료)** ⭐
   - 5가지 권한 레벨 (학생, 학부모, 교사, 관리자, 최고관리자)
   - 로그인/로그아웃 시스템
   - 사용자 CRUD
   - 역할 기반 접근 제어 미들웨어

2. **학생 관리 (완료)** ⭐⭐⭐
   - **학생 등록 페이지** - 별도 페이지로 상세 정보 입력
     - 기본 정보: 이름, 학번, 이메일, 연락처, 생년월일, 성별, 혈액형, 종교, 국적
     - 학적 정보: 학년, 입학일, 주소, 비상연락처, 상태
     - 보호자 정보: 이름, 관계, 연락처, 이메일, 주소
     - 이전 학력: 이전 학교명, 학교 유형
     - 건강 정보: 의료 특이사항, 알레르기 정보, 기타 특이사항
   - **학생 상세 페이지** - 전체 정보 조회 (모달 아님)
     - 프로필 카드 (사진, 기본 정보, 현재 반)
     - 기본 정보 섹션 (생년월일, 성별, 혈액형, 종교, 국적 등)
     - 보호자 정보 섹션
     - 이전 학력 섹션
     - 건강 및 특이사항 섹션
   - **학생 수정 페이지** - 모든 정보 수정 가능
   - 학생 목록 조회 및 실시간 검색
   - **학기별 반 배정 이력 관리** (student_class_history)
   - 현재 활성 학기의 반 자동 표시

3. **학기/과목 관리 (완료)** ⭐
   - 학기 추가 폼 (연도, 학기, 기간, 현재 학기 설정)
   - 과목 추가 폼 (과목명, 코드, 학점, 필수/선택)
   - 과목 목록 조회 및 필수/선택 분류
   - 현재 학기 하이라이트 표시

4. **반 관리 (완료)** ⭐⭐
   - 반 추가 폼 (반 이름, 학년, 학기, 담임교사, 교실)
   - 반 목록 조회 (카드 형식)
   - **반 상세 페이지** - 통합 관리 인터페이스
     - 반 학생 목록 (추가/제외 기능)
     - 반별 출석 관리
     - 반별 성적 현황
     - 반 통계
   - 담임교사 정보 표시

5. **출석 관리 (완료)** ⭐⭐⭐
   - **전체 학생 출석 모드** - 학교 전체 학생 출석 조회 및 입력
   - **반별 출석 모드** - 특정 반 학생만 출석 관리
   - **날짜별 출석 입력** - 드롭다운으로 출석 상태 선택 (출석, 결석, 지각, 인정결석, 미입력)
   - **비고 입력** - 각 학생별 출석 비고 입력
   - **실시간 통계** - 출석 입력 시 통계 자동 업데이트
   - **일괄 저장** - 전체 학생 출석 한 번에 저장
   - **출석률 통계 카드** - 전체/출석/결석/지각/인정결석/미입력 통계

6. **성적 관리 (기본 완료)** ✅
   - 학생별 수강 과목 조회
   - 반별 성적 현황 조회
   - 수강 상태 표시
   - 성적 입력 준비 (API 연동 필요)

7. **봉사활동 관리 (완료)** ⭐
   - 봉사활동 등록 폼 (학생, 활동명, 기관, 시간, 카테고리)
   - 봉사활동 목록 조회
   - 승인 상태별 통계 (전체/대기/승인)
   - 카테고리별 분류

8. **동아리 관리 (완료)** ⭐
   - 동아리 추가 폼 (이름, 설명, 지도교사, 학기, 정원)
   - 동아리 목록 조회 (카드 형식)
   - 동아리별 회원 목록 모달
   - 지도교사 정보 표시

9. **상담 관리 (신규 완료)** ⭐⭐
   - 상담 기록 추가/수정/삭제
   - 상담 유형별 분류 (학업/진로/개인/행동/가정/기타)
   - 날짜 및 유형별 필터링
   - 후속 조치 관리
   - 학부모 통지 여부
   - 비밀 상담 지원
   - 학생별 상담 통계

10. **시스템 설정 (신규 완료)** ⭐⭐
    - 학교 기본 정보 설정
    - 학사 일정 설정 (학년도, 학기 기간)
    - 출석 관리 설정 (확정 기간, 지각 기준, 자동 결석)
    - 성적 관리 설정 (계산 방식, 등급 기준)
    - 봉사활동 설정 (필수 시간, 승인 권한)
    - 설정 일괄 저장 기능

11. **담임 교사 배정 (신규 완료)** ⭐⭐
    - 학기별 담임 교사 배정 관리
    - 반별 담임 교사 조회
    - 담임 배정/변경/해제 기능
    - 교사별 담임 반 조회

12. **성적표 출력 (신규 완료)** ⭐⭐⭐
    - **학생 선택 페이지** - 성적표 출력 메뉴에서 학생 검색
    - **학기별 성적표** - 과목별 성적, 평균, 학점 표시
    - **세부 성적 조회** - 시험 유형별(중간/기말/과제/퀴즈) 상세 성적
    - **출석 현황 포함** - 출석일수, 결석, 지각, 출석률
    - **학기 선택 기능** - 드롭다운으로 이전 학기 성적 조회
    - **자동 학기 선택** - 현재 학기가 기본으로 선택됨
    - **인쇄/PDF 출력** - 브라우저 인쇄 대화상자를 통한 PDF 저장

13. **생활기록부 (신규 완료)** ⭐⭐⭐
    - **학생 선택 페이지** - 생활기록부 메뉴에서 학생 검색
    - **종합 학생 정보** - 기본정보, 연락처, 보호자 정보
    - **반 배정 이력** - 학기별 소속 반 변경 기록
    - **출석 통계** - 전체 출석 현황 요약
    - **성적 기록** - 학기별, 과목별 성적
    - **봉사활동 내역** - 기관, 활동명, 시간, 승인상태
    - **동아리 활동** - 가입 동아리 및 활동 기록
    - **특별 기록** - 행동, 수상, 징계, 건강 등 특이사항
    - **상담 기록** - 상담 유형, 내용, 후속조치
    - **인쇄/PDF 출력** - 브라우저 인쇄 대화상자를 통한 PDF 저장

14. **출석 검색 및 필터링 (신규 완료)** ⭐⭐
    - 학생 이름/학번 실시간 검색
    - 반별 필터링
    - 전체 학생 출석 페이지에서 검색 기능
    - 반 관리 페이지에서 출석 체크 가능

15. **프로덕션 빌드 최적화 (신규 완료)** ⭐
    - Tailwind CSS v3 프로덕션 빌드 (CDN 제거)
    - PostCSS + Autoprefixer 통합
    - 22KB 컴파일된 CSS 파일
    - SVG 데이터 URI favicon (404 오류 제거)

### 🚧 미완성/개선 필요 기능

1. **출석 관리 고도화**
   - 출석 통계 차트
   - 월별/학기별 출석률 집계
   - ✅ ~~반별 출석 입력 기능~~ (완료)

2. **성적 관리 고도화**
   - 성적 입력 상세 폼
   - 시험 유형별 성적 입력
   - 최종 성적 자동 계산 및 표시
   - 반별 성적 순위

5. **과목 교사 전용 페이지** (낮은 우선순위)
   - 과목별 수강 학생 목록
   - 과목별 성적 입력
   - 과목 담당 교사 전용 뷰

6. **수강 신청 시스템**
   - 학생별 수강 신청
   - 수강 취소 기능
   - 수강 인원 제한 관리

7. **대시보드 개선** (낮은 우선순위)
   - 역할별 맞춤 대시보드
   - 통계 차트 (Chart.js)
   - 최근 활동 표시

8. **추가 기능**
   - 알림 시스템 활성화
   - 학부모 알림 기능
   - 모바일 반응형 개선
   - 권한 미들웨어 실제 적용

## API 엔드포인트

### 인증 (`/api/auth`)
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/change-password` - 비밀번호 변경

### 사용자 (`/api/users`)
- `GET /api/users` - 전체 사용자 목록
- `GET /api/users/:id` - 특정 사용자 조회
- `POST /api/users` - 새 사용자 생성
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제

### 학생 (`/api/students`)
- `GET /api/students` - 학생 목록
- `GET /api/students/:id` - 학생 상세 조회 (기본정보, 보호자, 학력, 건강정보 등 모든 필드)
- `POST /api/students` - 학생 등록 (계정 자동 생성 포함, 20+ 필드 지원)
- `PUT /api/students/:id` - 학생 정보 수정 (users, students 테이블 동시 업데이트)
- `POST /api/students/:id/parents` - 학부모 연결

### 학기 (`/api/semesters`)
- `GET /api/semesters` - 학기 목록
- `GET /api/semesters/current` - 현재 학기
- `POST /api/semesters` - 학기 생성
- `PUT /api/semesters/:id` - 학기 수정

### 과목 (`/api/subjects`)
- `GET /api/subjects` - 과목 목록
- `POST /api/subjects` - 과목 생성

### 반 (`/api/classes`)
- `GET /api/classes` - 반 목록
- `GET /api/classes/:id/students` - 반 학생 목록
- `POST /api/classes` - 반 생성

### 출석 (`/api/attendance`)
- `GET /api/attendance` - 출석 기록 조회 (enrollment 기반)
- `GET /api/attendance/by-date?date=YYYY-MM-DD` - 날짜별 전체 학생 출석 조회 🆕
- `POST /api/attendance` - 출석 체크 (enrollment 기반)
- `POST /api/attendance/simple` - 학생별 간단 출석 저장 🆕
- `POST /api/attendance/bulk` - 일괄 출석 체크 (enrollment 기반)
- `POST /api/attendance/bulk-simple` - 날짜별 전체 학생 일괄 저장 🆕

### 성적 (`/api/grades`)
- `GET /api/grades` - 성적 조회
- `POST /api/grades` - 성적 입력
- `POST /api/grades/final` - 최종 성적 계산

### 봉사활동 (`/api/volunteer`)
- `GET /api/volunteer` - 봉사활동 목록
- `POST /api/volunteer` - 봉사활동 등록
- `PUT /api/volunteer/:id/approve` - 봉사활동 승인

### 동아리 (`/api/clubs`)
- `GET /api/clubs` - 동아리 목록
- `GET /api/clubs/:id/members` - 동아리 회원
- `POST /api/clubs` - 동아리 생성
- `POST /api/clubs/:id/join` - 동아리 가입
- `POST /api/clubs/:id/activities` - 동아리 활동 기록

### 상담 내역 (`/api/counseling`) 🆕
- `GET /api/counseling` - 상담 내역 목록 (필터링 지원)
- `GET /api/counseling/:id` - 상담 내역 상세
- `POST /api/counseling` - 상담 기록 추가
- `PUT /api/counseling/:id` - 상담 기록 수정
- `DELETE /api/counseling/:id` - 상담 기록 삭제
- `GET /api/counseling/stats/:student_id` - 학생별 상담 통계

### 시스템 설정 (`/api/settings`) 🆕
- `GET /api/settings` - 모든 설정 조회
- `GET /api/settings/:key` - 특정 설정 조회
- `PUT /api/settings/:key` - 설정 수정
- `POST /api/settings/batch` - 일괄 설정 저장
- `DELETE /api/settings/:key` - 설정 삭제

### 학생 반 배정 이력 (`/api/student-class-history`) 🆕
- `GET /api/student-class-history/student/:student_id` - 학생 반 배정 이력
- `GET /api/student-class-history/class/:class_id/semester/:semester_id` - 반별 학생 목록
- `GET /api/student-class-history/student/:student_id/current` - 학생 현재 반
- `POST /api/student-class-history` - 학생 반 배정
- `PUT /api/student-class-history/:id` - 반 배정 수정
- `DELETE /api/student-class-history/:id` - 반 배정 해제
- `POST /api/student-class-history/batch` - 일괄 반 배정

### 담임 교사 배정 (`/api/teacher-homeroom`) 🆕
- `GET /api/teacher-homeroom` - 담임 배정 목록
- `GET /api/teacher-homeroom/class/:class_id/semester/:semester_id` - 반 담임 조회
- `GET /api/teacher-homeroom/teacher/:teacher_id/semester/:semester_id` - 교사 담임 반 조회
- `GET /api/teacher-homeroom/teacher/:teacher_id/current` - 교사 현재 담임 반
- `POST /api/teacher-homeroom` - 담임 배정
- `PUT /api/teacher-homeroom/:id` - 담임 변경
- `DELETE /api/teacher-homeroom/:id` - 담임 해제

### 학생 리포트 (`/api/student-report`) 🆕
- `GET /api/student-report/life-record/:student_id` - 생활기록부 조회
  - 학생 기본 정보, 반 배정 이력, 출석 통계
  - 전체 성적, 봉사활동, 동아리 활동
  - 특별 기록, 상담 기록
- `GET /api/student-report/grade-report/:student_id?semester_id=N` - 학기별 성적표
  - 과목별 성적 및 학점
  - 시험 유형별 세부 성적
  - 출석 현황 및 출석률
  - 평균 점수 자동 계산

## 데이터베이스 구조

### 주요 테이블
- `users` - 사용자 계정 (통합)
- `students` - 학생 상세 정보 (20+ 필드: 기본정보, 보호자, 학력, 건강정보)
- `teachers` - 교사 상세 정보
- `parent_student` - 학부모-학생 연결
- `semesters` - 학기 정보
- `classes` - 반 정보
- `subjects` - 과목
- `courses` - 수업 (과목 + 학기 + 교사)
- `enrollments` - 수강 신청
- `attendance` - 출석 기록
- `grades` - 성적 기록
- `final_grades` - 최종 성적
- `volunteer_activities` - 봉사활동
- `clubs` - 동아리
- `club_members` - 동아리 회원
- `club_activities` - 동아리 활동 기록
- `student_records` - 생활기록부 특별 기록
- `student_class_history` 🆕 - 학생 반 배정 이력 (학기별)
- `counseling_records` 🆕 - 학생 상담 내역
- `teacher_homeroom` 🆕 - 담임 교사 배정 (학기별)
- `system_settings` 🆕 - 시스템 설정
- `notifications` 🆕 - 알림 (기본 인프라)

## 테스트 계정

| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 최고관리자 | admin | admin123 |
| 교사 | teacher1 | teacher123 |
| 학생 | student1 | student123 |
| 학부모 | parent1 | parent123 |

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 초기화
```bash
npm run db:reset
```

### 3. 빌드
```bash
npm run build
```

### 4. 개발 서버 시작
```bash
pm2 start ecosystem.config.cjs
pm2 logs webapp --nostream
```

### 5. 테스트
```bash
curl http://localhost:3000
```

## 배포

### Cloudflare Pages 배포

1. Cloudflare API 키 설정
2. D1 데이터베이스 생성
3. wrangler.jsonc에 database_id 설정
4. 마이그레이션 실행
```bash
npx wrangler d1 migrations apply webapp-production
```
5. 배포
```bash
npm run deploy:prod
```

## URL 정보

- **개발 서버**: https://3000-ix42loc9lqsygk3zvk89v-583b4d74.sandbox.novita.ai
- **로그인 페이지**: /
- **API Base**: /api

## 권장 개발 순서

1. ✅ 기본 인증 시스템 구현
2. ✅ 사용자 관리 CRUD
3. ✅ 학생/교사/반 관리
4. ✅ 출석 및 성적 관리
5. ✅ 봉사활동/동아리 관리
6. 🚧 성적표 PDF 출력
7. 🚧 학생종합기록표 생성
8. 🚧 대시보드 통계 기능
9. 🚧 알림 시스템
10. 🚧 모바일 반응형 개선

## 보안 주의사항

⚠️ **현재 버전은 개발용입니다**
- 비밀번호가 평문으로 저장됨 (실제 운영 환경에서는 bcrypt 등 사용 필수)
- JWT 시크릿 키가 하드코딩됨 (환경 변수로 관리 필요)
- HTTPS 사용 권장
- 입력값 검증 강화 필요

## 라이선스

MIT License

## 개발자

- 개발: AI Assistant
- 의뢰: 예광
- 목적: 기독교 대안학교 학적 관리

## 프로덕션 배포 정보

- **Tailwind CSS**: v3 프로덕션 빌드 (PostCSS)
- **빌드 파일**: public/static/styles.css (22KB minified)
- **Favicon**: SVG 데이터 URI (인라인)
- **JS 파일**: 버전 관리 쿼리 파라미터 (`?v=20251107`)

## 업데이트 로그

### 2025-11-07 (v0.9 - 검색/필터링 및 프로덕션 준비) 🎉
- ⭐⭐ **출석 검색 및 필터링** - 강력한 검색 기능 추가
  - 학생 이름/학번 실시간 검색
  - 반별 필터링 드롭다운
  - 전체 학생 출석 페이지에서 사용 가능
  - 필터링 후에도 저장 정상 작동
- ⭐⭐ **반 관리에서 출석 체크** - 반별 출석 입력 완성
  - 반 상세 페이지에서 출석 체크 버튼
  - 해당 반 학생만 표시
  - 날짜별 출석 입력 및 저장
  - 실시간 통계 업데이트
- ⭐ **프로덕션 빌드 최적화** - CDN 제거 및 최적화
  - Tailwind CSS v3 프로덕션 빌드 (CDN → PostCSS)
  - public/static/styles.css (22KB minified)
  - package.json 빌드 스크립트 추가: `npm run build:css`
  - postcss.config.js, tailwind.config.js 설정
- ⭐ **Favicon 404 오류 수정** - SVG 인라인 데이터 URI
  - Cloudflare Workers 호환 방식으로 변경
  - SVG 데이터 URI 직접 삽입
  - 브라우저 콘솔 경고 제거
- 🐛 **버그 수정** - 학생 이름 undefined 문제
  - attendance.ts SQL 쿼리 수정
  - WHERE 절 변경: `status = 'active'` → `status IN ('active', 'enrolled')`
  - 등록된 학생 포함하여 조회
- 🐛 **캐시 문제 해결** - JS 파일 버전 관리
  - 모든 JS 파일에 버전 쿼리 파라미터 추가 (`?v=20251107`)
  - 브라우저 캐시로 인한 업데이트 미반영 해결

### 2025-11-07 (v0.8 - 출석체크 기능 완성) 🎉
- ⭐⭐⭐ **출석 입력 기능** - 실제 출석 데이터 입력 및 저장
  - 날짜별 전체 학생 출석 입력 UI
  - 드롭다운으로 출석 상태 선택 (출석/결석/지각/인정결석/미입력)
  - 학생별 비고 입력 필드
  - 실시간 통계 업데이트 (입력 시 즉시 반영)
  - 일괄 저장 기능 (전체 학생 한 번에 저장)
- ⭐⭐ **출석 API 개선** - 간단한 날짜 기반 출석 관리
  - GET /api/attendance/by-date - 날짜별 학생 출석 조회
  - POST /api/attendance/simple - 학생별 출석 저장
  - POST /api/attendance/bulk-simple - 전체 학생 일괄 저장
  - enrollment 없이도 출석 관리 가능
- ⭐ **통계 개선** - 미입력 상태 추가
  - 6가지 상태 통계 (전체/출석/결석/지각/인정결석/미입력)
  - 실시간 통계 카드 업데이트
- 🐛 **버그 수정** - 상담 내역 API SQL 오류 해결
  - students 테이블 JOIN 오류 수정
  - 학생 이름 조회 정상화

### 2025-11-07 (v0.7 - 성적표 및 생활기록부 완성) 🎉
- ⭐⭐⭐ **성적표 출력 시스템** - 학생별 성적표 조회 및 출력
  - 메뉴에서 학생 선택 페이지 (검색, 필터)
  - 학기별 성적표 (과목별 성적, 평균, 학점)
  - 시험 유형별 세부 성적 (중간/기말/과제/퀴즈)
  - 출석 현황 및 출석률 표시
  - 학기 선택 드롭다운 (자동 현재 학기 선택)
  - 브라우저 인쇄/PDF 저장 기능
- ⭐⭐⭐ **생활기록부 시스템** - 종합 학생 정보 조회 및 출력
  - 메뉴에서 학생 선택 페이지 (검색, 필터)
  - 학생 기본 정보 (프로필, 연락처, 보호자)
  - 반 배정 이력 (학기별 소속 반)
  - 출석 통계 (전체 출석 현황)
  - 성적 기록 (학기별, 과목별)
  - 봉사활동 내역 (기관, 시간, 승인상태)
  - 동아리 활동 (가입 동아리 및 활동)
  - 특별 기록 (행동, 수상, 징계, 건강)
  - 상담 기록 (유형, 내용, 후속조치)
  - 브라우저 인쇄/PDF 저장 기능
- ⭐⭐ **학생 리포트 API** - 백엔드 API 구현
  - GET /api/student-report/life-record/:student_id - 생활기록부
  - GET /api/student-report/grade-report/:student_id - 성적표
  - 복잡한 JOIN 쿼리 (8개 이상 테이블 집계)
  - 평균 점수, 출석률 자동 계산
- ⭐ **프론트엔드 UI** - reports.js 완성
  - showReportsPage() - 성적표 학생 선택
  - showRecordsPage() - 생활기록부 학생 선택
  - 학생 검색 및 반 필터링
  - 인쇄 최적화 레이아웃
- 🔧 **메뉴 통합** - 사이드바에서 직접 접근
  - "성적표 출력" 메뉴 → 학생 선택 → 성적표 보기
  - "생활기록부" 메뉴 → 학생 선택 → 생활기록부 보기
  - 학생 상세 페이지에서도 버튼으로 접근 가능

### 2025-11-07 (v0.6 - 학생 관리 고도화) 🎉
- ⭐⭐⭐ **학생 정보 상세화** - 20+ 필드로 확장
  - 마이그레이션 추가: 0002_add_student_details.sql
  - 새 필드: 생년월일, 성별, 혈액형, 종교, 국적
  - 보호자 정보: 이름, 관계, 연락처, 이메일, 주소
  - 이전 학력: 학교명, 학교 유형
  - 건강 정보: 의료 특이사항, 알레르기, 기타 특이사항
- ⭐⭐ **학생 등록 페이지** - 모달에서 전체 페이지로 전환
  - student-detail.js 신규 추가
  - 섹션별 폼 구성 (계정, 기본, 보호자, 학력, 건강)
  - 프로필 카드 UI
- ⭐⭐ **학생 상세 페이지** - 전체 정보 조회
  - 모달 아닌 별도 페이지
  - 섹션별 정보 표시 (기본, 보호자, 학력, 건강)
  - 수정 페이지로 이동 버튼
- ⭐⭐ **학생 수정 페이지** - 모든 필드 수정 가능
  - users 테이블 (이름, 이메일, 연락처)
  - students 테이블 (20+ 필드 모두)
- ⭐ **API 개선**
  - POST /api/students - 계정 자동 생성 + 20+ 필드 저장
  - PUT /api/students/:id - users + students 동시 업데이트
  - GET /api/students/:id - 모든 필드 반환
- 🐛 **버그 수정**
  - getStatusColor, getStatusText 함수 추가 (class-detail.js)
  - 학생 상태 색상 표시 정상화

### 2025-11-07 (v0.5 - 통합 관리 완성) 🎉
- ⭐⭐ **반 상세 페이지** - 반 통합 관리 인터페이스
  - 학생 목록 (추가/제외)
  - 반별 출석 관리
  - 반별 성적 현황
  - 반 통계
- ⭐⭐ **출석 관리 개선** - 전체/반별 모드 분리
  - 전체 학생 출석 모드 (학교 전체)
  - 반별 출석 모드 (특정 반만)
  - 출석 통계 카드
- ⭐⭐ **상담 내역 시스템** - 완전한 상담 관리
  - 상담 기록 CRUD
  - 유형별 분류 (학업/진로/개인/행동/가정/기타)
  - 후속 조치 관리
  - 비밀 상담 지원
- ⭐⭐ **시스템 설정 페이지** - 통합 설정 관리
  - 학교 정보, 학사 일정
  - 출석/성적/봉사 설정
- ⭐⭐ **담임 배정 관리** - 학기별 담임 배정
- ⭐ **학생 반 배정 이력** - student_class_history 테이블
- ⭐ **권한 미들웨어** - 역할 기반 접근 제어
- 📊 데이터베이스 확장 (5개 테이블 추가: 23개 테이블)
- 🔧 API 엔드포인트 40+ 추가 (총 90+ API)

### 2025-11-07 (v0.4 - 데이터 구조 개선)
- ⭐ **학생 반 배정 로직 개선** - student_class_history 기반
- ⭐ **학기별 이력 추적** - 학생 반 변경 이력 관리
- ⭐ **담임 교사 시스템 개선** - teacher_homeroom 테이블
- 📊 마이그레이션 추가 (0002_add_history_and_counseling.sql)

### 2025-11-07 (v0.3 - CRUD 완성)
- ⭐ **학생 등록/수정 폼** - 완전한 학생 관리 CRUD
- ⭐ **반 생성 폼** - 담임교사, 교실 배정 포함
- ⭐ **과목/학기 추가 폼** - 수업 관리 완성
- ⭐ **봉사활동 등록** - 활동 기록 및 통계
- ⭐ **동아리 생성** - 지도교사 배정 포함
- ✅ 출석 관리 기본 UI (반별 출석 체크)
- ✅ 성적 관리 기본 UI (수강 과목 조회)
- ✅ 고정 사이드바 네비게이션
- ✅ SPA 방식 페이지 전환

### 2025-11-07 (v0.2 - UI 개선)
- ✅ 학생 관리 UI 구현 (목록, 검색, 상세보기)
- ✅ 수업 관리 UI 구현 (과목 목록, 학기 정보)
- ✅ 반 관리 UI 구현 (반 목록, 학생 보기)
- ✅ 봉사활동 UI 구현 (목록, 통계)
- ✅ 동아리 UI 구현 (목록, 회원 보기)
- ✅ 대시보드 통계 표시
- ✅ 프론트엔드 코드 외부 파일로 분리

### 2025-11-07 (v0.1 - 초기 버전)
- 기본 프로젝트 구조 생성
- 데이터베이스 스키마 설계 (18개 테이블)
- 전체 API 엔드포인트 구현 (50+ API)
- 로그인 UI 및 대시보드 구현
- 5가지 권한 레벨 시스템 구축
