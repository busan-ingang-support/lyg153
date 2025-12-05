# 시스템 감사 보고서 (System Audit Report)

> 생성일: 2025-12-05
> 시스템: 대안학교 관리 시스템 v1.0.0

## 요약 (Executive Summary)

171개의 API 엔드포인트, 11개의 데이터베이스 마이그레이션 파일, 인증 미들웨어, 프론트엔드 통합을 검토한 결과, **치명적(Critical) 보안 이슈 5건, 높음(High) 우선순위 이슈 10건**을 발견했습니다.

### 주요 발견사항
- **보호되지 않은 라우트**: 전체 라우트의 약 40%가 인증 없음
- **스키마 불일치**: 3건의 런타임 오류 발생 가능한 불일치
- **불완전한 CRUD**: 8개 엔티티에서 작업 누락
- **보안 이슈**: 12건의 치명적/높음 수준 보안 문제
- **데이터 무결성 위험**: 7건의 cascade 삭제 문제

---

## 1. 치명적 이슈 (CRITICAL)

### 1.1 인증되지 않은 라우트

**심각도**: 🔴 CRITICAL
**영향**: 누구나 민감한 데이터 접근 및 수정 가능

#### 영향받는 파일:

| 파일 | 라인 | 문제 | 위험도 |
|------|------|------|--------|
| [src/routes/classes.ts](src/routes/classes.ts) | 전체 | 인증 미들웨어 없음 | CRITICAL |
| [src/routes/courses.ts](src/routes/courses.ts) | 전체 | 인증 미들웨어 없음 | CRITICAL |
| [src/routes/semesters.ts](src/routes/semesters.ts) | 전체 | 인증 미들웨어 없음 | CRITICAL |
| [src/routes/subjects.ts](src/routes/subjects.ts) | 전체 | 인증 미들웨어 없음 | CRITICAL |
| [src/routes/counseling.ts](src/routes/counseling.ts) | 전체 | 기밀 상담 기록 노출 | CRITICAL |
| [src/routes/volunteer.ts](src/routes/volunteer.ts) | 전체 | 인증 미들웨어 없음 | CRITICAL |
| [src/routes/teachers.ts](src/routes/teachers.ts) | 20-80 | GET/PUT/DELETE 미보호 | HIGH |
| [src/routes/users.ts](src/routes/users.ts) | 대부분 | POST 외 미보호 | HIGH |

**권장 수정**:
```typescript
// 각 라우트 파일 상단에 추가
import { authMiddleware, requireRole } from '../middleware/auth';

// 모든 라우트에 인증 적용
router.use('*', authMiddleware);

// 관리자 전용 작업에 역할 제한
router.post('/', requireRole('admin', 'super_admin'), async (c) => {...});
router.put('/:id', requireRole('admin', 'super_admin'), async (c) => {...});
router.delete('/:id', requireRole('admin', 'super_admin'), async (c) => {...});
```

### 1.2 counseling.ts 스키마 불일치

**심각도**: 🔴 CRITICAL
**파일**: [src/routes/counseling.ts](src/routes/counseling.ts)
**라인**: 85-120

**문제**: 코드에서 사용하는 필드가 데이터베이스 스키마에 존재하지 않음

| 코드에서 사용 | 실제 스키마 | 결과 |
|--------------|-------------|------|
| `counselor_name` | 없음 (counselor_id만 존재) | NULL 반환 |
| `topic` | `title` | 필드 불일치 |
| `counselor_id` 무시 | FK 제약조건 | 데이터 무결성 위반 |

**스키마 (migrations/0002)**:
```sql
CREATE TABLE counseling_records (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  counselor_id INTEGER NOT NULL,  -- 코드에서 사용 안 함!
  title TEXT NOT NULL,              -- 코드에서 'topic'으로 참조
  content TEXT,
  counseling_type TEXT,
  counseling_date DATE NOT NULL,
  FOREIGN KEY (counselor_id) REFERENCES users(id)
);
```

**권장 수정**: 라우트 파일을 스키마에 맞게 수정 필요

### 1.3 약한 JWT 구현

**심각도**: 🔴 CRITICAL
**파일**: [src/middleware/auth.ts](src/middleware/auth.ts)
**라인**: 14-24

**문제**: 단순 Base64 디코딩, 서명 검증 없음

```typescript
// 현재 구현 (취약)
if (token.includes('.')) {
  payload = JSON.parse(atob(token.split('.')[1]));
} else {
  payload = JSON.parse(atob(token));
}
// 서명 검증 없음 → 토큰 위조 가능
```

**위험**:
- 토큰 위조 가능
- 세션 관리 없음
- 토큰 폐기 불가능

**권장 수정**: 실제 JWT 라이브러리 사용 (예: `jose`, `@tsndr/cloudflare-worker-jwt`)

### 1.4 Cascade 삭제로 인한 데이터 손실

**심각도**: 🔴 CRITICAL
**파일**: [migrations/0001_initial_schema.sql](migrations/0001_initial_schema.sql)

**문제**: 중요 데이터가 연쇄 삭제됨

| 트리거 | 연쇄 삭제 | 손실 데이터 |
|--------|----------|------------|
| 사용자 삭제 | `ON DELETE CASCADE` | 학생 → 성적, 출석, 과제 전부 |
| 학기 삭제 | `ON DELETE CASCADE` | 수업 → 수강신청, 성적 전부 |
| 수업 삭제 | `ON DELETE CASCADE` | 과제 → 학생 제출물 전부 |

**권장 수정**: 중요 엔티티에 Soft Delete 구현

### 1.5 파일 업로드 미구현

**심각도**: 🔴 CRITICAL
**영향**: 여러 기능이 작동하지 않음

**참조하는 곳**:
- `assignments.file_url` (과제 파일)
- `students.profile_photo_url` (프로필 사진)
- `homepage_slides.image_url` (홈페이지 이미지)
- `assignment_submissions.file_url` (과제 제출 파일)

**문제**: 파일 업로드 엔드포인트가 하나도 없음

**권장 구현**:
```typescript
// 새 라우트 필요: src/routes/uploads.ts
// Cloudflare R2 또는 다른 스토리지 통합
```

---

## 2. 높음 우선순위 (HIGH)

### 2.1 불완전한 CRUD 작업

| 엔티티 | 누락된 작업 | 파일 | 영향 |
|--------|------------|------|------|
| Teachers | GET, PUT, DELETE | [teachers.ts](src/routes/teachers.ts) | 교사 관리 불가 |
| Boards | POST (게시글), PUT, DELETE | [boards.ts](src/routes/boards.ts) | 게시판 사용 불가 |
| Course QnA | 답변 제출 | [course-qna.ts](src/routes/course-qna.ts) | 질문만 가능 |
| Student Reports | 모든 쓰기 작업 | [student-report.ts](src/routes/student-report.ts) | 읽기 전용 |

### 2.2 학부모-교사 소통 시스템 부재

**심각도**: 🟡 HIGH
**문제**: 학교 관리 시스템의 핵심 기능 누락

**누락된 기능**:
- 학부모-교사 메시징
- 상담 예약 시스템
- 학부모 전용 알림
- 동의서/허가서 관리

**데이터베이스 영향**: `parent_student` 테이블이 있지만 활용도가 낮음

### 2.3 학생 등록 워크플로 부재

**심각도**: 🟡 HIGH
**파일**: [src/routes/students.ts](src/routes/students.ts) (220-324)

**문제**: 학생이 즉시 "enrolled" 상태로 생성됨

**누락된 단계**:
1. 지원서 제출 (Application)
2. 검토 (Review)
3. 승인 (Acceptance)
4. 등록 (Enrollment)
5. 전학/졸업 프로세스

### 2.4 교사 라우트 불완전

**심각도**: 🟡 HIGH
**파일**: [src/routes/teachers.ts](src/routes/teachers.ts)

**현재 상태**: POST만 구현됨
**누락**: GET (목록), GET/:id (상세), PUT (수정), DELETE (삭제)

### 2.5 성적표/생활기록부 생성 부재

**심각도**: 🟡 HIGH
**파일**: [src/routes/student-report.ts](src/routes/student-report.ts)

**현재**: 2개의 기본 GET 엔드포인트만
**누락**:
- PDF 생성
- 종합 성적표 조합
- 학기/연간 생활기록부
- GPA 계산

---

## 3. 중간 우선순위 (MEDIUM)

### 3.1 출석 알림 자동화 부재

**심각도**: 🟠 MEDIUM
**파일**: [src/routes/attendance.ts](src/routes/attendance.ts)

**문제**: 출석은 기록되지만 알림 시스템 없음
- 결석 임계값 모니터링 없음
- 학부모 자동 알림 없음
- 무단결석 추적 없음

### 3.2 성적 계산 규칙이 고정됨

**심각도**: 🟠 MEDIUM
**파일**: [src/routes/grades.ts](src/routes/grades.ts) (66-116)

**문제**: 하드코딩된 성적 계산 (가중평균)
- 다른 평가 방식 지원 안 함
- 성취도 기반 평가 불가
- 성적 곡선/조정 없음

**데이터베이스**: `system_settings`에 `grade_calculation_method` 있지만 사용 안 함

### 3.3 학사 일정/이벤트 시스템 부재

**심각도**: 🟠 MEDIUM

**완전히 누락**:
- 학교 달력
- 시험 일정
- 휴일
- 학교 행사
- 중요 날짜

### 3.4 status 컬럼 일관성 없는 체크

**심각도**: 🟠 MEDIUM

**문제**: migrations/0010에서 많은 테이블에 `status` 추가했지만 대부분의 쿼리에서 필터링 안 함

**예시** ([attendance.ts](src/routes/attendance.ts) 324-335):
```sql
SELECT COUNT(*) FROM attendance WHERE student_id = ?
-- 누락: AND COALESCE(is_deleted, 0) = 0
```

### 3.5 대량 작업 부재

**심각도**: 🟠 MEDIUM

**누락된 대량 작업**:
- 수업에 학생 대량 등록
- 성적 대량 입력/내보내기
- 학부모-학생 대량 연결
- 담임 대량 배정

---

## 4. 불일치 사항 (INCONSISTENCIES)

### 4.1 명명 규칙 불일치

#### A. 데이터베이스 필드명

| 테이블 | 불일치 | 영향 |
|--------|--------|------|
| `semesters` | `is_current` 사용 | 다른 테이블은 `is_active` |
| `attendance` | `is_deleted` 사용 | 다른 테이블은 `status` |
| `counseling_records` | `topic` 필드 | 다른 테이블은 `title` |
| `volunteer_activities` | `status`와 `category` 둘 다 | 혼란스러움 |

#### B. 라우트 응답 형식

일관성 없는 JSON 응답 패턴:
```typescript
// 어떤 라우트:
{ students: [] }  // 복수형 래퍼

// 다른 라우트:
{ results: [] }   // 일반 래퍼

// 또 다른 라우트:
{ user: {}, teacher: {} }  // 직접 객체
```

**권장**: `{ data: {}, meta: {} }` 패턴으로 표준화

### 4.2 권한 체크 불일치

| 라우트 | 권한 패턴 | 문제 |
|--------|----------|------|
| [grades.ts:119-145](src/routes/grades.ts#L119-L145) | if문으로 수동 역할 체크 | 미들웨어와 불일치 |
| [attendance.ts:295-320](src/routes/attendance.ts#L295-L320) | 수동 학부모/학생 검증 | 미들웨어 로직 중복 |
| [assignments.ts:22-66](src/routes/assignments.ts#L22-L66) | 커스텀 권한 로직 | `requireStudentOrAuthorized` 사용해야 함 |
| [students.ts:8](src/routes/students.ts#L8) | `requireRole` 정확히 사용 | 좋은 패턴 |

---

## 5. 보안 이슈 세부사항

### 5.1 약한 토큰 검증

**파일**: [src/middleware/auth.ts](src/middleware/auth.ts) (14-24)

```typescript
// 취약점: 서명 검증 없는 단순 Base64 디코드
if (token.includes('.')) {
  payload = JSON.parse(atob(token.split('.')[1]));
} else {
  payload = JSON.parse(atob(token));
}
// 만료 검증이 많은 곳에서 누락
// 토큰 폐기 없음
```

### 5.2 비밀번호 저장 문제

**파일**: [src/routes/auth.ts](src/routes/auth.ts) (27-33)

```typescript
const isValid = user.password_hash === password ||  // 평문 비교!
                await verifyPassword(password, user.password_hash);
```

**영향**: 평문 비밀번호 허용 (레거시/디버그 코드가 프로덕션에 존재)

### 5.3 누락된 권한 체크

**예시**:
1. **상담 기록** ([counseling.ts](src/routes/counseling.ts)): 교사/상담사가 학생 접근 권한 있는지 체크 안 함
2. **성적** ([grades.ts:8-42](src/routes/grades.ts#L8-L42)): 교사가 수업 관계 없이 모든 성적 조회 가능
3. **학급** ([classes.ts:96-131](src/routes/classes.ts#L96-L131)): 사용자가 학급 학생 접근 가능한지 검증 안 함

### 5.4 노출된 민감 정보

#### A. 학생 개인정보

**파일**: [src/routes/students.ts](src/routes/students.ts) (128-218)

모든 학생 데이터 반환:
- `medical_notes` (의료 기록)
- `allergy_info` (알레르기 정보)
- `guardian` 개인정보
- `address` (주소)

**프라이버시 통제 없음**: 관리자가 아닌 교사도 모든 정보 조회 가능

#### B. 기밀 상담 기록

**파일**: [src/routes/counseling.ts](src/routes/counseling.ts)

스키마에 `is_confidential` 플래그 있지만:
- 쿼리에서 강제 안 함
- 기밀 수준 기반 접근 제어 없음
- 모든 상담사가 모든 기록 조회

---

## 6. 데이터 무결성 이슈

### 6.1 누락된 외래 키 관계

| 마이그레이션 이슈 | 영향 |
|------------------|------|
| `migrations/0010` (117): attendance가 이미 TEXT `status` 있음 | INTEGER `status` 추가 시 컬럼 충돌 |
| `counseling_records.counselor_id` | 라우트에서 사용 안 함, 데이터 고아화 |
| `courses.class_id` | Nullable이지만 검증 없이 학생 자동 등록 |

### 6.2 Cascade 삭제 문제

**위험한 cascade 식별**:
1. **사용자 삭제** → 학생 삭제 → 모든 성적/출석 손실
2. **학기 삭제** → 모든 수업 삭제 → 모든 수강신청/성적 손실
3. **수업 삭제** → 모든 과제 삭제 → 학생 제출물 손실

### 6.3 고아 레코드 가능성

| 시나리오 | 문제 | 필요한 수정 |
|----------|------|------------|
| 교사 퇴사 | `courses.teacher_id` 무효화 | SET NULL 또는 재배정 |
| 학생 전학 | `enrollments` 활성 상태 유지 | 상태 업데이트 워크플로 |
| 학기 종료 | `is_current` 플래그 수동 관리 | 자동 전환 |
| 학급 해체 | 학생이 `student_class_history`에 남음 | 아카이브 프로세스 |

---

## 7. 즉시 조치 필요 항목

### Week 1 (치명적 보안 수정)
1. ✅ 모든 보호되지 않은 라우트에 `authMiddleware` 추가
2. ✅ counseling.ts 스키마 불일치 수정
3. ✅ 적절한 JWT 서명 구현
4. ✅ users/students/semesters에 soft delete 추가
5. ✅ counseling/grades 접근에 권한 체크 추가

### Week 2 (데이터 무결성)
1. ⏳ 모든 쿼리에 status 필터링 추가
2. ⏳ cascade delete 관계 검토 및 수정
3. ⏳ 파일 업로드 시스템 구현 또는 참조 제거
4. ⏳ teachers.ts 누락 엔드포인트 수정
5. ⏳ 오류 응답 표준화

### Week 3 (기능 완성)
1. ⏳ 게시판 작성 엔드포인트 완성
2. ⏳ 일반 작업에 대량 작업 추가
3. ⏳ 과제 마감일 알림 구현
4. ⏳ 성적 잠금 메커니즘 추가
5. ⏳ 학부모-교사 메시징 기반 생성

### Month 2 (주요 기능)
1. ⏳ 성적표 생성 시스템 구축
2. ⏳ 등록 워크플로 구현
3. ⏳ 학사 일정 추가
4. ⏳ 학부모 포털 기능 생성
5. ⏳ 출석 알림 자동화

---

## 8. 통계

- **분석한 총 라우트**: 171개 엔드포인트 (28개 파일)
- **인증 없는 라우트**: ~40% (치명적 취약점)
- **발견된 스키마 불일치**: 3건 (런타임 오류 발생)
- **불완전한 CRUD 작업**: 8개 엔티티
- **보안 이슈**: 12건 (치명적/높음)
- **데이터 무결성 위험**: 7건 cascade 문제
- **누락된 핵심 기능**: 7개 주요 학교 관리 기능

---

## 9. 결론

이 감사는 기본 기능이 구현되었지만 보안, 인증 및 핵심 학교 관리 기능에 중요한 격차가 있는 활발히 개발 중인 시스템을 보여줍니다.

**즉각적인 초점은**:
1. 기존 엔드포인트 보안
2. 스키마 불일치 수정
3. 새 기능 추가 전 데이터 무결성 보장

---

**보고서 작성**: Claude Code
**날짜**: 2025-12-05
**다음 검토 예정**: 수정 완료 후
