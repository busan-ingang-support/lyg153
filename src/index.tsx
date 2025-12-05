import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { CloudflareBindings } from './types';

// 라우트 임포트
import auth from './routes/auth';
import users from './routes/users';
import students from './routes/students';
import semesters from './routes/semesters';
import subjects from './routes/subjects';
import classes from './routes/classes';
import attendance from './routes/attendance';
import grades from './routes/grades';
import volunteer from './routes/volunteer';
import clubs from './routes/clubs';
import counseling from './routes/counseling';
import settings from './routes/settings';
import studentClassHistory from './routes/student-class-history';
import teacherHomeroom from './routes/teacher-homeroom';
import studentReport from './routes/student-report';
import awards from './routes/awards';
import reading from './routes/reading';
import moduleSettings from './routes/module-settings';
import courses from './routes/courses';
import schedules from './routes/schedules';
import boards from './routes/boards';
import courseQna from './routes/course-qna';
import teacherPermissions from './routes/teacher-permissions';
import teachers from './routes/teachers';
import homepage from './routes/homepage';
import homepageModules from './routes/homepage-modules';
import assignments from './routes/assignments';
import notifications from './routes/notifications';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// CORS 설정
app.use('/api/*', cors());

// 정적 파일 제공
app.use('/static/*', serveStatic({ root: './public' }));

// API 라우트 연결
app.route('/api/auth', auth);
app.route('/api/users', users);
app.route('/api/students', students);
app.route('/api/semesters', semesters);
app.route('/api/subjects', subjects);
app.route('/api/classes', classes);
app.route('/api/attendance', attendance);
app.route('/api/grades', grades);
app.route('/api/volunteer', volunteer);
app.route('/api/clubs', clubs);
app.route('/api/counseling', counseling);
app.route('/api/settings', settings);
app.route('/api/student-class-history', studentClassHistory);
app.route('/api/teacher-homeroom', teacherHomeroom);
app.route('/api/student-report', studentReport);
app.route('/api/awards', awards);
app.route('/api/reading', reading);
app.route('/api/module-settings', moduleSettings);
app.route('/api/courses', courses);
app.route('/api/schedules', schedules);
app.route('/api/boards', boards);
app.route('/api/course-qna', courseQna);
app.route('/api/teacher-permissions', teacherPermissions);
app.route('/api/teachers', teachers);
app.route('/api/homepage', homepage);
app.route('/api/homepage-modules', homepageModules);
app.route('/api/assignments', assignments);
app.route('/api/notifications', notifications);

// 기본 홈페이지
app.get('/', (c) => {
    return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>학적 관리 시스템</title>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234169E1'/><text x='50' y='70' font-size='60' text-anchor='middle' fill='white' font-family='Arial'>학</text></svg>">
        <link rel="stylesheet" href="/static/styles.css">
        <link rel="stylesheet" href="/static/postech-style.css">
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="app">
            <!-- 로그인 화면 -->
            <div id="login-screen" class="hidden min-h-screen flex items-center justify-center p-4">
                <div class="card-modern w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 mb-4">
                            <i class="fas fa-graduation-cap text-2xl text-purple-600"></i>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-800 mb-1">학적 관리 시스템</h1>
                        <p class="text-gray-500 text-sm">대안학교 통합 관리</p>
                    </div>
                    
                    <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
                        <span id="error-message"></span>
                    </div>
                    
                    <form id="login-form" class="space-y-5">
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">아이디</label>
                            <input type="text" id="username" required class="input-modern w-full">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">비밀번호</label>
                            <input type="password" id="password" required class="input-modern w-full">
                        </div>
                        <button type="submit" class="btn-pastel-primary w-full py-3 rounded-lg font-medium">
                            로그인
                        </button>
                    </form>
                    
                    <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p class="text-xs font-semibold text-gray-700 mb-2">테스트 계정</p>
                        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div><span class="font-medium">관리자:</span> admin</div>
                            <div><span class="font-medium">교사:</span> teacher1</div>
                            <div><span class="font-medium">학생:</span> student1</div>
                            <div><span class="font-medium">학부모:</span> parent1</div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">비밀번호: [계정명]123</p>
                    </div>
                </div>
            </div>
            
            <!-- 대시보드 화면 -->
            <div id="dashboard-screen" class="hidden">
                <!-- 상단 네비게이션 바 -->
                <nav class="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                    <div class="px-6">
                        <div class="flex items-center justify-between py-4">
                            <div class="flex items-center space-x-3">
                                <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100">
                                    <i class="fas fa-graduation-cap text-base text-purple-600"></i>
                                </div>
                                <h1 class="text-lg font-bold text-gray-800">학적 관리 시스템</h1>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span id="user-info" class="text-sm text-gray-600"></span>
                                <button id="logout-btn" class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 smooth-transition font-medium text-sm">
                                    <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <!-- 메인 레이아웃 (사이드바 + 컨텐츠) -->
                <div class="flex pt-16">
                    <!-- 왼쪽 사이드바 (고정) -->
                    <aside class="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
                        <div class="p-4">
                            <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">주요 기능</h2>
                            <nav class="space-y-1">
                                <!-- 동적으로 메뉴가 로드됩니다 -->
                            </nav>
                        </div>
                    </aside>
                    
                    <!-- 오른쪽 메인 컨텐츠 영역 -->
                    <main class="ml-64 flex-1 p-8 bg-transparent min-h-screen">
                        <div id="main-content">
                            <!-- 동적으로 컨텐츠가 로드됩니다 -->
                        </div>
                    </main>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/public-home.js?v=202512051300"></script>
        <script src="/static/student-home.js?v=202511141500"></script>
        <script src="/static/parent-home.js?v=202511212350"></script>
        <script src="/static/homepage-module-management.js?v=202511211100"></script>
        <script src="/static/app.js?v=202511212400"></script>
        <script src="/static/add-pages-functions.js?v=202511111600" defer></script>
        <script src="/static/schedule-management.js?v=202512051800" defer></script>
        <script src="/static/subject-management.js?v=202511111700" defer></script>
        <script src="/static/admin.js?v=202511071013" defer></script>
        <script src="/static/counseling.js?v=202511212400" defer></script>
        <script src="/static/settings.js?v=202511212400" defer></script>
        <script src="/static/class-detail.js?v=202512051700" defer></script>
        <script src="/static/student-detail.js?v=202512051215" defer></script>
        <script src="/static/reports.js?v=202511212400" defer></script>
        <script src="/static/attendance-improved.js?v=202511071013" defer></script>
        <script src="/static/teacher-management.js?v=202511212400" defer></script>
        <script src="/static/user-management.js?v=202511121000" defer></script>
        <script src="/static/assignment-management.js?v=202512041400" defer></script>
        <!-- homepage-management.js는 레거시 파일이므로 더 이상 사용하지 않습니다 -->
        <!-- <script src="/static/homepage-management.js?v=202511200000" defer></script> -->
    </body>
    </html>
  `);
});

export default app;
