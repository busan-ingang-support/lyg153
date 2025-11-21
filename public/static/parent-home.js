// ============================================
// 학부모용 대시보드
// ============================================

// 학부모 대시보드 표시
async function showParentHome() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <!-- 학부모용 대시보드 -->
        <div id="parent-home" class="min-h-screen bg-gray-50">
            <!-- 헤더 -->
            <header class="bg-white shadow-sm sticky top-0 z-50">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <i class="fas fa-users text-blue-600 text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-gray-800">학부모 대시보드</h1>
                                <p class="text-sm text-gray-500">Parent Dashboard</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-6">
                            <nav class="hidden md:flex space-x-6">
                                <a href="#" class="parent-nav-item text-gray-600 hover:text-blue-600 font-medium" data-page="home">홈</a>
                                <a href="#" class="parent-nav-item text-gray-600 hover:text-blue-600" data-page="attendance">출석</a>
                                <a href="#" class="parent-nav-item text-gray-600 hover:text-blue-600" data-page="grades">성적</a>
                                <a href="#" class="parent-nav-item text-gray-600 hover:text-blue-600" data-page="schedule">일정</a>
                                <a href="#" class="parent-nav-item text-gray-600 hover:text-blue-600" data-page="counseling">상담</a>
                            </nav>
                            <div class="flex items-center space-x-4">
                                <div class="text-right">
                                    <p class="text-sm font-medium text-gray-700">${currentUser.name}</p>
                                    <p class="text-xs text-gray-500">학부모</p>
                                </div>
                                <button id="parent-logout-btn" class="btn-secondary text-sm">로그아웃</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- 메인 컨텐츠 -->
            <main id="parent-content" class="container mx-auto px-4 py-8">
                <!-- 여기에 동적으로 컨텐츠 로드 -->
            </main>
        </div>
    `;

    // 기본적으로 홈 표시
    await showParentMainHome();

    // 이벤트 리스너 설정
    setupParentNavigation();
}

// 학부모 네비게이션 설정
function setupParentNavigation() {
    // 로그아웃
    document.getElementById('parent-logout-btn')?.addEventListener('click', handleLogout);

    // 메뉴 네비게이션
    document.querySelectorAll('.parent-nav-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');

            // 활성 메뉴 표시
            document.querySelectorAll('.parent-nav-item').forEach(i => {
                i.classList.remove('text-blue-600', 'font-medium');
                i.classList.add('text-gray-600');
            });
            e.target.classList.add('text-blue-600', 'font-medium');
            e.target.classList.remove('text-gray-600');

            // 페이지 이동
            navigateParentPage(page);
        });
    });
}

// 학부모 페이지 네비게이션
async function navigateParentPage(page) {
    switch(page) {
        case 'home':
            await showParentMainHome();
            break;
        case 'attendance':
            await showParentAttendance();
            break;
        case 'grades':
            await showParentGrades();
            break;
        case 'schedule':
            await showParentSchedule();
            break;
        case 'counseling':
            await showParentCounseling();
            break;
        default:
            await showParentMainHome();
    }
}

// ============================================
// 메인 홈
// ============================================
async function showParentMainHome() {
    const content = document.getElementById('parent-content');

    content.innerHTML = `
        <div class="space-y-6">
            <!-- 환영 배너 -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                <h2 class="text-3xl font-bold mb-2">안녕하세요, ${currentUser.name}님!</h2>
                <p class="text-blue-100">자녀의 학교 생활을 확인하실 수 있습니다.</p>
            </div>

            <!-- 자녀 정보 로딩 -->
            <div id="children-section">
                <div class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-gray-600">자녀 정보를 불러오는 중...</p>
                </div>
            </div>

            <!-- 빠른 메뉴 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <a href="#" class="parent-quick-menu bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center" data-page="attendance">
                    <div class="w-12 h-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                        <i class="fas fa-calendar-check text-green-600 text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">출석 현황</h3>
                    <p class="text-sm text-gray-500">자녀의 출석 기록</p>
                </a>

                <a href="#" class="parent-quick-menu bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center" data-page="grades">
                    <div class="w-12 h-12 rounded-full bg-purple-100 mx-auto mb-3 flex items-center justify-center">
                        <i class="fas fa-chart-line text-purple-600 text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">성적 확인</h3>
                    <p class="text-sm text-gray-500">자녀의 성적 조회</p>
                </a>

                <a href="#" class="parent-quick-menu bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center" data-page="schedule">
                    <div class="w-12 h-12 rounded-full bg-orange-100 mx-auto mb-3 flex items-center justify-center">
                        <i class="fas fa-calendar-alt text-orange-600 text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">학사 일정</h3>
                    <p class="text-sm text-gray-500">학교 주요 일정</p>
                </a>

                <a href="#" class="parent-quick-menu bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center" data-page="counseling">
                    <div class="w-12 h-12 rounded-full bg-red-100 mx-auto mb-3 flex items-center justify-center">
                        <i class="fas fa-comments text-red-600 text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">상담 내역</h3>
                    <p class="text-sm text-gray-500">상담 기록 확인</p>
                </a>
            </div>

            <!-- 최근 공지사항 -->
            <div id="recent-notices-section" class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-bullhorn text-blue-600 mr-2"></i>
                    최근 공지사항
                </h3>
                <div class="text-center py-8 text-gray-500">
                    공지사항을 불러오는 중...
                </div>
            </div>
        </div>
    `;

    // 빠른 메뉴 이벤트 리스너
    document.querySelectorAll('.parent-quick-menu').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = e.target.closest('.parent-quick-menu').getAttribute('data-page');

            // 상단 네비게이션도 업데이트
            document.querySelectorAll('.parent-nav-item').forEach(navItem => {
                navItem.classList.remove('text-blue-600', 'font-medium');
                navItem.classList.add('text-gray-600');
                if (navItem.getAttribute('data-page') === page) {
                    navItem.classList.add('text-blue-600', 'font-medium');
                    navItem.classList.remove('text-gray-600');
                }
            });

            await navigateParentPage(page);
        });
    });

    // 자녀 정보 로드
    await loadChildrenInfo();

    // 공지사항 로드
    await loadRecentNotices();
}

// 자녀 정보 로드
async function loadChildrenInfo() {
    try {
        const response = await axios.get(`/api/users/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const children = response.data.children || [];
        const childrenSection = document.getElementById('children-section');

        if (!childrenSection) return;

        if (children.length === 0) {
            childrenSection.innerHTML = `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <i class="fas fa-user-friends text-gray-400 text-5xl mb-4"></i>
                    <p class="text-gray-600">등록된 자녀 정보가 없습니다.</p>
                    <p class="text-sm text-gray-500 mt-2">관리자에게 문의해주세요.</p>
                </div>
            `;
            return;
        }

        // 자녀 카드 생성
        const childrenCards = await Promise.all(children.map(async (child) => {
            // 반 정보 조회
            let className = `${child.grade}학년`;
            if (child.class_id) {
                try {
                    const classResponse = await axios.get(`/api/classes/${child.class_id}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    className = classResponse.data.class?.name || className;
                } catch (error) {
                    console.error('반 정보 조회 실패:', error);
                }
            }

            // 최근 출석률 계산
            let attendanceRate = '집계 중';
            try {
                const attendanceResponse = await axios.get(`/api/attendance/student/${child.id}/summary`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const summary = attendanceResponse.data.summary;
                if (summary && summary.total > 0) {
                    const rate = ((summary.present / summary.total) * 100).toFixed(1);
                    attendanceRate = `${rate}%`;
                }
            } catch (error) {
                console.error('출석 정보 조회 실패:', error);
            }

            return `
                <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition" data-student-id="${child.id}">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                ${child.student_name ? child.student_name.charAt(0) : '?'}
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">${child.student_name || '이름 없음'}</h3>
                                <p class="text-sm text-gray-500">${className}</p>
                                <p class="text-xs text-gray-400 mt-1">관계: ${child.relationship || '미설정'}</p>
                            </div>
                        </div>
                        ${child.is_primary ? '<span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">주 보호자</span>' : ''}
                    </div>

                    <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-green-600">${attendanceRate}</p>
                            <p class="text-xs text-gray-500 mt-1">출석률</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-purple-600">-</p>
                            <p class="text-xs text-gray-500 mt-1">평균 성적</p>
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t flex gap-2">
                        <button class="flex-1 btn-secondary text-sm view-child-attendance" data-student-id="${child.id}">
                            <i class="fas fa-calendar-check mr-1"></i>
                            출석 보기
                        </button>
                        <button class="flex-1 btn-secondary text-sm view-child-grades" data-student-id="${child.id}">
                            <i class="fas fa-chart-bar mr-1"></i>
                            성적 보기
                        </button>
                    </div>
                </div>
            `;
        }));

        childrenSection.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-child text-blue-600 mr-2"></i>
                    자녀 정보 (${children.length}명)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${childrenCards.join('')}
                </div>
            </div>
        `;

        // 자녀별 출석/성적 버튼 이벤트
        document.querySelectorAll('.view-child-attendance').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const studentId = e.target.closest('.view-child-attendance').getAttribute('data-student-id');
                await showParentAttendance(studentId);

                // 상단 네비게이션 업데이트
                document.querySelectorAll('.parent-nav-item').forEach(navItem => {
                    navItem.classList.remove('text-blue-600', 'font-medium');
                    navItem.classList.add('text-gray-600');
                    if (navItem.getAttribute('data-page') === 'attendance') {
                        navItem.classList.add('text-blue-600', 'font-medium');
                        navItem.classList.remove('text-gray-600');
                    }
                });
            });
        });

        document.querySelectorAll('.view-child-grades').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const studentId = e.target.closest('.view-child-grades').getAttribute('data-student-id');
                await showParentGrades(studentId);

                // 상단 네비게이션 업데이트
                document.querySelectorAll('.parent-nav-item').forEach(navItem => {
                    navItem.classList.remove('text-blue-600', 'font-medium');
                    navItem.classList.add('text-gray-600');
                    if (navItem.getAttribute('data-page') === 'grades') {
                        navItem.classList.add('text-blue-600', 'font-medium');
                        navItem.classList.remove('text-gray-600');
                    }
                });
            });
        });

    } catch (error) {
        console.error('자녀 정보 로드 실패:', error);
        const childrenSection = document.getElementById('children-section');
        if (childrenSection) {
            childrenSection.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-2"></i>
                    <p class="text-red-700">자녀 정보를 불러오는데 실패했습니다.</p>
                    <p class="text-sm text-red-600 mt-2">${error.message}</p>
                </div>
            `;
        }
    }
}

// 최근 공지사항 로드
async function loadRecentNotices() {
    try {
        // TODO: 공지사항 API 구현 후 연동
        const noticesSection = document.getElementById('recent-notices-section');
        if (!noticesSection) return;

        // 임시 데이터
        const notices = [];

        if (notices.length === 0) {
            const contentDiv = noticesSection.querySelector('div');
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="text-center py-4 text-gray-500">
                        <i class="fas fa-inbox text-3xl mb-2"></i>
                        <p>최근 공지사항이 없습니다.</p>
                    </div>
                `;
            }
            return;
        }

        // 공지사항 목록 표시
        // (향후 구현)

    } catch (error) {
        console.error('공지사항 로드 실패:', error);
    }
}

// ============================================
// 출석 페이지
// ============================================
async function showParentAttendance(selectedStudentId = null) {
    const content = document.getElementById('parent-content');

    try {
        // 자녀 목록 가져오기
        const response = await axios.get(`/api/users/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const children = response.data.children || [];

        if (children.length === 0) {
            content.innerHTML = `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <i class="fas fa-user-friends text-gray-400 text-5xl mb-4"></i>
                    <p class="text-gray-600">등록된 자녀 정보가 없습니다.</p>
                </div>
            `;
            return;
        }

        // 첫 번째 자녀를 기본 선택
        const studentId = selectedStudentId || children[0].id;
        const selectedChild = children.find(c => c.id == studentId) || children[0];

        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-calendar-check text-green-600 mr-2"></i>
                        출석 현황
                    </h2>
                    ${children.length > 1 ? `
                        <select id="student-selector" class="form-select w-64">
                            ${children.map(child => `
                                <option value="${child.id}" ${child.id == studentId ? 'selected' : ''}>
                                    ${child.student_name || '이름 없음'}
                                </option>
                            `).join('')}
                        </select>
                    ` : ''}
                </div>

                <!-- 출석 요약 -->
                <div id="attendance-summary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-lg shadow p-6 text-center">
                        <div class="animate-pulse bg-gray-200 h-8 w-20 mx-auto mb-2 rounded"></div>
                        <p class="text-sm text-gray-500">총 수업일</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6 text-center">
                        <div class="animate-pulse bg-gray-200 h-8 w-20 mx-auto mb-2 rounded"></div>
                        <p class="text-sm text-gray-500">출석</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6 text-center">
                        <div class="animate-pulse bg-gray-200 h-8 w-20 mx-auto mb-2 rounded"></div>
                        <p class="text-sm text-gray-500">결석</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6 text-center">
                        <div class="animate-pulse bg-gray-200 h-8 w-20 mx-auto mb-2 rounded"></div>
                        <p class="text-sm text-gray-500">출석률</p>
                    </div>
                </div>

                <!-- 최근 출석 기록 -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">최근 출석 기록</h3>
                    <div id="recent-attendance-list">
                        <div class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <p class="mt-4 text-gray-600">출석 기록을 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 자녀 선택 이벤트
        const selector = document.getElementById('student-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                showParentAttendance(e.target.value);
            });
        }

        // 출석 데이터 로드
        await loadAttendanceData(studentId);

    } catch (error) {
        console.error('출석 페이지 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span class="text-red-700">출석 정보를 불러오는데 실패했습니다: ${error.message}</span>
            </div>
        `;
    }
}

async function loadAttendanceData(studentId) {
    try {
        // 출석 요약 정보
        const summaryResponse = await axios.get(`/api/attendance/student/${studentId}/summary`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const summary = summaryResponse.data.summary;

        const summarySection = document.getElementById('attendance-summary');
        if (summarySection && summary) {
            const rate = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : 0;
            summarySection.innerHTML = `
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <p class="text-3xl font-bold text-gray-800">${summary.total || 0}</p>
                    <p class="text-sm text-gray-500">총 수업일</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <p class="text-3xl font-bold text-green-600">${summary.present || 0}</p>
                    <p class="text-sm text-gray-500">출석</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <p class="text-3xl font-bold text-red-600">${summary.absent || 0}</p>
                    <p class="text-sm text-gray-500">결석</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <p class="text-3xl font-bold text-blue-600">${rate}%</p>
                    <p class="text-sm text-gray-500">출석률</p>
                </div>
            `;
        }

        // 최근 출석 기록 (최근 30일)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const recordsResponse = await axios.get(`/api/attendance/student/${studentId}?start_date=${startDate}&end_date=${endDate}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const records = recordsResponse.data.records || [];

        const listSection = document.getElementById('recent-attendance-list');
        if (listSection) {
            if (records.length === 0) {
                listSection.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p>최근 출석 기록이 없습니다.</p>
                    </div>
                `;
            } else {
                const recordsHtml = records.map(record => {
                    const statusClass = record.status === 'present' ? 'bg-green-100 text-green-800' :
                                       record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                       record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-gray-100 text-gray-800';
                    const statusText = record.status === 'present' ? '출석' :
                                      record.status === 'absent' ? '결석' :
                                      record.status === 'late' ? '지각' :
                                      record.status === 'excused' ? '조퇴' : '기타';
                    const icon = record.status === 'present' ? 'fa-check-circle' :
                                record.status === 'absent' ? 'fa-times-circle' :
                                record.status === 'late' ? 'fa-clock' : 'fa-door-open';

                    return `
                        <div class="flex items-center justify-between py-3 border-b last:border-b-0">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 rounded-full ${statusClass} flex items-center justify-center">
                                    <i class="fas ${icon}"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-800">${record.date || '날짜 없음'}</p>
                                    <p class="text-sm text-gray-500">${record.subject_name || '과목 정보 없음'}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
                                    ${statusText}
                                </span>
                                ${record.notes ? `<p class="text-xs text-gray-500 mt-1">${record.notes}</p>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                listSection.innerHTML = recordsHtml;
            }
        }

    } catch (error) {
        console.error('출석 데이터 로드 실패:', error);
        const listSection = document.getElementById('recent-attendance-list');
        if (listSection) {
            listSection.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                    <p>출석 데이터를 불러오는데 실패했습니다.</p>
                </div>
            `;
        }
    }
}

// ============================================
// 성적 페이지
// ============================================
async function showParentGrades(selectedStudentId = null) {
    const content = document.getElementById('parent-content');

    try {
        // 자녀 목록 가져오기
        const response = await axios.get(`/api/users/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const children = response.data.children || [];

        if (children.length === 0) {
            content.innerHTML = `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <i class="fas fa-user-friends text-gray-400 text-5xl mb-4"></i>
                    <p class="text-gray-600">등록된 자녀 정보가 없습니다.</p>
                </div>
            `;
            return;
        }

        const studentId = selectedStudentId || children[0].id;

        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                        성적 현황
                    </h2>
                    ${children.length > 1 ? `
                        <select id="student-selector-grades" class="form-select w-64">
                            ${children.map(child => `
                                <option value="${child.id}" ${child.id == studentId ? 'selected' : ''}>
                                    ${child.student_name || '이름 없음'}
                                </option>
                            `).join('')}
                        </select>
                    ` : ''}
                </div>

                <!-- 과목별 성적 -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">과목별 성적</h3>
                    <div id="grades-list">
                        <div class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p class="mt-4 text-gray-600">성적 정보를 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 자녀 선택 이벤트
        const selector = document.getElementById('student-selector-grades');
        if (selector) {
            selector.addEventListener('change', (e) => {
                showParentGrades(e.target.value);
            });
        }

        // 성적 데이터 로드
        await loadGradesData(studentId);

    } catch (error) {
        console.error('성적 페이지 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span class="text-red-700">성적 정보를 불러오는데 실패했습니다: ${error.message}</span>
            </div>
        `;
    }
}

async function loadGradesData(studentId) {
    try {
        const response = await axios.get(`/api/grades/student/${studentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const grades = response.data.grades || [];

        const listSection = document.getElementById('grades-list');
        if (!listSection) return;

        if (grades.length === 0) {
            listSection.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>등록된 성적이 없습니다.</p>
                </div>
            `;
            return;
        }

        // 과목별로 그룹화
        const gradesBySubject = {};
        grades.forEach(grade => {
            const subjectName = grade.subject_name || '과목 없음';
            if (!gradesBySubject[subjectName]) {
                gradesBySubject[subjectName] = [];
            }
            gradesBySubject[subjectName].push(grade);
        });

        const gradesHtml = Object.entries(gradesBySubject).map(([subjectName, subjectGrades]) => {
            // 평균 계산
            const scores = subjectGrades.filter(g => g.score != null).map(g => g.score);
            const average = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';

            const gradeItems = subjectGrades.map(grade => `
                <div class="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                        <span class="text-sm font-medium text-gray-700">${grade.type || '평가'}</span>
                        ${grade.date ? `<span class="text-xs text-gray-500 ml-2">${grade.date}</span>` : ''}
                    </div>
                    <div class="text-right">
                        <span class="text-lg font-bold text-purple-600">${grade.score != null ? grade.score : '-'}</span>
                        ${grade.max_score ? `<span class="text-sm text-gray-500"> / ${grade.max_score}</span>` : ''}
                    </div>
                </div>
            `).join('');

            return `
                <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-gray-800">${subjectName}</h4>
                        <div class="text-right">
                            <p class="text-2xl font-bold text-purple-600">${average}</p>
                            <p class="text-xs text-gray-500">평균</p>
                        </div>
                    </div>
                    <div class="space-y-2">
                        ${gradeItems}
                    </div>
                </div>
            `;
        }).join('');

        listSection.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${gradesHtml}
            </div>
        `;

    } catch (error) {
        console.error('성적 데이터 로드 실패:', error);
        const listSection = document.getElementById('grades-list');
        if (listSection) {
            listSection.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                    <p>성적 데이터를 불러오는데 실패했습니다.</p>
                </div>
            `;
        }
    }
}

// ============================================
// 일정 페이지
// ============================================
async function showParentSchedule() {
    const content = document.getElementById('parent-content');

    content.innerHTML = `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800">
                <i class="fas fa-calendar-alt text-orange-600 mr-2"></i>
                학사 일정
            </h2>

            <div class="bg-white rounded-lg shadow p-6">
                <div id="schedule-calendar">
                    <div class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <p class="mt-4 text-gray-600">일정을 불러오는 중...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 일정 데이터 로드
    await loadScheduleData();
}

async function loadScheduleData() {
    try {
        const response = await axios.get('/api/schedules', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const schedules = response.data.schedules || [];

        const calendarSection = document.getElementById('schedule-calendar');
        if (!calendarSection) return;

        if (schedules.length === 0) {
            calendarSection.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-calendar-times text-4xl mb-2"></i>
                    <p>등록된 일정이 없습니다.</p>
                </div>
            `;
            return;
        }

        // 날짜별로 그룹화
        const schedulesByDate = {};
        schedules.forEach(schedule => {
            const date = schedule.date || schedule.start_date;
            if (!date) return;

            if (!schedulesByDate[date]) {
                schedulesByDate[date] = [];
            }
            schedulesByDate[date].push(schedule);
        });

        // 날짜순 정렬
        const sortedDates = Object.keys(schedulesByDate).sort((a, b) => new Date(b) - new Date(a));

        const schedulesHtml = sortedDates.map(date => {
            const dateSchedules = schedulesByDate[date];
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });

            const items = dateSchedules.map(schedule => `
                <div class="flex items-start space-x-3 py-3 border-b last:border-b-0">
                    <div class="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${schedule.title || '제목 없음'}</h4>
                        ${schedule.description ? `<p class="text-sm text-gray-600 mt-1">${schedule.description}</p>` : ''}
                        ${schedule.location ? `<p class="text-xs text-gray-500 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${schedule.location}</p>` : ''}
                    </div>
                </div>
            `).join('');

            return `
                <div class="mb-6 last:mb-0">
                    <div class="flex items-center space-x-3 mb-3">
                        <div class="w-12 h-12 rounded-lg bg-orange-100 flex flex-col items-center justify-center">
                            <span class="text-xs text-orange-600">${dateObj.getMonth() + 1}월</span>
                            <span class="text-lg font-bold text-orange-600">${dateObj.getDate()}</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-800">${formattedDate}</h3>
                            <p class="text-xs text-gray-500">${dateSchedules.length}개 일정</p>
                        </div>
                    </div>
                    <div class="ml-14 bg-gray-50 rounded-lg p-4">
                        ${items}
                    </div>
                </div>
            `;
        }).join('');

        calendarSection.innerHTML = schedulesHtml || `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-calendar-times text-4xl mb-2"></i>
                <p>등록된 일정이 없습니다.</p>
            </div>
        `;

    } catch (error) {
        console.error('일정 데이터 로드 실패:', error);
        const calendarSection = document.getElementById('schedule-calendar');
        if (calendarSection) {
            calendarSection.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                    <p>일정 데이터를 불러오는데 실패했습니다.</p>
                </div>
            `;
        }
    }
}

// ============================================
// 상담 페이지
// ============================================
async function showParentCounseling() {
    const content = document.getElementById('parent-content');

    try {
        // 자녀 목록 가져오기
        const response = await axios.get(`/api/users/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const children = response.data.children || [];

        if (children.length === 0) {
            content.innerHTML = `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <i class="fas fa-user-friends text-gray-400 text-5xl mb-4"></i>
                    <p class="text-gray-600">등록된 자녀 정보가 없습니다.</p>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-comments text-red-600 mr-2"></i>
                    상담 내역
                </h2>

                <div class="bg-white rounded-lg shadow p-6">
                    <div id="counseling-list">
                        <div class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p class="mt-4 text-gray-600">상담 내역을 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 모든 자녀의 상담 내역 로드
        await loadCounselingData(children);

    } catch (error) {
        console.error('상담 페이지 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span class="text-red-700">상담 내역을 불러오는데 실패했습니다: ${error.message}</span>
            </div>
        `;
    }
}

async function loadCounselingData(children) {
    try {
        // 모든 자녀의 상담 기록 가져오기
        const allCounselings = [];

        for (const child of children) {
            try {
                const response = await axios.get(`/api/counseling/student/${child.id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                const counselings = response.data.counselings || [];
                counselings.forEach(counseling => {
                    counseling.student_name = child.student_name;
                    counseling.student_id = child.id;
                });

                allCounselings.push(...counselings);
            } catch (error) {
                console.error(`자녀 ${child.student_name}의 상담 기록 조회 실패:`, error);
            }
        }

        // 날짜순 정렬 (최신순)
        allCounselings.sort((a, b) => new Date(b.date) - new Date(a.date));

        const listSection = document.getElementById('counseling-list');
        if (!listSection) return;

        if (allCounselings.length === 0) {
            listSection.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>상담 내역이 없습니다.</p>
                </div>
            `;
            return;
        }

        const counselingsHtml = allCounselings.map(counseling => {
            const typeClass = counseling.type === 'academic' ? 'bg-blue-100 text-blue-800' :
                             counseling.type === 'behavioral' ? 'bg-yellow-100 text-yellow-800' :
                             counseling.type === 'career' ? 'bg-purple-100 text-purple-800' :
                             'bg-gray-100 text-gray-800';
            const typeText = counseling.type === 'academic' ? '학업' :
                            counseling.type === 'behavioral' ? '생활' :
                            counseling.type === 'career' ? '진로' :
                            counseling.type === 'parent' ? '학부모' :
                            '기타';

            return `
                <div class="border rounded-lg p-6 hover:shadow-md transition">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <i class="fas fa-comment-dots text-red-600"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">${counseling.title || '상담 제목 없음'}</h4>
                                <p class="text-sm text-gray-500">
                                    ${counseling.student_name} · ${counseling.date || '날짜 없음'}
                                </p>
                            </div>
                        </div>
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${typeClass}">
                            ${typeText}
                        </span>
                    </div>

                    ${counseling.content ? `
                        <div class="bg-gray-50 rounded p-4 mb-3">
                            <p class="text-sm text-gray-700 whitespace-pre-wrap">${counseling.content}</p>
                        </div>
                    ` : ''}

                    ${counseling.teacher_name ? `
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-user-tie mr-1"></i>
                            상담교사: ${counseling.teacher_name}
                        </p>
                    ` : ''}
                </div>
            `;
        }).join('');

        listSection.innerHTML = `
            <div class="space-y-4">
                ${counselingsHtml}
            </div>
        `;

    } catch (error) {
        console.error('상담 데이터 로드 실패:', error);
        const listSection = document.getElementById('counseling-list');
        if (listSection) {
            listSection.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                    <p>상담 데이터를 불러오는데 실패했습니다.</p>
                </div>
            `;
        }
    }
}
