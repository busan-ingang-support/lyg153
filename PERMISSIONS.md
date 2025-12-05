# 권한별 기능 정리 (Role-Based Access Control)

> 대안학교 관리 시스템의 역할 기반 접근 제어 문서

## 목차
- [1. 역할 개요](#1-역할-개요)
- [2. 역할별 상세 기능](#2-역할별-상세-기능)
  - [2.1 Super Admin (최고 관리자)](#21-super-admin-최고-관리자)
  - [2.2 Admin (관리자)](#22-admin-관리자)
  - [2.3 Teacher (교사)](#23-teacher-교사)
  - [2.4 Student (학생)](#24-student-학생)
  - [2.5 Parent (학부모)](#25-parent-학부모)
- [3. 권한 매트릭스](#3-권한-매트릭스)
- [4. 인증 및 미들웨어](#4-인증-및-미들웨어)

---

## 1. 역할 개요

시스템은 5가지 역할로 구분됩니다:

| 역할 | 코드명 | 설명 |
|------|--------|------|
| 최고 관리자 | `super_admin` | 시스템 전체 관리, 홈페이지 설정 등 모든 권한 |
| 관리자 | `admin` | 학사 관리, 사용자 관리 등 대부분의 관리 권한 |
| 교사 | `teacher` | 담당 수업/학급의 출석, 성적, 과제 관리 |
| 학생 | `student` | 본인의 정보 조회, 과제 제출 |
| 학부모 | `parent` | 자녀의 정보 조회 (읽기 전용) |

---

## 2. 역할별 상세 기능

### 2.1 Super Admin (최고 관리자)

**시스템 전체 권한** - 모든 Admin 권한 + 아래의 독점 기능

#### 독점 기능

##### 홈페이지 관리 (`/api/homepage`)
- `GET /` - 홈페이지 설정 조회
- `GET /admin` - 관리자용 홈페이지 설정 조회
- `POST /` - 홈페이지 설정 수정

##### 홈페이지 모듈 관리 (`/api/homepage-modules`)
- 홈페이지 모듈 전체 CRUD (super_admin만 가능)

##### 교사 권한 관리 (`/api/teacher-permissions`)
- 교사별 세밀한 권한 설정 관리

**참고**: Super Admin은 모든 Admin 기능을 동일하게 사용할 수 있습니다.

---

### 2.2 Admin (관리자)

**학사 관리 권한** - 대부분의 시스템 리소스 관리

#### 사용자 관리 (`/api/users`)
- `GET /` - 전체 사용자 목록 조회 (필터: role, search, limit, offset)
- `GET /:id` - 사용자 상세 정보 조회 (역할별 추가 정보 포함)
- `POST /` - 새 사용자 생성
- `PUT /:id` - 사용자 정보 수정
- `PUT /:id/role` - 사용자 역할 변경
- `DELETE /:id` - 사용자 삭제

#### 학생 관리 (`/api/students`)
- `GET /` - 학생 목록 조회 (teacher, admin, super_admin)
- `GET /next-student-number` - 다음 학번 생성
- `GET /user/:userId` - 사용자 ID로 학생 조회
- `GET /:id` - 학생 상세 정보
- `POST /` - 학생 생성 (admin, super_admin)
- `PUT /:id` - 학생 정보 수정 (admin, super_admin)
- `POST /:id/parents` - 학부모 연결 (admin, super_admin)

#### 교사 관리 (`/api/teachers`)
- `POST /` - 교사 등록 (admin, super_admin 전용)

#### 학급 관리 (`/api/classes`)
- `GET /` - 전체 학급 목록
- `GET /:id` - 학급 상세 정보
- `GET /:id/students` - 학급 학생 목록
- `GET /:id/attendance` - 학급 출석 기록
- `GET /:id/grades` - 학급 성적
- `POST /` - 학급 생성

#### 수업 관리 (`/api/courses`)
- `GET /` - 수업 목록
- `GET /:id` - 수업 상세
- `POST /` - 수업 생성
- `PUT /:id` - 수업 수정
- `DELETE /:id` - 수업 삭제
- `GET /stats/by-class/:classId` - 학급별 수업 통계

#### 학기 관리 (`/api/semesters`)
- `GET /` - 학기 목록
- `GET /current` - 현재 학기
- `POST /` - 학기 생성
- `PUT /:id` - 학기 수정

#### 과목 관리 (`/api/subjects`)
- `GET /` - 과목 목록
- `GET /:id` - 과목 조회
- `POST /` - 과목 생성
- `PUT /:id` - 과목 수정
- `DELETE /:id` - 과목 삭제
- `GET /stats/by-grade` - 학년별 과목 통계

#### 성적 관리 (`/api/grades`)
- `GET /` - 전체 성적 조회
- `POST /` - 성적 입력 (teacher, admin, super_admin)
- `POST /final` - 최종 성적 계산 및 저장 (teacher, admin, super_admin)
- `GET /student/:student_id` - 학생별 성적 조회 (권한 체크)

#### 출석 관리 (`/api/attendance`)
- `GET /` - 출석 기록 조회
- `POST /` - 출석 입력 (teacher, admin, super_admin)
- `POST /bulk` - 대량 출석 입력 (teacher, admin, super_admin)
- `GET /by-date` - 날짜별 출석 조회
- `POST /simple` - 간단 출석 입력 (teacher, admin, super_admin)
- `POST /bulk-simple` - 대량 간단 출석 입력 (teacher, admin, super_admin)
- `GET /student/:student_id/summary` - 학생 출석 요약
- `GET /student/:student_id` - 학생 출석 기록

#### 과제 관리 (`/api/assignments`)
- `GET /` - 과제 목록
- `GET /student/:student_id` - 학생별 과제 (권한 체크)
- `GET /:id` - 과제 상세
- `POST /` - 과제 생성 (teacher, admin, super_admin)
- `PUT /:id` - 과제 수정 (teacher, admin, super_admin)
- `DELETE /:id` - 과제 삭제 (teacher, admin, super_admin)
- `GET /:id/submissions` - 제출 현황 조회 (teacher, admin, super_admin)
- `PUT /:id/submissions/:submission_id/grade` - 과제 채점 (teacher, admin, super_admin)

#### 봉사활동 관리 (`/api/volunteer`)
- `GET /` - 봉사활동 목록
- `GET /:id` - 봉사활동 조회
- `POST /` - 봉사활동 등록
- `PUT /:id` - 봉사활동 수정
- `DELETE /:id` - 봉사활동 삭제

#### 상담 기록 관리 (`/api/counseling`)
- `GET /` - 상담 기록 목록
- `GET /:id` - 상담 기록 조회
- `POST /` - 상담 기록 등록
- `PUT /:id` - 상담 기록 수정
- `DELETE /:id` - 상담 기록 삭제

#### 동아리 관리 (`/api/clubs`)
- `GET /` - 동아리 목록
- `GET /:id/members` - 동아리 회원 목록
- `POST /` - 동아리 생성
- `POST /:id/join` - 동아리 가입
- `POST /:id/activities` - 동아리 활동 기록

#### 게시판 관리 (`/api/boards`)
- `GET /` - 게시판 목록
- `GET /posts` - 게시글 목록
- `GET /posts/:id` - 게시글 상세
- `POST /posts` - 게시글 작성
- `POST /comments` - 댓글 작성

#### 시간표 관리 (`/api/schedules`)
- `GET /` - 시간표 목록
- `GET /weekly/:classId` - 주간 시간표
- `POST /` - 시간표 생성/수정
- `DELETE /:id` - 시간표 삭제
- `DELETE /slot/:classId/:dayOfWeek/:period` - 특정 시간 삭제
- `POST /check-conflict` - 충돌 검사
- `GET /periods` - 교시 정보

#### 시스템 설정 관리 (`/api/settings`)
- `GET /` - 전체 설정
- `GET /:key` - 단일 설정 조회
- `PUT /:key` - 설정 수정/생성 (admin, super_admin)
- `POST /batch` - 일괄 설정 수정 (admin, super_admin)
- `DELETE /:key` - 설정 삭제 (admin, super_admin)
- `GET /category/:prefix` - 카테고리별 설정

#### 알림 (`/api/notifications`)
- `GET /` - 내 알림
- `PUT /:id/read` - 읽음 처리
- `PUT /read-all` - 전체 읽음 처리
- `DELETE /:id` - 알림 삭제

#### 기타 관리 (`/api/awards`, `/api/reading`, `/api/student-report`)
- 수상, 독서, 학생 리포트 전체 CRUD

#### UI 기능 (관리자 대시보드)
- 사용자 관리 인터페이스
- 학생 관리
- 교사 관리
- 학급/수업 관리
- 학기 관리
- 과목 관리
- 시스템 설정
- 홈페이지 관리 (super_admin만)
- 전체 분석 및 리포트
- 모듈 설정

---

### 2.3 Teacher (교사)

**수업 및 학급 관리** - 담당 학급 및 수업의 학생 관리

#### 특수 미들웨어 보호
- `requireHomeroomTeacher` - 담임 교사 확인 (super_admin/admin은 우회)
- `requireCourseTeacher` - 수업 담당 교사 확인 (super_admin/admin은 우회)
- `requireStudentOrAuthorized` - 학생 접근 권한 확인

#### 학생 접근 (`/api/students`)
- `GET /` - 학생 목록 (teacher, admin, super_admin)
- `GET /:id` - 담당 학급/수업 학생 조회 (권한 체크)
- 접근 가능 학생:
  - 담임 학급 학생
  - 담당 수업에 등록된 학생

#### 성적 관리 (`/api/grades`)
- `POST /` - 성적 입력 (teacher, admin, super_admin)
- `POST /final` - 최종 성적 계산 (teacher, admin, super_admin)
- `GET /student/:student_id` - 성적 조회 (담당 학생만)

#### 출석 관리 (`/api/attendance`)
- `POST /` - 출석 입력 (teacher, admin, super_admin)
- `POST /bulk` - 대량 출석 입력 (teacher, admin, super_admin)
- `POST /simple` - 간단 출석 입력 (teacher, admin, super_admin)
- `POST /bulk-simple` - 대량 간단 출석 입력 (teacher, admin, super_admin)
- `GET /student/:student_id` - 출석 조회 (담당 학생만)
- `GET /student/:student_id/summary` - 출석 요약

#### 과제 관리 (`/api/assignments`)
- `GET /` - 과제 목록 (담당 수업으로 필터링)
- `GET /student/:student_id` - 학생 과제 (권한 체크)
- `POST /` - 과제 생성 (teacher, admin, super_admin)
- `PUT /:id` - 본인 과제 수정 (teacher, admin, super_admin)
- `DELETE /:id` - 본인 과제 삭제 (teacher, admin, super_admin)
- `GET /:id/submissions` - 제출 현황 조회 (teacher, admin, super_admin)
- `PUT /:id/submissions/:submission_id/grade` - 과제 채점 (teacher, admin, super_admin)

#### 수업 접근 (`/api/courses`)
- `GET /` - 수업 조회 (teacher_id로 필터링)
- 담당 수업만 제한

#### 학급 관리 (`/api/classes`)
- `GET /` - 학급 목록
- `GET /:id` - 학급 상세
- `GET /:id/students` - 학급 학생 목록
- `GET /:id/attendance` - 학급 출석
- `GET /:id/grades` - 학급 성적

#### 게시판/소통 (`/api/boards`)
- `POST /posts` - 게시글 작성 (공지사항 작성 가능)
- `POST /comments` - 댓글 작성

#### 상담 (`/api/counseling`)
- 상담 기록 전체 CRUD

#### 봉사활동 (`/api/volunteer`)
- 봉사활동 전체 CRUD (담당 학생)

#### UI 기능
- 학급 명부 조회
- 출석 체크 인터페이스
- 성적 입력 폼
- 과제 생성/채점
- 학생 기록 (담당 학생 제한)
- 상담 기록
- 수업 QnA 게시판

---

### 2.4 Student (학생)

**셀프 서비스 및 학습** - 본인 정보 조회 및 과제 제출

#### 본인 정보 (`/api/students`)
- `GET /user/:userId` - 본인 학생 정보
- `GET /:id` - 본인 상세 (requireStudentOrAuthorized 미들웨어)

#### 성적 (`/api/grades`)
- `GET /student/:student_id` - 본인 성적 조회 (권한 체크)

#### 출석 (`/api/attendance`)
- `GET /student/:student_id` - 본인 출석 조회 (권한 체크)
- `GET /student/:student_id/summary` - 본인 출석 요약

#### 과제 (`/api/assignments`)
- `GET /` - 과제 목록 (수강 수업으로 필터링)
- `GET /student/:student_id` - 본인 과제 (권한 체크)
- `GET /:id` - 과제 상세 (수강 수업)
- `POST /:id/submit` - 과제 제출 (student만 가능)

#### 수업 (`/api/courses`)
- `GET /` - 수강 수업 조회 (student_id로 필터링)

#### 게시판 (`/api/boards`)
- `GET /posts` - 게시글 조회
- `GET /posts/:id` - 게시글 상세
- `POST /posts` - 게시글 작성 (공지사항 불가)
- `POST /comments` - 댓글 작성

#### 알림 (`/api/notifications`)
- `GET /` - 본인 알림
- `PUT /:id/read` - 읽음 처리
- `PUT /read-all` - 전체 읽음 처리
- `DELETE /:id` - 알림 삭제

#### 동아리 활동 (`/api/clubs`)
- `GET /` - 동아리 목록
- `GET /:id/members` - 회원 조회
- `POST /:id/join` - 동아리 가입

#### UI 기능 (학생 홈)
- 개인 대시보드
- 내 성적 조회
- 내 출석 조회
- 과제 목록 및 제출
- 수업 자료
- 게시판/QnA 접근
- 시간표 조회
- 동아리 활동

---

### 2.5 Parent (학부모)

**자녀 모니터링** - 자녀의 학업 정보 조회

#### 특수 보호
- 모든 엔드포인트에서 `parent_student` 관계 확인
- 연결된 자녀의 데이터만 접근 가능

#### 학생 정보 (`/api/students`)
- `GET /:id` - 자녀 정보 조회 (requireStudentOrAuthorized)

#### 성적 (`/api/grades`)
- `GET /student/:student_id` - 자녀 성적 조회 (parent_student 테이블 권한 체크)

#### 출석 (`/api/attendance`)
- `GET /student/:student_id` - 자녀 출석 조회 (권한 체크)
- `GET /student/:student_id/summary` - 자녀 출석 요약

#### 과제 (`/api/assignments`)
- `GET /` - 과제 조회 (자녀 수업으로 필터링)
- `GET /student/:student_id` - 자녀 과제 (권한 체크)

#### 게시판 (`/api/boards`)
- `GET /posts` - 게시글 조회
- `GET /posts/:id` - 게시글 상세
- `POST /comments` - 댓글 작성

#### 알림 (`/api/notifications`)
- `GET /` - 본인 알림 (자녀 관련)
- `PUT /:id/read` - 읽음 처리
- `PUT /read-all` - 전체 읽음 처리
- `DELETE /:id` - 알림 삭제

#### UI 기능 (학부모 홈)
- 자녀 선택기
- 자녀 출석 조회
- 자녀 성적 조회
- 자녀 시간표
- 과제 현황
- 상담 기록 (읽기 전용)
- 교사 소통

---

## 3. 권한 매트릭스

| 기능 | Super Admin | Admin | Teacher | Student | Parent |
|------|-------------|-------|---------|---------|--------|
| **사용자 관리** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **학생 CRUD** | ✓ | ✓ | 조회 (제한) | 조회 (본인) | 조회 (자녀) |
| **교사 CRUD** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **학급 관리** | ✓ | ✓ | 조회 (담당) | 조회 (수강) | 조회 (자녀) |
| **수업 관리** | ✓ | ✓ | 본인 수업 | 조회 (수강) | 조회 (자녀) |
| **성적 입력** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **성적 조회** | ✓ | ✓ | ✓ (학생) | ✓ (본인) | ✓ (자녀) |
| **출석 입력** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **출석 조회** | ✓ | ✓ | ✓ (학생) | ✓ (본인) | ✓ (자녀) |
| **과제 생성** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **과제 제출** | ✗ | ✗ | ✗ | ✓ | ✗ |
| **과제 채점** | ✓ | ✓ | ✓ (본인) | ✗ | ✗ |
| **상담 기록** | ✓ | ✓ | ✓ | ✗ | 조회 (자녀) |
| **봉사활동** | ✓ | ✓ | ✓ | ✗ | 조회 (자녀) |
| **게시판 작성** | ✓ | ✓ | ✓ (+ 공지) | ✓ (공지 불가) | ✓ (공지 불가) |
| **홈페이지 설정** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **시스템 설정** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **학기 관리** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **과목 관리** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **시간표 관리** | ✓ | ✓ | ✓ | 조회 | 조회 |
| **알림** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **동아리 관리** | ✓ | ✓ | ✓ | 가입만 | 조회 |

---

## 4. 인증 및 미들웨어

### 인증 미들웨어 ([src/middleware/auth.ts](src/middleware/auth.ts))

#### 1. `authMiddleware`
- JWT 토큰 검증
- `userId`와 `userRole` 추출하여 컨텍스트에 저장

#### 2. `requireRole(...roles)`
- 특정 역할만 접근 가능하도록 제한
- 예: `requireRole('teacher', 'admin', 'super_admin')`

#### 3. `requireHomeroomTeacher`
- 담임 교사 확인
- super_admin/admin은 우회 가능

#### 4. `requireCourseTeacher`
- 수업 담당 교사 확인
- super_admin/admin은 우회 가능

#### 5. `requireStudentOrAuthorized`
- 복합 권한 체크:
  - **super_admin/admin**: 전체 접근
  - **student**: 본인 기록만
  - **teacher**: 담임 학급 학생 또는 담당 수업 학생
  - **parent**: 연결된 자녀만

### 토큰 구조

```javascript
{
  userId: number,
  role: 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent',
  exp: timestamp // 24시간 유효
}
```

### 학부모 권한 체크 로직

모든 학부모 관련 엔드포인트에서 다음과 같이 확인:

```sql
SELECT id FROM parent_student
WHERE parent_user_id = ?
  AND student_id = ?
  AND COALESCE(status, 1) = 1
```

- `status` 컬럼이 활성(1)인 경우만 허용
- 비활성화된 관계는 접근 불가

---

## 주요 라우트 파일

모든 라우트는 [src/routes/](src/routes/) 디렉토리에 정의:

- [auth.ts](src/routes/auth.ts) - 로그인, 토큰 검증, 비밀번호 변경
- [users.ts](src/routes/users.ts) - 사용자 CRUD
- [students.ts](src/routes/students.ts) - 학생 관리
- [teachers.ts](src/routes/teachers.ts) - 교사 관리
- [classes.ts](src/routes/classes.ts) - 학급 관리
- [courses.ts](src/routes/courses.ts) - 수업 관리
- [grades.ts](src/routes/grades.ts) - 성적 관리
- [attendance.ts](src/routes/attendance.ts) - 출석 관리
- [assignments.ts](src/routes/assignments.ts) - 과제 시스템
- [boards.ts](src/routes/boards.ts) - 게시판
- [notifications.ts](src/routes/notifications.ts) - 알림 시스템
- [schedules.ts](src/routes/schedules.ts) - 시간표
- [subjects.ts](src/routes/subjects.ts) - 과목 관리
- [semesters.ts](src/routes/semesters.ts) - 학기 관리
- [counseling.ts](src/routes/counseling.ts) - 상담 기록
- [volunteer.ts](src/routes/volunteer.ts) - 봉사활동
- [clubs.ts](src/routes/clubs.ts) - 동아리 관리
- [settings.ts](src/routes/settings.ts) - 시스템 설정
- [homepage.ts](src/routes/homepage.ts) - 홈페이지 구성

---

## 보안 고려사항

### 1. JWT 보안
- **현재**: Base64 인코딩 사용 (간단한 구현)
- **권장**: 프로덕션 환경에서는 실제 JWT 라이브러리 사용 ([src/utils/auth.ts](src/utils/auth.ts))

### 2. 데이터 격리
- **멀티테넌트**: `site_id` 컬럼으로 사이트별 데이터 격리
- **Soft Delete**: `status` 컬럼으로 논리적 삭제 구현

### 3. 권한 우회 방지
- 모든 엔드포인트에서 역할 확인
- 중요 작업은 `requireRole` 미들웨어로 보호
- 학부모는 `parent_student` 테이블로 관계 검증

### 4. SQL Injection 방지
- 모든 쿼리에서 파라미터 바인딩 사용
- 직접 문자열 결합 없음

---

## 변경 이력

- **2025-12-05**: 학부모 출석/성적 조회 시 `parent_student.status` 검증 추가
- **2025-12-05**: 과제 조회 기능 학생/학부모 페이지에 추가
- **2025-12-05**: 학부모 성적 조회 API 엔드포인트 추가

---

**문서 작성일**: 2025-12-05
**시스템 버전**: 1.0.0
**작성**: Claude Code
