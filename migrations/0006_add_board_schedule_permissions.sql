-- ============================================
-- 역할별 UI 분리를 위한 테이블 추가
-- ============================================

-- ============================================
-- 게시판 시스템
-- ============================================

-- 게시판 카테고리
CREATE TABLE IF NOT EXISTS boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  board_type TEXT NOT NULL CHECK(board_type IN ('student', 'class', 'club', 'course')),
  target_id INTEGER, -- class_id, club_id, course_id (NULL이면 전체 학생용)
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 게시글
CREATE TABLE IF NOT EXISTS board_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_notice INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 댓글
CREATE TABLE IF NOT EXISTS board_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id INTEGER, -- 대댓글용
  is_deleted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES board_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (parent_comment_id) REFERENCES board_comments(id)
);

-- ============================================
-- 시간표 시스템 확장
-- ============================================
-- 시간표(schedules) 테이블은 이미 0003에서 생성됨

-- 시간표 설정 (교시별 시간)
CREATE TABLE IF NOT EXISTS schedule_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_number INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  UNIQUE(period_number)
);

-- ============================================
-- 과목별 QnA
-- ============================================

-- 과목 Q&A
CREATE TABLE IF NOT EXISTS course_qna (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by INTEGER, -- teacher_id
  answered_at DATETIME,
  is_private INTEGER DEFAULT 0, -- 비공개 질문
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'answered', 'closed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (answered_by) REFERENCES teachers(id)
);

-- ============================================
-- 교사 권한 관리
-- ============================================

-- 교사별 권한 설정
CREATE TABLE IF NOT EXISTS teacher_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  permission_type TEXT NOT NULL CHECK(permission_type IN (
    'manage_own_class',      -- 자기 반 관리
    'manage_own_courses',    -- 자기 과목 관리
    'manage_attendance',     -- 출석 관리
    'manage_grades',         -- 성적 관리
    'manage_all_students',   -- 전체 학생 관리
    'manage_teachers',       -- 교사 관리
    'manage_system'          -- 시스템 설정
  )),
  granted_by INTEGER, -- admin user_id
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id),
  UNIQUE(teacher_id, permission_type)
);

-- ============================================
-- 인덱스 생성
-- ============================================

-- 게시판 인덱스
CREATE INDEX IF NOT EXISTS idx_boards_type_target ON boards(board_type, target_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_board ON board_posts(board_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_author ON board_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_board_comments_post ON board_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_board_comments_author ON board_comments(author_id);

-- 시간표 인덱스는 이미 존재하거나 필요시 추가

-- QnA 인덱스
CREATE INDEX IF NOT EXISTS idx_course_qna_course ON course_qna(course_id);
CREATE INDEX IF NOT EXISTS idx_course_qna_student ON course_qna(student_id);
CREATE INDEX IF NOT EXISTS idx_course_qna_status ON course_qna(status);

-- 권한 인덱스
CREATE INDEX IF NOT EXISTS idx_teacher_permissions_teacher ON teacher_permissions(teacher_id);

-- ============================================
-- 기본 데이터 삽입
-- ============================================

-- 기본 교시 설정 (8교시)
INSERT OR IGNORE INTO schedule_periods (period_number, start_time, end_time) VALUES
  (1, '09:00', '09:50'),
  (2, '10:00', '10:50'),
  (3, '11:00', '11:50'),
  (4, '12:00', '12:50'),
  (5, '13:00', '13:50'),
  (6, '14:00', '14:50'),
  (7, '15:00', '15:50'),
  (8, '16:00', '16:50');

-- 전체 학생용 게시판
INSERT OR IGNORE INTO boards (name, board_type, target_id, description) VALUES
  ('공지사항', 'student', NULL, '학교 전체 공지사항'),
  ('자유게시판', 'student', NULL, '학생들의 자유로운 소통 공간');

-- 기본 교사 권한 설정 (모든 교사에게 기본 권한)
INSERT OR IGNORE INTO teacher_permissions (teacher_id, permission_type)
SELECT id, 'manage_own_class' FROM teachers
WHERE id NOT IN (SELECT teacher_id FROM teacher_permissions WHERE permission_type = 'manage_own_class');

INSERT OR IGNORE INTO teacher_permissions (teacher_id, permission_type)
SELECT id, 'manage_own_courses' FROM teachers
WHERE id NOT IN (SELECT teacher_id FROM teacher_permissions WHERE permission_type = 'manage_own_courses');

