// ============================================
// 학생용 홈 페이지
// ============================================

// 학생 홈페이지 표시
async function showStudentHome() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- 학생용 홈페이지 -->
        <div id="student-home" class="min-h-screen bg-gray-50">
            <!-- 헤더 -->
            <header class="bg-white shadow-sm sticky top-0 z-50">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <i class="fas fa-graduation-cap text-purple-600 text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-gray-800">학적 관리 시스템</h1>
                                <p class="text-sm text-gray-500">School Management System</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-6">
                            <nav class="hidden md:flex space-x-6">
                                <a href="#" class="nav-item text-gray-600 hover:text-purple-600" data-page="home">홈</a>
                                <a href="#" class="nav-item text-gray-600 hover:text-purple-600" data-page="mypage">마이페이지</a>
                                <a href="#" class="nav-item text-gray-600 hover:text-purple-600" data-page="board">게시판</a>
                                <a href="#" class="nav-item text-gray-600 hover:text-purple-600" data-page="qna">Q&A</a>
                            </nav>
                            <div class="flex items-center space-x-4">
                                <div class="text-right">
                                    <p class="text-sm font-medium text-gray-700">${currentUser.name}</p>
                                    <p class="text-xs text-gray-500">학생</p>
                                </div>
                                <button id="student-logout-btn" class="btn-secondary text-sm">로그아웃</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- 메인 컨텐츠 -->
            <main id="student-content" class="container mx-auto px-4 py-8">
                <!-- 여기에 동적으로 컨텐츠 로드 -->
            </main>
        </div>
    `;

    // 기본적으로 홈 표시
    showStudentMainHome();
    
    // 이벤트 리스너 설정
    setupStudentNavigation();
}

// 학생 네비게이션 설정
function setupStudentNavigation() {
    // 로그아웃
    document.getElementById('student-logout-btn')?.addEventListener('click', handleLogout);
    
    // 메뉴 네비게이션
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            
            // 활성 상태 업데이트
            document.querySelectorAll('.nav-item').forEach(link => {
                link.classList.remove('text-purple-600', 'font-semibold');
                link.classList.add('text-gray-600');
            });
            e.target.classList.add('text-purple-600', 'font-semibold');
            e.target.classList.remove('text-gray-600');
            
            // 페이지 전환
            navigateStudentPage(page);
        });
    });
}

// 학생 페이지 네비게이션
function navigateStudentPage(page) {
    switch (page) {
        case 'home':
            showStudentMainHome();
            break;
        case 'mypage':
            showStudentMyPage();
            break;
        case 'board':
            showStudentBoard();
            break;
        case 'qna':
            showStudentQnA();
            break;
        default:
            showStudentMainHome();
    }
}

// ============================================
// 메인 홈 (학교 소개 스타일)
// ============================================
async function showStudentMainHome() {
    const content = document.getElementById('student-content');
    
    content.innerHTML = `
        <!-- 환영 배너 -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-8">
            <h2 class="text-3xl font-bold mb-2">환영합니다, ${currentUser.name}님! 👋</h2>
            <p class="text-purple-100">오늘도 즐거운 학교생활 되세요!</p>
        </div>

        <!-- 빠른 메뉴 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="card-modern hover:shadow-lg transition-shadow cursor-pointer" onclick="navigateStudentPage('mypage')">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <i class="fas fa-calendar-alt text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">시간표</p>
                        <p class="text-lg font-semibold text-gray-800">오늘의 수업</p>
                    </div>
                </div>
            </div>
            
            <div class="card-modern hover:shadow-lg transition-shadow cursor-pointer" onclick="navigateStudentPage('board')">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <i class="fas fa-bullhorn text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">게시판</p>
                        <p class="text-lg font-semibold text-gray-800">공지사항</p>
                    </div>
                </div>
            </div>
            
            <div class="card-modern hover:shadow-lg transition-shadow cursor-pointer" onclick="navigateStudentPage('qna')">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <i class="fas fa-question-circle text-yellow-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">질문하기</p>
                        <p class="text-lg font-semibold text-gray-800">과목 Q&A</p>
                    </div>
                </div>
            </div>
            
            <div class="card-modern hover:shadow-lg transition-shadow cursor-pointer" onclick="navigateStudentPage('mypage')">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <i class="fas fa-user text-purple-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">내 정보</p>
                        <p class="text-lg font-semibold text-gray-800">마이페이지</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 최근 공지사항 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="card-modern">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-bullhorn text-purple-600 mr-2"></i>
                    최근 공지사항
                </h3>
                <div id="recent-notices" class="space-y-3">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
                <button onclick="navigateStudentPage('board')" class="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium">
                    전체 보기 →
                </button>
            </div>

            <!-- 오늘의 시간표 미리보기 -->
            <div class="card-modern">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-clock text-blue-600 mr-2"></i>
                    오늘의 수업
                </h3>
                <div id="today-schedule" class="space-y-3">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
                <button onclick="navigateStudentPage('mypage')" class="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    전체 시간표 보기 →
                </button>
            </div>
        </div>
    `;

    // 데이터 로드
    loadRecentNotices();
    loadTodaySchedule();
}

// 최근 공지사항 로드
async function loadRecentNotices() {
    try {
        const response = await axios.get('/api/boards/posts?board_type=student&is_notice=1&limit=5', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const container = document.getElementById('recent-notices');
        const notices = response.data.posts || [];
        
        if (notices.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">공지사항이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = notices.map(notice => `
            <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <i class="fas fa-file-alt text-gray-400 mt-1"></i>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">${escapeHtml(notice.title)}</p>
                    <p class="text-xs text-gray-500">${formatDate(notice.created_at)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        document.getElementById('recent-notices').innerHTML = 
            '<p class="text-gray-500 text-center py-4">공지사항을 불러올 수 없습니다.</p>';
    }
}

// 오늘의 시간표 로드
async function loadTodaySchedule() {
    try {
        // 현재 학생의 반 정보 가져오기
        const studentResponse = await axios.get(`/api/students/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const classId = studentResponse.data.student.class_id;
        if (!classId) {
            document.getElementById('today-schedule').innerHTML = 
                '<p class="text-gray-500 text-center py-4">배정된 반이 없습니다.</p>';
            return;
        }
        
        // 오늘 요일 구하기 (1=월, 5=금)
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const today = new Date().getDay();
        const todayKorean = days[today];
        
        if (today === 0 || today === 6) {
            document.getElementById('today-schedule').innerHTML = 
                '<p class="text-gray-500 text-center py-4">주말에는 수업이 없습니다.</p>';
            return;
        }
        
        // 시간표 가져오기
        const response = await axios.get(`/api/schedules?class_id=${classId}&day_of_week=${todayKorean}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const schedules = response.data.schedules || [];
        const container = document.getElementById('today-schedule');
        
        if (schedules.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">오늘은 수업이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = schedules.map(schedule => `
            <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-bold text-blue-600">${schedule.period}교시</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-800">${escapeHtml(schedule.subject_name || '수업')}</p>
                    <p class="text-xs text-gray-500">${escapeHtml(schedule.teacher_name || '')} ${schedule.room_number ? '· ' + schedule.room_number : ''}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('시간표 로드 실패:', error);
        document.getElementById('today-schedule').innerHTML = 
            '<p class="text-gray-500 text-center py-4">시간표를 불러올 수 없습니다.</p>';
    }
}

// ============================================
// 마이페이지 (시간표, 내 정보)
// ============================================
async function showStudentMyPage() {
    const content = document.getElementById('student-content');
    
    content.innerHTML = `
        <div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">마이페이지</h2>
            
            <!-- 탭 메뉴 -->
            <div class="border-b border-gray-200 mb-6">
                <nav class="flex space-x-8">
                    <button class="mypage-tab border-b-2 border-purple-600 text-purple-600 pb-3 px-1 font-medium" data-tab="schedule">
                        시간표
                    </button>
                    <button class="mypage-tab border-b-2 border-transparent text-gray-500 pb-3 px-1 hover:text-gray-700" data-tab="info">
                        내 정보
                    </button>
                    <button class="mypage-tab border-b-2 border-transparent text-gray-500 pb-3 px-1 hover:text-gray-700" data-tab="attendance">
                        출석 현황
                    </button>
                </nav>
            </div>

            <!-- 탭 컨텐츠 -->
            <div id="mypage-tab-content">
                <!-- 여기에 동적으로 로드 -->
            </div>
        </div>
    `;

    // 탭 이벤트 설정
    document.querySelectorAll('.mypage-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            
            // 탭 활성화 상태 업데이트
            document.querySelectorAll('.mypage-tab').forEach(t => {
                t.classList.remove('border-purple-600', 'text-purple-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            e.target.classList.add('border-purple-600', 'text-purple-600');
            e.target.classList.remove('border-transparent', 'text-gray-500');
            
            // 컨텐츠 로드
            loadMyPageTab(tabName);
        });
    });

    // 기본 탭 로드
    loadMyPageTab('schedule');
}

// 마이페이지 탭 로드
async function loadMyPageTab(tab) {
    const content = document.getElementById('mypage-tab-content');
    
    switch (tab) {
        case 'schedule':
            await loadWeeklySchedule(content);
            break;
        case 'info':
            await loadStudentInfo(content);
            break;
        case 'attendance':
            await loadStudentAttendance(content);
            break;
    }
}

// 주간 시간표 로드
async function loadWeeklySchedule(container) {
    container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
    
    try {
        // 학생의 반 정보 가져오기
        const studentResponse = await axios.get(`/api/students/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const classId = studentResponse.data.student.class_id;
        if (!classId) {
            container.innerHTML = '<p class="text-gray-500 text-center py-12">배정된 반이 없습니다.</p>';
            return;
        }
        
        // 주간 시간표 가져오기
        const response = await axios.get(`/api/schedules/weekly/${classId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const schedule = response.data.schedule || {};
        const days = ['월', '화', '수', '목', '금'];
        const periods = 7;
        
        let html = `
            <div class="card-modern overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">교시</th>
                            ${days.map(day => `<th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let period = 1; period <= periods; period++) {
            html += '<tr class="border-t border-gray-200">';
            html += `<td class="px-4 py-4 text-sm font-medium text-gray-700">${period}교시</td>`;
            
            days.forEach(day => {
                const item = schedule[day]?.[period];
                if (item) {
                    html += `
                        <td class="px-4 py-4 text-center">
                            <div class="bg-blue-50 rounded-lg p-3">
                                <p class="text-sm font-medium text-gray-800">${escapeHtml(item.subject_name || '수업')}</p>
                                <p class="text-xs text-gray-500 mt-1">${escapeHtml(item.teacher_name || '')}</p>
                                ${item.room_number ? `<p class="text-xs text-gray-400">${item.room_number}</p>` : ''}
                            </div>
                        </td>
                    `;
                } else {
                    html += '<td class="px-4 py-4 text-center text-gray-400 text-sm">-</td>';
                }
            });
            
            html += '</tr>';
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
    } catch (error) {
        console.error('시간표 로드 실패:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-12">시간표를 불러올 수 없습니다.</p>';
    }
}

// 학생 정보 로드
async function loadStudentInfo(container) {
    container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
    
    try {
        const response = await axios.get(`/api/students/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const student = response.data.student;
        
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 기본 정보 -->
                <div class="card-modern">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">기본 정보</h3>
                    <dl class="space-y-3">
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">이름</dt>
                            <dd class="text-sm font-medium text-gray-800">${escapeHtml(currentUser.name)}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">학번</dt>
                            <dd class="text-sm font-medium text-gray-800">${escapeHtml(student.student_number)}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">학년</dt>
                            <dd class="text-sm font-medium text-gray-800">${student.grade}학년</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">이메일</dt>
                            <dd class="text-sm font-medium text-gray-800">${escapeHtml(currentUser.email)}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">연락처</dt>
                            <dd class="text-sm font-medium text-gray-800">${escapeHtml(currentUser.phone || '-')}</dd>
                        </div>
                    </dl>
                </div>

                <!-- 학적 정보 -->
                <div class="card-modern">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">학적 정보</h3>
                    <dl class="space-y-3">
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">상태</dt>
                            <dd class="text-sm font-medium text-gray-800">
                                <span class="badge badge-success">${getStatusText(student.status)}</span>
                            </dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">입학일</dt>
                            <dd class="text-sm font-medium text-gray-800">${formatDate(student.admission_date)}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">주소</dt>
                            <dd class="text-sm font-medium text-gray-800">${escapeHtml(student.address || '-')}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-sm text-gray-500">비상연락처</dt>
                            <dd class="text-sm font-medium text-gray-800">${escapeHtml(student.emergency_contact || '-')}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('학생 정보 로드 실패:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-12">정보를 불러올 수 없습니다.</p>';
    }
}

// 학생 출석 현황 로드
async function loadStudentAttendance(container) {
    container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
    
    container.innerHTML = `
        <div class="card-modern">
            <h3 class="text-lg font-bold text-gray-800 mb-4">출석 현황</h3>
            <p class="text-gray-500 text-center py-8">출석 통계 기능은 곧 추가될 예정입니다.</p>
        </div>
    `;
}

// ============================================
// 게시판
// ============================================
async function showStudentBoard() {
    const content = document.getElementById('student-content');
    
    content.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">게시판</h2>
            
            <div class="card-modern">
                <p class="text-gray-500 text-center py-12">게시판 기능은 곧 추가될 예정입니다.</p>
            </div>
        </div>
    `;
}

// ============================================
// Q&A
// ============================================
async function showStudentQnA() {
    const content = document.getElementById('student-content');
    
    content.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">과목 Q&A</h2>
            
            <div class="card-modern">
                <p class="text-gray-500 text-center py-12">Q&A 기능은 곧 추가될 예정입니다.</p>
            </div>
        </div>
    `;
}

// ============================================
// 유틸리티 함수
// ============================================

function getStatusText(status) {
    const statusMap = {
        'enrolled': '재학',
        'graduated': '졸업',
        'transferred': '전학',
        'dropped': '자퇴'
    };
    return statusMap[status] || status;
}

