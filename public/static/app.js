// 전역 변수
let currentUser = null;
let authToken = null;
let currentView = 'dashboard';

// 함수가 정의될 때까지 기다리는 헬퍼 함수
function waitForFunction(functionName, intervalMs = 50, maxAttempts = 20) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            if (typeof window[functionName] === 'function') {
                clearInterval(checkInterval);
                resolve();
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error(`${functionName} 함수를 찾을 수 없습니다.`));
                }
            }
        }, intervalMs);
    });
}

// 초기화 함수
async function initializeApp() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    // 중복 호출 방지
    if (window.isInitializing) {
        return;
    }
    window.isInitializing = true;
    
    if (savedToken && savedUser) {
        // 이미 로그인된 상태면 대시보드로
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        
        // 필요한 함수가 로드될 때까지 기다리기
        if (currentUser.role === 'student') {
            await waitForFunction('showStudentHome', 50, 20);
        } else if (typeof showPublicHome === 'function') {
            // public-home.js가 로드되었는지 확인
            await waitForFunction('showPublicHome', 50, 10);
        }
        
        showDashboard();
        
        // URL에서 페이지 확인하여 해당 페이지로 이동
        const pageFromURL = getPageFromURL();
        if (pageFromURL && pageFromURL !== 'dashboard') {
            // 약간의 지연을 두어 대시보드가 먼저 로드되도록 함
            setTimeout(() => {
                navigateToPage(pageFromURL, false); // URL은 이미 설정되어 있으므로 업데이트하지 않음
            }, 100);
        }
    } else {
        // 로그인 안 되어있으면 공개 홈페이지 표시
        // public-home.js가 로드될 때까지 기다리기
        await waitForFunction('showPublicHome', 50, 20);
        if (typeof showPublicHome === 'function') {
            showPublicHome();
            // showPublicHome 내부에서 URL 확인을 하므로 여기서는 추가 작업 불필요
        } else {
            // 함수가 없으면 기본 로그인 화면 표시
            document.getElementById('login-screen')?.classList.remove('hidden');
        }
    }
    
    setupEventListeners();
    window.isInitializing = false;
}

// 모든 스크립트가 로드된 후 초기화
window.addEventListener('load', () => {
    // 약간의 지연을 두어 모든 스크립트가 완전히 로드되도록 함
    setTimeout(initializeApp, 100);
});

// DOMContentLoaded에서도 실행 (빠른 응답을 위해)
document.addEventListener('DOMContentLoaded', () => {
    // 스크립트가 모두 로드되었는지 확인
    if (document.readyState === 'complete') {
        setTimeout(initializeApp, 100);
    }
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 폼
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 브라우저 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', (e) => {
        const page = e.state?.page || getPageFromURL();
        navigateToPage(page, false); // URL은 이미 변경되었으므로 업데이트하지 않음
    });
    
    // 해시 변경 처리 (직접 URL 입력 시)
    window.addEventListener('hashchange', () => {
        const page = getPageFromURL();
        navigateToPage(page, false);
    });
    
    // 사이드바 네비게이션 링크
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            e.preventDefault();
            const page = navLink.getAttribute('data-page');
            navigateToPage(page);
            
            // 활성화 상태 업데이트
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('bg-gray-100', 'text-gray-900');
                link.classList.add('text-gray-700');
            });
            navLink.classList.add('bg-gray-100', 'text-gray-900');
            navLink.classList.remove('text-gray-700');
        }
    });
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await axios.post('/api/auth/login', {
            username,
            password
        });
        
        currentUser = response.data.user;
        authToken = response.data.token;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 로그인 모달 닫기 (있으면)
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        
        // 역할별 대시보드로 이동 (initializeApp에서 이미 호출되었으므로 건너뛰기)
        if (!window.isInitializing) {
            showDashboard();
        }
    } catch (error) {
        const errorDiv = document.getElementById('login-error');
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = '로그인 실패: 아이디 또는 비밀번호를 확인하세요.';
        errorDiv.classList.remove('hidden');
    }
}

// 로그아웃 처리
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    authToken = null;
    
    // 공개 홈페이지로 돌아가기
    showPublicHome();
}

// 역할별 메인 화면 라우팅
async function showDashboard() {
    // 공개 홈페이지 숨기기 (있으면)
    const publicHome = document.getElementById('public-home');
    if (publicHome) {
        publicHome.style.display = 'none';
    }
    
    // 기존 로그인 화면 숨기기 (있으면)
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.classList.add('hidden');
    }
    
    // 역할에 따라 다른 화면으로 라우팅
    switch (currentUser.role) {
        case 'student':
            // student-home.js가 로드될 때까지 기다리기
            await waitForFunction('showStudentHome', 50, 20);
            if (typeof showStudentHome === 'function') {
                showStudentHome();
            } else {
                console.error('showStudentHome 함수를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            }
            break;
        case 'teacher':
            showTeacherDashboard();
            break;
        case 'admin':
        case 'super_admin':
            showAdminDashboard();
            break;
        case 'parent':
            showParentDashboard();
            break;
        default:
            showAdminDashboard();
    }
}

// 관리자 대시보드 표시 (기존 로직)
async function showAdminDashboard() {
    // currentUser가 없으면 localStorage에서 복원 시도
    if (!currentUser) {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('authToken');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
        if (savedToken) {
            authToken = savedToken;
        }
    }
    
    // currentUser가 여전히 없으면 에러
    if (!currentUser) {
        console.error('currentUser가 설정되지 않았습니다.');
        return;
    }
    
    // dashboard-screen이 없거나 구조가 손상되었으면 생성
    let dashboardScreen = document.getElementById('dashboard-screen');
    let sidebarNavCheck = document.getElementById('sidebar-nav');
    
    // dashboard-screen이 없거나, sidebar-nav가 없으면 다시 생성
    const needsCreation = !dashboardScreen || !sidebarNavCheck;
    
    if (needsCreation) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- 대시보드 화면 -->
            <div id="dashboard-screen">
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
                            <nav id="sidebar-nav" class="space-y-1">
                                <!-- 동적으로 메뉴 로드 -->
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
        `;
        
        // 로그아웃 버튼 이벤트 재설정
        document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
        
        dashboardScreen = document.getElementById('dashboard-screen');
    } else {
        dashboardScreen.classList.remove('hidden');
    }
    
    const roleNames = {
        'super_admin': '최고관리자',
        'admin': '관리자',
        'teacher': '교사',
        'student': '학생',
        'parent': '학부모'
    };
    
    // DOM이 완전히 렌더링될 때까지 대기 (새로 생성된 경우)
    if (needsCreation) {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = currentUser.name + ' (' + roleNames[currentUser.role] + ')';
    } else {
        console.error('user-info 요소를 찾을 수 없습니다.');
    }
    
    // 로딩 중 표시
    const sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav) {
        sidebarNav.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
            </div>
        `;
    } else {
        console.error('sidebar-nav 요소를 찾을 수 없습니다 (로딩 스피너)');
    }
    
    // 사이드바 메뉴 로드
    await loadSidebarMenu();
    
    // 대시보드 페이지로 이동
    navigateToPage('dashboard');
}

// 교사 대시보드 표시 (자기 반/과목만)
async function showTeacherDashboard() {
    // 관리자 대시보드와 동일한 구조 사용
    // loadSidebarMenu()에서 이미 교사 권한을 체크하여 필터링된 메뉴를 로드함
    await showAdminDashboard();
    
    // 교사 정보는 loadSidebarMenu()에서 이미 가져왔으므로
    // 여기서는 추가 작업 없음 (필요시 여기서도 확인 가능)
}

// 교사 필터링 헬퍼 함수
function getTeacherFilterParams() {
    if (currentUser.role === 'teacher' && window.currentTeacher) {
        return { teacher_id: window.currentTeacher.id };
    }
    return {};
}

// 교사용 메뉴 필터링
async function filterTeacherMenu(teacherId, permissions) {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;
    
    // 모든 메뉴 항목 가져오기
    const menuItems = sidebarNav.querySelectorAll('.nav-link');
    
    menuItems.forEach(item => {
        const page = item.getAttribute('data-page');
        let shouldShow = false;
        
        // 대시보드는 항상 표시
        if (page === 'dashboard') {
            shouldShow = true;
        }
        // 담임 반 관리 권한이 있으면 반 관리 표시
        else if (page === 'classes' && permissions.includes('manage_own_class')) {
            shouldShow = true;
        }
        // 과목 관리 권한이 있으면 과목 관리 표시
        else if (page === 'subjects' && permissions.includes('manage_own_courses')) {
            shouldShow = true;
        }
        // 출석 관리 권한이 있으면 출석 관리 표시
        else if (page === 'attendance' && permissions.includes('manage_attendance')) {
            shouldShow = true;
        }
        // 성적 관리 권한이 있으면 성적 관리 표시
        else if (page === 'grades' && permissions.includes('manage_grades')) {
            shouldShow = true;
        }
        // 전체 학생 관리 권한이 있으면 학생 관리 표시
        else if (page === 'students' && permissions.includes('manage_all_students')) {
            shouldShow = true;
        }
        // 성적표 출력, 생활기록부는 항상 표시 (자기 반 학생만)
        else if (page === 'reports' || page === 'records') {
            shouldShow = true;
        }
        // 설정은 관리자만 (교사는 절대 접근 불가)
        else if (page === 'settings') {
            shouldShow = false; // 교사는 항상 숨김
        }
        // 담임 배정은 관리자만
        else if (page === 'homeroom' && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
            shouldShow = true;
        }
        
        if (!shouldShow) {
            item.style.display = 'none';
        }
    });
}

// 부모 대시보드 표시 (자녀 정보만)
async function showParentDashboard() {
    // 부모는 기본 대시보드 사용 (제한된 메뉴)
    await showAdminDashboard();
    
    // TODO: 부모용 메뉴 구성
    // - 자녀의 출석/성적 조회만
}

// 사이드바 메뉴 동적 로드 (모듈 설정 기반)
async function loadSidebarMenu() {
    try {
        // currentUser가 없으면 localStorage에서 복원 시도
        if (!currentUser) {
            const savedUser = localStorage.getItem('currentUser');
            const savedToken = localStorage.getItem('authToken');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
            }
            if (savedToken) {
                authToken = savedToken;
            }
        }
        
        // currentUser가 여전히 없으면 에러
        if (!currentUser) {
            console.error('loadSidebarMenu: currentUser가 설정되지 않았습니다.');
            console.error('localStorage authToken:', localStorage.getItem('authToken'));
            console.error('localStorage currentUser:', localStorage.getItem('currentUser'));
            // 폴백 메뉴라도 표시
            showDefaultSidebarMenu();
            return;
        }
        
        // 교사인 경우 권한 정보 먼저 가져오기 (완료될 때까지 대기)
        let teacherPermissions = [];
        let isTeacher = false;
        let teacherId = null;
        
        // currentUser가 확실히 설정되어 있고 교사인지 확인
        if (currentUser && currentUser.role === 'teacher') {
            isTeacher = true;
            try {
                const userResponse = await axios.get(`/api/users/${currentUser.id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                
                // API 응답 구조: { user: {...}, teacher: {...} }
                const teacher = userResponse.data.teacher;
                if (teacher) {
                    teacherId = teacher.id;
                    const permissionsResponse = await axios.get(`/api/teacher-permissions?teacher_id=${teacher.id}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    teacherPermissions = (permissionsResponse.data.permissions || []).map(p => p.permission_type);
                    
                    // 전역 변수에 교사 정보 저장
                    window.currentTeacher = {
                        id: teacher.id,
                        permissions: teacherPermissions
                    };
                }
            } catch (error) {
                console.error('교사 정보 로드 실패:', error);
                console.error('에러 상세:', error.response?.data);
                // 에러가 발생해도 교사는 기본 메뉴를 볼 수 있어야 함
            }
        }
        
        // 활성화된 모듈만 조회
        const response = await axios.get('/api/module-settings/enabled', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const modules = response.data.modules || [];
        
        // 모듈명과 페이지명 매핑
        const modulePageMap = {
            'students': 'students',
            'subjects': 'subjects',
            'classes': 'classes',
            'attendance': 'attendance',
            'grades': 'grades',
            'awards': 'awards',
            'reading': 'reading',
            'volunteer': 'volunteer',
            'clubs': 'clubs',
            'counseling': 'counseling'
        };
        
        const sidebarNav = document.getElementById('sidebar-nav');
        if (!sidebarNav) {
            console.error('sidebar-nav 요소를 찾을 수 없습니다.');
            return;
        }
        let menuHTML = `
            <!-- 고정 메뉴: 대시보드 -->
            <a href="#" data-page="dashboard" class="nav-link flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition">
                <i class="fas fa-home w-5 mr-3"></i>
                <span>대시보드</span>
            </a>
        `;
        
        // 관리자 전용 모듈 목록 (교사에게는 절대 표시 안 함)
        const adminOnlyModules = ['users', 'user-management', 'admin', 'settings', 'homeroom'];
        
        // 활성화된 모듈 메뉴 추가 (교사인 경우 필터링)
        modules.forEach(module => {
            const pageName = modulePageMap[module.module_name];
            
            // 교사인 경우 관리자 전용 모듈은 무조건 제외
            if (isTeacher && (adminOnlyModules.includes(module.module_name) || adminOnlyModules.includes(pageName) || pageName === 'settings' || pageName === 'homeroom')) {
                return; // 이 모듈은 건너뛰기
            }
            
            if (pageName) {
                let shouldShow = true;
                
                // 교사인 경우 권한 체크
                if (isTeacher) {
                    // 반 관리(classes)와 과목 관리(subjects)는 교사에게 기본적으로 항상 표시
                    if (pageName === 'classes' || pageName === 'subjects') {
                        shouldShow = true;
                    }
                    // 다른 메뉴들은 권한 체크
                    else {
                        shouldShow = false;
                        
                        if (pageName === 'attendance' && teacherPermissions.includes('manage_attendance')) {
                            shouldShow = true;
                        } else if (pageName === 'grades' && teacherPermissions.includes('manage_grades')) {
                            shouldShow = true;
                        } else if (pageName === 'students' && teacherPermissions.includes('manage_all_students')) {
                            shouldShow = true;
                        }
                        // 기타 모듈(awards, reading, volunteer, clubs, counseling)은 권한이 없으면 숨김
                    }
                }
                
                if (shouldShow) {
                    menuHTML += `
                        <a href="#" data-page="${pageName}" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                            <i class="fas ${module.icon} w-5 mr-3"></i>
                            <span>${module.module_label}</span>
                        </a>
                    `;
                }
            }
            // modulePageMap에 없는 모듈도 교사인 경우 제외 (관리자 전용일 가능성)
            else if (isTeacher) {
                // 모듈명이나 라벨에 "관리자", "사용자", "설정", "담임" 등이 포함되어 있으면 제외
                const moduleNameLower = (module.module_name || '').toLowerCase();
                const moduleLabelLower = (module.module_label || '').toLowerCase();
                if (moduleNameLower.includes('admin') || moduleNameLower.includes('user') || 
                    moduleNameLower.includes('setting') || moduleNameLower.includes('homeroom') ||
                    moduleLabelLower.includes('관리자') || moduleLabelLower.includes('사용자') || 
                    moduleLabelLower.includes('설정') || moduleLabelLower.includes('담임')) {
                    return; // 이 모듈은 건너뛰기
                }
            }
        });
        
        // 구분선 및 관리 메뉴
        menuHTML += `<div class="border-t border-gray-700 my-4"></div>`;
        
        // 관리자 전용 메뉴 (담임 배정, 사용자 관리)
        if (!isTeacher) {
            menuHTML += `
                <a href="#" data-page="homeroom" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                    <i class="fas fa-user-tie w-5 mr-3"></i>
                    <span>담임 배정</span>
                </a>
                <a href="#" data-page="users" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                    <i class="fas fa-users w-5 mr-3"></i>
                    <span>사용자 관리</span>
                </a>
            `;
        }
        
        // 성적표 출력, 생활기록부는 항상 표시
        menuHTML += `
            <a href="#" data-page="reports" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-print w-5 mr-3"></i>
                <span>성적표 출력</span>
            </a>
            <a href="#" data-page="records" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-file-alt w-5 mr-3"></i>
                <span>생활기록부</span>
            </a>
        `;
        
        // 설정은 관리자만 (교사는 절대 표시 안 함)
        if (!isTeacher) {
            menuHTML += `
                <a href="#" data-page="settings" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                    <i class="fas fa-cog w-5 mr-3"></i>
                    <span>설정</span>
                </a>
            `;
        }
        
        // 최고 관리자 전용: 홈페이지 관리
        if (currentUser && currentUser.role === 'super_admin') {
            menuHTML += `
                <a href="#" data-page="homepage" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                    <i class="fas fa-globe w-5 mr-3"></i>
                    <span>홈페이지 관리</span>
                </a>
            `;
        }
        
        sidebarNav.innerHTML = menuHTML;
    } catch (error) {
        console.error('사이드바 메뉴 로드 실패:', error);
        
        // 에러 발생 시에도 역할 기반 기본 메뉴 표시
        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) {
            const isTeacher = currentUser && currentUser.role === 'teacher';
            const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
            
            
            // 역할에 맞는 기본 메뉴 표시
            if (isTeacher) {
                showDefaultTeacherMenu(sidebarNav);
            } else if (isAdmin) {
                showDefaultAdminMenu(sidebarNav);
            } else {
                showDefaultSidebarMenu();
            }
        }
    }
}

// 교사용 기본 메뉴
function showDefaultTeacherMenu(sidebarNav) {
    sidebarNav.innerHTML = `
        <a href="#" data-page="dashboard" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-home w-5 mr-3"></i>
            <span>대시보드</span>
        </a>
        <a href="#" data-page="classes" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-chalkboard-teacher w-5 mr-3"></i>
            <span>반 관리</span>
        </a>
        <a href="#" data-page="subjects" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-book w-5 mr-3"></i>
            <span>과목 관리</span>
        </a>
        <div class="border-t border-gray-200 my-4"></div>
        <a href="#" data-page="reports" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-print w-5 mr-3"></i>
            <span>성적표 출력</span>
        </a>
        <a href="#" data-page="records" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-file-alt w-5 mr-3"></i>
            <span>생활기록부</span>
        </a>
    `;
}

// 관리자용 기본 메뉴
function showDefaultAdminMenu(sidebarNav) {
    const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
    
    sidebarNav.innerHTML = `
        <a href="#" data-page="dashboard" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-home w-5 mr-3"></i>
            <span>대시보드</span>
        </a>
        <a href="#" data-page="students" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-user-graduate w-5 mr-3"></i>
            <span>학생 관리</span>
        </a>
        <a href="#" data-page="classes" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-chalkboard-teacher w-5 mr-3"></i>
            <span>반 관리</span>
        </a>
        <a href="#" data-page="subjects" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-book w-5 mr-3"></i>
            <span>과목 관리</span>
        </a>
        <a href="#" data-page="attendance" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-clipboard-check w-5 mr-3"></i>
            <span>출석 관리</span>
        </a>
        <a href="#" data-page="grades" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-chart-line w-5 mr-3"></i>
            <span>성적 관리</span>
        </a>
        <div class="border-t border-gray-200 my-4"></div>
        <a href="#" data-page="homeroom" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-user-tie w-5 mr-3"></i>
            <span>담임 배정</span>
        </a>
        <a href="#" data-page="reports" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-print w-5 mr-3"></i>
            <span>성적표 출력</span>
        </a>
        <a href="#" data-page="records" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-file-alt w-5 mr-3"></i>
            <span>생활기록부</span>
        </a>
        <a href="#" data-page="settings" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-cog w-5 mr-3"></i>
            <span>설정</span>
        </a>
        ${isSuperAdmin ? `
        <a href="#" data-page="homepage" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-globe w-5 mr-3"></i>
            <span>홈페이지 관리</span>
        </a>
        ` : ''}
    `;
}

// 기본 사이드바 메뉴 (폴백)
function showDefaultSidebarMenu() {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;
    
    const isTeacher = currentUser && currentUser.role === 'teacher';
    
    let menuHTML = `
        <a href="#" data-page="dashboard" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
            <i class="fas fa-home w-5 mr-3"></i>
            <span>대시보드</span>
        </a>
    `;
    
    // 교사인 경우 기본 메뉴만 표시
    if (isTeacher) {
        menuHTML += `
            <a href="#" data-page="classes" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-chalkboard-teacher w-5 mr-3"></i>
                <span>반 관리</span>
            </a>
            <a href="#" data-page="subjects" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-book w-5 mr-3"></i>
                <span>과목 관리</span>
            </a>
            <div class="border-t border-gray-200 my-4"></div>
            <a href="#" data-page="reports" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-print w-5 mr-3"></i>
                <span>성적표 출력</span>
            </a>
            <a href="#" data-page="records" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-file-alt w-5 mr-3"></i>
                <span>생활기록부</span>
            </a>
        `;
    } else {
        // 관리자용 기본 메뉴
        const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
        menuHTML += `
            <a href="#" data-page="students" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-user-graduate w-5 mr-3"></i>
                <span>학생 관리</span>
            </a>
            <a href="#" data-page="attendance" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-clipboard-check w-5 mr-3"></i>
                <span>출석 관리</span>
            </a>
            <a href="#" data-page="grades" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-chart-line w-5 mr-3"></i>
                <span>성적 관리</span>
            </a>
            <div class="border-t border-gray-200 my-4"></div>
            <a href="#" data-page="settings" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-cog w-5 mr-3"></i>
                <span>설정</span>
            </a>
            ${isSuperAdmin ? `
            <a href="#" data-page="homepage" class="nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition">
                <i class="fas fa-globe w-5 mr-3"></i>
                <span>홈페이지 관리</span>
            </a>
            ` : ''}
        `;
    }
    
    sidebarNav.innerHTML = menuHTML;
}

// 현재 학기 로드
async function loadCurrentSemester() {
    try {
        const response = await axios.get('/api/semesters/current', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        document.getElementById('current-semester').textContent = 
            response.data.semester.name;
    } catch (error) {
        console.error('Failed to load current semester:', error);
    }
}

// 대시보드 통계 로드
async function loadDashboardStats() {
    try {
        // 학생 수 조회
        const studentsRes = await axios.get('/api/students?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const statStudents = document.getElementById('stat-students');
        const statStudentsChange = document.getElementById('stat-students-change');
        if (statStudents) {
            const studentCount = studentsRes.data.students.length;
            statStudents.textContent = studentCount;
            if (statStudentsChange) {
                statStudentsChange.textContent = '이번 학기';
            }
        }
        
        // 교사 수 조회
        const teachersRes = await axios.get('/api/users?role=teacher&limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const statTeachers = document.getElementById('stat-teachers');
        if (statTeachers) {
            statTeachers.textContent = teachersRes.data.users.length;
        }
        
        // 현재 학기 조회
        const semesterRes = await axios.get('/api/semesters/current', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const statSemester = document.getElementById('stat-semester');
        if (statSemester) {
            const semester = semesterRes.data.semester;
            statSemester.textContent = semester.name;
        }
        
        // 반 수 조회
        const classesRes = await axios.get('/api/classes', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const statClasses = document.getElementById('stat-classes');
        if (statClasses) {
            statClasses.textContent = classesRes.data.classes.length;
        }
        
        // 동아리 수 조회
        const clubsRes = await axios.get('/api/clubs', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const statClubs = document.getElementById('stat-clubs');
        if (statClubs) {
            statClubs.textContent = clubsRes.data.clubs.length;
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// 오늘의 출석 현황 로드
async function loadTodayAttendanceStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`/api/attendance/by-date?date=${today}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const attendance = response.data.attendance || [];
        const stats = {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
        };
        
        attendance.forEach(record => {
            stats.total++;
            if (record.status === 'present') stats.present++;
            else if (record.status === 'absent') stats.absent++;
            else if (record.status === 'late') stats.late++;
            else if (record.status === 'excused') stats.excused++;
        });
        
        const container = document.getElementById('today-attendance-stats');
        if (container) {
            if (stats.total === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-clipboard text-4xl text-gray-300 mb-3"></i>
                        <p class="text-gray-600 text-sm">오늘 출석 기록이 없습니다</p>
                        <button onclick="navigateToPage('attendance')" class="mt-3 text-sm text-blue-600 hover:text-blue-800">
                            출석 체크하러 가기 →
                        </button>
                    </div>
                `;
            } else {
                const attendanceRate = Math.round((stats.present / stats.total) * 100);
                container.innerHTML = `
                    <div class="text-center mb-4">
                        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white mb-3">
                            <span class="text-3xl font-bold">${attendanceRate}%</span>
                        </div>
                        <p class="text-sm text-gray-600">출석률</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-green-50 rounded-lg p-3 text-center">
                            <div class="flex items-center justify-center mb-1">
                                <i class="fas fa-check-circle text-green-600 mr-1"></i>
                                <span class="text-lg font-bold text-green-700">${stats.present}</span>
                            </div>
                            <p class="text-xs text-gray-600">출석</p>
                        </div>
                        <div class="bg-red-50 rounded-lg p-3 text-center">
                            <div class="flex items-center justify-center mb-1">
                                <i class="fas fa-times-circle text-red-600 mr-1"></i>
                                <span class="text-lg font-bold text-red-700">${stats.absent}</span>
                            </div>
                            <p class="text-xs text-gray-600">결석</p>
                        </div>
                        <div class="bg-yellow-50 rounded-lg p-3 text-center">
                            <div class="flex items-center justify-center mb-1">
                                <i class="fas fa-clock text-yellow-600 mr-1"></i>
                                <span class="text-lg font-bold text-yellow-700">${stats.late}</span>
                            </div>
                            <p class="text-xs text-gray-600">지각</p>
                        </div>
                        <div class="bg-blue-50 rounded-lg p-3 text-center">
                            <div class="flex items-center justify-center mb-1">
                                <i class="fas fa-info-circle text-blue-600 mr-1"></i>
                                <span class="text-lg font-bold text-blue-700">${stats.excused}</span>
                            </div>
                            <p class="text-xs text-gray-600">인정결석</p>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to load today attendance stats:', error);
        const container = document.getElementById('today-attendance-stats');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p class="text-sm">출석 현황을 불러올 수 없습니다</p>
                </div>
            `;
        }
    }
}

// 학년별 학생 분포 로드
async function loadGradeDistribution() {
    try {
        const response = await axios.get('/api/students?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const students = response.data.students || [];
        const gradeStats = { 1: 0, 2: 0, 3: 0 };
        
        students.forEach(student => {
            if (student.grade >= 1 && student.grade <= 3) {
                gradeStats[student.grade]++;
            }
        });
        
        const total = gradeStats[1] + gradeStats[2] + gradeStats[3];
        const container = document.getElementById('grade-distribution');
        
        if (container) {
            if (total === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-users text-4xl text-gray-300 mb-3"></i>
                        <p class="text-gray-600 text-sm">등록된 학생이 없습니다</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    ${[1, 2, 3].map(grade => {
                        const count = gradeStats[grade];
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        const colors = {
                            1: { bg: 'bg-blue-500', light: 'bg-blue-100' },
                            2: { bg: 'bg-green-500', light: 'bg-green-100' },
                            3: { bg: 'bg-purple-500', light: 'bg-purple-100' }
                        };
                        return `
                            <div class="flex items-center">
                                <div class="w-16 text-sm font-semibold text-gray-700">${grade}학년</div>
                                <div class="flex-1 mx-3">
                                    <div class="w-full ${colors[grade].light} rounded-full h-4 overflow-hidden">
                                        <div class="${colors[grade].bg} h-full rounded-full transition-all duration-500" 
                                             style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                                <div class="w-20 text-right">
                                    <span class="text-lg font-bold text-gray-800">${count}</span>
                                    <span class="text-xs text-gray-500 ml-1">(${percentage}%)</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">전체</span>
                            <span class="text-xl font-bold text-gray-800">${total}명</span>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to load grade distribution:', error);
        const container = document.getElementById('grade-distribution');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p class="text-sm">학년별 분포를 불러올 수 없습니다</p>
                </div>
            `;
        }
    }
}

// URL에서 페이지 추출
function getPageFromURL() {
    const hash = window.location.hash.slice(1); // # 제거
    if (hash) {
        return hash;
    }
    const path = window.location.pathname;
    if (path && path !== '/' && path !== '/index.html') {
        return path.replace(/^\//, '').replace(/\.html$/, '');
    }
    return 'dashboard';
}

// 페이지 네비게이션
function navigateToPage(page, updateURL = true) {
    currentView = page;
    const contentArea = document.getElementById('main-content');
    
    // main-content가 없으면 에러
    if (!contentArea) {
        console.error('main-content 요소를 찾을 수 없습니다. dashboard-screen이 생성되었는지 확인하세요.');
        return;
    }
    
    // URL 업데이트
    if (updateURL) {
        const newURL = `#${page}`;
        if (window.location.hash !== newURL) {
            window.history.pushState({ page }, '', newURL);
        }
    }
    
    // 스크롤 최상단으로
    window.scrollTo(0, 0);
    
    switch(page) {
        case 'dashboard':
            showDashboardPage(contentArea);
            break;
        case 'students':
            showStudentManagement(contentArea);
            break;
        case 'subjects':
            showSubjectManagement(contentArea);
            break;
        case 'courses':
            showCourseManagement(contentArea);
            break;
        case 'classes':
            showClassManagement(contentArea);
            break;
        case 'attendance':
            showAttendanceManagement(contentArea);
            break;
        case 'grades':
            showGradeManagement(contentArea);
            break;
        case 'awards':
            showAwardsManagement(contentArea);
            break;
        case 'reading':
            showReadingManagement(contentArea);
            break;
        case 'volunteer':
            showVolunteerManagement(contentArea);
            break;
        case 'volunteer-add':
            showVolunteerAddPage(contentArea);
            break;
        case 'volunteer-edit':
            showVolunteerEditPage(contentArea);
            break;
        case 'awards-add':
            showAwardAddPage(contentArea);
            break;
        case 'awards-edit':
            showAwardEditPage(contentArea);
            break;
        case 'reading-add':
            showReadingAddPage(contentArea);
            break;
        case 'reading-edit':
            showReadingEditPage(contentArea);
            break;
        case 'counseling-add':
            showCounselingAddPage(contentArea);
            break;
        case 'counseling-edit':
            showCounselingEditPage(contentArea);
            break;
        case 'class-add':
            showClassAddPage(contentArea);
            break;
        case 'users':
            showUserManagement(contentArea);
            break;
        case 'user-add':
            showUserAddPage(contentArea);
            break;
        case 'user-edit':
            showUserEditPage(contentArea);
            break;
        case 'subjects':
            showSubjectManagement(contentArea);
            break;
        case 'subjects-add':
            // 과목 추가 페이지 표시
            if (typeof showSubjectAddPage === 'function') {
                showSubjectAddPage(contentArea);
            } else {
                alert('과목 추가 기능을 불러올 수 없습니다.');
                navigateToPage('subjects');
            }
            break;
        case 'clubs':
            showClubManagement(contentArea);
            break;
        case 'counseling':
            showCounselingManagement(contentArea);
            break;
        case 'homeroom':
            showHomeroomAssignmentManagement();
            break;
        case 'reports':
            showReportsPage(contentArea);
            break;
        case 'records':
            showRecordsPage(contentArea);
            break;
        case 'settings':
            // 관리자만 접근 가능
            if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
                showSystemSettings();
            } else {
                alert('시스템 설정은 관리자만 접근할 수 있습니다.');
                navigateToPage('dashboard');
            }
            break;
        case 'homepage':
        case 'homepage-management':
            // 최고 관리자만 접근 가능
            if (currentUser.role === 'super_admin') {
                // 함수가 로드될 때까지 대기
                if (typeof showHomepageManagement === 'function') {
                    showHomepageManagement(contentArea);
                } else {
                    // 스크립트가 아직 로드되지 않았을 수 있으므로 잠시 후 재시도
                    console.warn('showHomepageManagement 함수를 찾을 수 없습니다. 스크립트 로드를 기다립니다...');
                    contentArea.innerHTML = `
                        <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                            <p>홈페이지 관리 기능을 로드하는 중입니다...</p>
                        </div>
                    `;
                    // 최대 3초 동안 재시도
                    let retryCount = 0;
                    const checkFunction = setInterval(() => {
                        retryCount++;
                        if (typeof showHomepageManagement === 'function') {
                            clearInterval(checkFunction);
                            showHomepageManagement(contentArea);
                        } else if (retryCount >= 30) {
                            clearInterval(checkFunction);
                            contentArea.innerHTML = `
                                <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                                    <p>홈페이지 관리 기능을 불러올 수 없습니다. 페이지를 새로고침해주세요.</p>
                                    <p class="text-sm mt-2">오류: showHomepageManagement 함수가 정의되지 않았습니다.</p>
                                </div>
                            `;
                        }
                    }, 100);
                }
            } else {
                alert('홈페이지 관리는 최고 관리자만 접근할 수 있습니다.');
                navigateToPage('dashboard');
            }
            break;
        default:
            showDashboardPage(contentArea);
    }
}

// 대시보드 페이지
function showDashboardPage(container) {
    // 교사인 경우 교사용 대시보드 표시
    if (currentUser && currentUser.role === 'teacher') {
        showTeacherDashboardPage(container);
        return;
    }
    
    // 관리자용 대시보드
    container.innerHTML = `
        <div class="space-y-6">
            <!-- 환영 메시지 -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">환영합니다, <span id="welcome-user-name">-</span>님 👋</h1>
                        <p class="text-blue-100">오늘도 학생들과 함께 멋진 하루를 만들어가세요</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-blue-100">현재 학기</p>
                        <p class="text-2xl font-bold" id="stat-semester">-</p>
                    </div>
                </div>
            </div>
            
            <!-- 주요 통계 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- 전체 학생 -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-3">
                            <i class="fas fa-user-graduate text-2xl text-blue-600"></i>
                        </div>
                        <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">전체</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium mb-1">전체 학생</h3>
                    <p class="text-3xl font-bold text-gray-800" id="stat-students">-</p>
                    <p class="text-xs text-gray-500 mt-2">
                        <i class="fas fa-arrow-up text-green-500"></i> 
                        <span id="stat-students-change">-</span>
                    </p>
                </div>
                
                <!-- 교사 -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-100 rounded-full p-3">
                            <i class="fas fa-chalkboard-teacher text-2xl text-green-600"></i>
                        </div>
                        <span class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">교직원</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium mb-1">교사</h3>
                    <p class="text-3xl font-bold text-gray-800" id="stat-teachers">-</p>
                    <p class="text-xs text-gray-500 mt-2">활동 중인 교사</p>
                </div>
                
                <!-- 반 -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-3">
                            <i class="fas fa-door-open text-2xl text-purple-600"></i>
                        </div>
                        <span class="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">학급</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium mb-1">전체 반</h3>
                    <p class="text-3xl font-bold text-gray-800" id="stat-classes">-</p>
                    <p class="text-xs text-gray-500 mt-2">현재 학기 기준</p>
                </div>
                
                <!-- 동아리 -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-pink-100 rounded-full p-3">
                            <i class="fas fa-users text-2xl text-pink-600"></i>
                        </div>
                        <span class="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded-full">활동</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium mb-1">동아리</h3>
                    <p class="text-3xl font-bold text-gray-800" id="stat-clubs">-</p>
                    <p class="text-xs text-gray-500 mt-2">운영 중인 동아리</p>
                </div>
            </div>
            
            <!-- 오늘의 출석 현황과 최근 활동 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 오늘의 출석 현황 -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-calendar-check text-blue-600 mr-2"></i>
                            오늘의 출석 현황
                        </h2>
                        <button onclick="navigateToPage('attendance')" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            자세히 보기 <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <div id="today-attendance-stats" class="space-y-4">
                        <div class="text-center py-8">
                            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                        </div>
                    </div>
                </div>
                
                <!-- 학년별 학생 분포 -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-chart-pie text-purple-600 mr-2"></i>
                            학년별 학생 분포
                        </h2>
                        <button onclick="navigateToPage('students')" class="text-sm text-purple-600 hover:text-purple-800 font-medium">
                            자세히 보기 <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <div id="grade-distribution" class="space-y-3">
                        <div class="text-center py-8">
                            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 빠른 작업 -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-bolt text-yellow-600 mr-2"></i>
                    빠른 작업
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <button onclick="navigateToPage('students')" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition group">
                        <div class="bg-blue-100 rounded-full p-3 mb-2 group-hover:bg-blue-200 transition">
                            <i class="fas fa-user-plus text-xl text-blue-600"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">학생 등록</span>
                    </button>
                    
                    <button onclick="navigateToPage('attendance')" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-green-50 transition group">
                        <div class="bg-green-100 rounded-full p-3 mb-2 group-hover:bg-green-200 transition">
                            <i class="fas fa-clipboard-check text-xl text-green-600"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">출석 체크</span>
                    </button>
                    
                    <button onclick="navigateToPage('grades')" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition group">
                        <div class="bg-purple-100 rounded-full p-3 mb-2 group-hover:bg-purple-200 transition">
                            <i class="fas fa-edit text-xl text-purple-600"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">성적 입력</span>
                    </button>
                    
                    <button onclick="navigateToPage('classes')" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-yellow-50 transition group">
                        <div class="bg-yellow-100 rounded-full p-3 mb-2 group-hover:bg-yellow-200 transition">
                            <i class="fas fa-door-open text-xl text-yellow-600"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">반 관리</span>
                    </button>
                    
                    <button onclick="navigateToPage('counseling')" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-pink-50 transition group">
                        <div class="bg-pink-100 rounded-full p-3 mb-2 group-hover:bg-pink-200 transition">
                            <i class="fas fa-comments text-xl text-pink-600"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">상담 기록</span>
                    </button>
                    
                    <button onclick="navigateToPage('reports')" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-indigo-50 transition group">
                        <div class="bg-indigo-100 rounded-full p-3 mb-2 group-hover:bg-indigo-200 transition">
                            <i class="fas fa-print text-xl text-indigo-600"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">성적표</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 사용자 이름 표시
    if (currentUser) {
        document.getElementById('welcome-user-name').textContent = currentUser.name;
    }
    
    // 통계 로드
    loadDashboardStats();
    loadTodayAttendanceStats();
    loadGradeDistribution();
}

// 교사 전용 대시보드 페이지
async function showTeacherDashboardPage(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- 환영 메시지 -->
            <div class="rounded-2xl shadow-xl p-8 text-white" style="background: linear-gradient(to right, #16a34a, #2563eb);">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">환영합니다, ${currentUser.name} 선생님 👋</h1>
                        <p class="text-white opacity-90">오늘도 학생들과 함께 멋진 하루를 만들어가세요</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-white opacity-80">현재 학기</p>
                        <p class="text-2xl font-bold" id="teacher-stat-semester">-</p>
                    </div>
                </div>
            </div>
            
            <!-- 담당 반 정보 -->
            <div id="teacher-homeroom-section">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                </div>
            </div>
            
            <!-- 담당 과목 및 출석/성적 빠른 링크 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 담당 과목 목록 -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-book text-purple-600 mr-2"></i>
                        담당 과목
                    </h2>
                    <div id="teacher-courses-list" class="space-y-3">
                        <div class="text-center py-8">
                            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                        </div>
                    </div>
                </div>
                
                <!-- 빠른 작업 -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-bolt text-yellow-600 mr-2"></i>
                        빠른 작업
                    </h2>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="navigateToPage('attendance')" 
                                class="flex flex-col items-center p-4 rounded-lg hover:bg-green-50 transition group border-2 border-gray-100">
                            <div class="bg-green-100 rounded-full p-3 mb-2 group-hover:bg-green-200 transition">
                                <i class="fas fa-clipboard-check text-2xl text-green-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-700">출석 입력</span>
                        </button>
                        
                        <button onclick="navigateToPage('grades')" 
                                class="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition group border-2 border-gray-100">
                            <div class="bg-purple-100 rounded-full p-3 mb-2 group-hover:bg-purple-200 transition">
                                <i class="fas fa-edit text-2xl text-purple-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-700">성적 입력</span>
                        </button>
                        
                        <button onclick="navigateToPage('classes')" 
                                class="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition group border-2 border-gray-100">
                            <div class="bg-blue-100 rounded-full p-3 mb-2 group-hover:bg-blue-200 transition">
                                <i class="fas fa-door-open text-2xl text-blue-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-700">반 관리</span>
                        </button>
                        
                        <button onclick="navigateToPage('counseling')" 
                                class="flex flex-col items-center p-4 rounded-lg hover:bg-pink-50 transition group border-2 border-gray-100">
                            <div class="bg-pink-100 rounded-full p-3 mb-2 group-hover:bg-pink-200 transition">
                                <i class="fas fa-comments text-2xl text-pink-600"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-700">상담 기록</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 오늘의 출석 현황 -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-calendar-check text-blue-600 mr-2"></i>
                        오늘의 출석 현황
                    </h2>
                    <button onclick="navigateToPage('attendance')" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        자세히 보기 <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
                <div id="teacher-attendance-stats" class="space-y-4">
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 데이터 로드
    loadTeacherDashboardData();
}

// 교사 대시보드 데이터 로드
async function loadTeacherDashboardData() {
    if (!currentUser) {
        console.error('currentUser를 찾을 수 없습니다.');
        return;
    }
    
    // window.currentTeacher가 없으면 잠시 기다렸다가 다시 시도 (loadSidebarMenu 완료 대기)
    if (!window.currentTeacher) {
        // 최대 3초 대기 (500ms 간격으로 6번 시도)
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (window.currentTeacher) {
                break;
            }
        }
        
        // 여전히 없으면 교사 정보 직접 가져오기
        if (!window.currentTeacher) {
            try {
                const userResponse = await axios.get(`/api/users/${currentUser.id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const teacher = userResponse.data.teacher;
                if (teacher) {
                    const permissionsResponse = await axios.get(`/api/teacher-permissions?teacher_id=${teacher.id}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const teacherPermissions = (permissionsResponse.data.permissions || []).map(p => p.permission_type);
                    window.currentTeacher = {
                        id: teacher.id,
                        permissions: teacherPermissions
                    };
                } else {
                    console.error('교사 정보를 찾을 수 없습니다.');
                    document.getElementById('teacher-homeroom-section').innerHTML = `
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <p class="text-red-500 text-center py-4">교사 정보를 찾을 수 없습니다.</p>
                        </div>
                    `;
                    return;
                }
            } catch (error) {
                console.error('교사 정보 로드 실패:', error);
                document.getElementById('teacher-homeroom-section').innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <p class="text-red-500 text-center py-4">교사 정보를 불러오는데 실패했습니다.</p>
                    </div>
                `;
                return;
            }
        }
    }
    
    try {
        // 담당 반 정보 조회
        const homeroomRes = await axios.get(`/api/teacher-homeroom?teacher_id=${window.currentTeacher.id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const homerooms = homeroomRes.data.homerooms || [];
        
        // 담당 반 표시
        const homeroomSection = document.getElementById('teacher-homeroom-section');
        if (homerooms.length > 0) {
            homeroomSection.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-${homerooms.length > 1 ? '2' : '1'} gap-6">
                    ${homerooms.map(homeroom => `
                        <div class="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow" onclick="showClassDetail(${homeroom.class_id})">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-2xl font-bold text-gray-800">${homeroom.class_name}</h2>
                                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">담임</span>
                            </div>
                            <div class="space-y-2">
                                <div class="flex items-center text-gray-600">
                                    <i class="fas fa-door-open w-5 mr-2"></i>
                                    <span>교실: ${homeroom.room_number || '미정'}</span>
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <i class="fas fa-user-graduate w-5 mr-2"></i>
                                    <span id="homeroom-${homeroom.class_id}-students">학생: <i class="fas fa-spinner fa-spin text-sm"></i></span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // 각 반의 학생 수 조회
            homerooms.forEach(async (homeroom) => {
                try {
                    const studentsRes = await axios.get(`/api/students?class_id=${homeroom.class_id}`, {
                        headers: { 'Authorization': 'Bearer ' + authToken }
                    });
                    const studentCount = studentsRes.data.students?.length || 0;
                    const elem = document.getElementById(`homeroom-${homeroom.class_id}-students`);
                    if (elem) {
                        elem.innerHTML = `학생: ${studentCount}명`;
                    }
                } catch (error) {
                    console.error('학생 수 조회 실패:', error);
                }
            });
        } else {
            homeroomSection.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <p class="text-gray-500 text-center py-4">담당 반이 없습니다.</p>
                </div>
            `;
        }
        
        // 담당 과목 조회
        const coursesRes = await axios.get(`/api/courses?teacher_id=${window.currentTeacher.id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const courses = coursesRes.data.courses || [];
        const coursesList = document.getElementById('teacher-courses-list');
        
        if (courses.length > 0) {
            coursesList.innerHTML = courses.map(course => `
                <div class="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-gray-800">${course.course_name || course.subject_name}</h3>
                            <p class="text-sm text-gray-600 mt-1">${course.class_name} · ${course.schedule || '시간 미정'}</p>
                        </div>
                        <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">${course.credits || 0}학점</span>
                    </div>
                </div>
            `).join('');
        } else {
            coursesList.innerHTML = `<p class="text-gray-500 text-center py-4">담당 과목이 없습니다.</p>`;
        }
        
        // 학기 정보 조회
        const semestersRes = await axios.get('/api/semesters', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const currentSemester = semestersRes.data.semesters?.find(s => s.is_current);
        if (currentSemester) {
            document.getElementById('teacher-stat-semester').textContent = currentSemester.name;
        }
        
        // 오늘의 출석 현황 (담당 반 기준)
        const attendanceStats = document.getElementById('teacher-attendance-stats');
        if (homerooms.length > 0) {
            attendanceStats.innerHTML = `
                <p class="text-gray-600 text-center">담당 반 학생들의 출석 현황</p>
                <div class="text-center py-4">
                    <button onclick="navigateToPage('attendance')" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        출석 입력하기
                    </button>
                </div>
            `;
        } else {
            attendanceStats.innerHTML = `<p class="text-gray-500 text-center py-4">담당 반이 없습니다.</p>`;
        }
        
    } catch (error) {
        console.error('교사 대시보드 데이터 로드 실패:', error);
    }
}



// 설정 페이지
function showSettingsPage(container) {
    container.innerHTML = `
        <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-8">설정</h1>
            <div class="bg-white rounded-lg shadow p-8 text-center">
                <i class="fas fa-cog text-6xl text-gray-400 mb-4"></i>
                <p class="text-lg text-gray-600 mb-2">시스템 설정</p>
                <p class="text-sm text-gray-500">추가 개발 예정</p>
            </div>
        </div>
    `;
}

// 학생 관리 화면
async function showStudentManagement(container) {
    try {
        const response = await axios.get('/api/students?limit=100', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const students = response.data.students;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">학생 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-700">전체 학생 목록</h2>
                    <button onclick="showAddStudentPage()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>학생 추가
                    </button>
                </div>
                
                <div class="mb-4">
                    <input type="text" id="student-search" placeholder="이름 또는 학번으로 검색..." 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                           onkeyup="filterStudents(this.value)">
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학년</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="student-list">
                            ${students.map(student => {
                                // 학년별 색상 정의
                                const gradeColors = {
                                    1: 'bg-blue-100 text-blue-800',
                                    2: 'bg-green-100 text-green-800',
                                    3: 'bg-purple-100 text-purple-800'
                                };
                                const gradeColor = gradeColors[student.grade] || 'bg-gray-100 text-gray-800';
                                
                                // 반 배정 여부에 따른 색상
                                const classColor = student.class_name ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800';
                                
                                return `
                                <tr class="student-row">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">${student.student_number}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${student.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        ${student.grade ? `<span class="px-2 py-1 text-xs font-semibold rounded-full ${gradeColor}">${student.grade}학년</span>` : '-'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${classColor}">
                                            ${student.class_name || '미배정'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'enrolled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${student.status === 'enrolled' ? '재학중' : student.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">${student.phone || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onclick="showStudentDetail(${student.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="editStudent(${student.id})" class="text-green-600 hover:text-green-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load students:', error);
        alert('학생 목록을 불러오는데 실패했습니다.');
    }
}

// 학생 검색 필터
function filterStudents(searchText) {
    const rows = document.querySelectorAll('.student-row');
    const search = searchText.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// 학생 추가 폼 표시
async function showAddStudentForm() {
    try {
        // 반 목록 가져오기
        const classesRes = await axios.get('/api/classes', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">새 학생 등록</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="add-student-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                            <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학번 *</label>
                            <input type="text" name="student_number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">아이디 (로그인용) *</label>
                            <input type="text" name="username" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>
                            <input type="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                            <input type="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                            <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학년</label>
                            <select name="grade" id="student-grade-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택 안함</option>
                                <option value="1">1학년</option>
                                <option value="2">2학년</option>
                                <option value="3">3학년</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">반</label>
                            <select name="class_id" id="student-class-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택 안함</option>
                                ${classesRes.data.classes.map(c => `<option value="${c.id}" data-grade="${c.grade}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
                        <input type="text" name="address" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">비상연락처</label>
                        <input type="tel" name="emergency_contact" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">입학일</label>
                        <input type="date" name="admission_date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            등록
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 학년 선택 시 반 목록 필터링
        document.getElementById('student-grade-select').addEventListener('change', function() {
            const selectedGrade = this.value;
            const classSelect = document.getElementById('student-class-select');
            const classOptions = classSelect.querySelectorAll('option');
            
            classOptions.forEach(option => {
                if (option.value === '') {
                    option.style.display = '';
                } else {
                    const optionGrade = option.getAttribute('data-grade');
                    option.style.display = (!selectedGrade || optionGrade == selectedGrade) ? '' : 'none';
                }
            });
            
            // 선택된 반이 현재 학년과 맞지 않으면 초기화
            const selectedOption = classSelect.options[classSelect.selectedIndex];
            if (selectedOption && selectedOption.getAttribute('data-grade') != selectedGrade && selectedGrade) {
                classSelect.value = '';
            }
        });
        
        // 폼 제출 처리
        document.getElementById('add-student-form').addEventListener('submit', handleAddStudent);
    } catch (error) {
        console.error('Failed to load form:', error);
        alert('폼을 불러오는데 실패했습니다.');
    }
}

// 학생 추가 처리
async function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        // 1. 사용자 계정 생성
        const userRes = await axios.post('/api/users', {
            username: data.username,
            password: data.password,
            email: data.email,
            name: data.name,
            role: 'student',
            phone: data.phone || null
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const userId = userRes.data.userId;
        
        // 2. 학생 정보 생성
        await axios.post('/api/students', {
            user_id: userId,
            student_number: data.student_number,
            grade: data.grade ? parseInt(data.grade) : null,
            class_id: data.class_id ? parseInt(data.class_id) : null,
            admission_date: data.admission_date || null,
            address: data.address || null,
            emergency_contact: data.emergency_contact || null
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('학생이 성공적으로 등록되었습니다!');
        closeModal();
        navigateToPage('students'); // 페이지 새로고침
    } catch (error) {
        console.error('Failed to add student:', error);
        alert('학생 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('student-modal');
    if (modal) {
        modal.remove();
    }
}

// 학생 상세 보기
async function viewStudentDetail(studentId) {
    try {
        const response = await axios.get(`/api/students/${studentId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const data = response.data;
        const student = data.student;
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">학생 상세 정보</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <!-- 기본 정보 -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">기본 정보</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <span class="text-sm text-gray-600">이름</span>
                                <p class="font-medium">${student.name}</p>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">학번</span>
                                <p class="font-medium">${student.student_number}</p>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">학년</span>
                                <p class="font-medium">${student.grade || '-'}학년</p>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">반</span>
                                <p class="font-medium">${student.class_name || '미배정'}</p>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">이메일</span>
                                <p class="font-medium">${student.email}</p>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">연락처</span>
                                <p class="font-medium">${student.phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 학업 정보 -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">학업 정보</h3>
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <span class="text-sm text-gray-600">수강 과목</span>
                                <p class="text-2xl font-bold text-blue-600">${data.enrollments.length}개</p>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <span class="text-sm text-gray-600">동아리</span>
                                <p class="text-2xl font-bold text-purple-600">${data.clubs.length}개</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <span class="text-sm text-gray-600">봉사시간</span>
                                <p class="text-2xl font-bold text-green-600">${data.volunteerStats.approved_hours || 0}시간</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 학부모 정보 -->
                    ${data.parents && data.parents.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">학부모 정보</h3>
                        <div class="space-y-2">
                            ${data.parents.map(p => `
                                <div class="flex justify-between items-center bg-gray-50 p-3 rounded">
                                    <div>
                                        <span class="font-medium">${p.name}</span>
                                        <span class="text-sm text-gray-600 ml-2">(${p.relationship})</span>
                                    </div>
                                    <span class="text-sm text-gray-600">${p.phone || '-'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="flex justify-end space-x-4">
                        <button onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            닫기
                        </button>
                        <button onclick="editStudent(${studentId})" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-edit mr-2"></i>수정
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Failed to load student detail:', error);
        alert('학생 정보를 불러오는데 실패했습니다.');
    }
}

// 학생 수정
async function editStudent(studentId) {
    closeModal(); // 기존 모달 닫기
    
    try {
        const [studentRes, classesRes, semestersRes] = await Promise.all([
            axios.get(`/api/students/${studentId}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/classes', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/semesters', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        const student = studentRes.data.student;
        const semesters = semestersRes.data.semesters;
        const currentSemester = semesters.find(s => s.is_current) || semesters[0];
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">학생 정보 수정</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <!-- 현재 정보 표시 -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 class="font-semibold text-blue-900 mb-2">현재 정보</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><span class="text-blue-700">이름:</span> <span class="font-medium">${student.name}</span></div>
                        <div><span class="text-blue-700">학번:</span> <span class="font-medium">${student.student_number}</span></div>
                        <div><span class="text-blue-700">현재 반:</span> <span class="font-medium">${student.class_name || '미배정'}</span></div>
                        <div><span class="text-blue-700">학기:</span> <span class="font-medium">${student.semester_name || '-'}</span></div>
                    </div>
                </div>
                
                <form id="edit-student-form" class="space-y-4">
                    <input type="hidden" name="student_id" value="${studentId}">
                    <input type="hidden" name="semester_id" value="${currentSemester?.id || ''}">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학년</label>
                            <select name="grade" id="edit-student-grade-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택 안함</option>
                                <option value="1" ${student.grade == 1 ? 'selected' : ''}>1학년</option>
                                <option value="2" ${student.grade == 2 ? 'selected' : ''}>2학년</option>
                                <option value="3" ${student.grade == 3 ? 'selected' : ''}>3학년</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">현재 학기 반 배정</label>
                            <select name="class_id" id="edit-student-class-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택 안함</option>
                                ${classesRes.data.classes.map(c => 
                                    `<option value="${c.id}" data-grade="${c.grade}" ${student.class_id == c.id ? 'selected' : ''}>${c.name}</option>`
                                ).join('')}
                            </select>
                            <p class="text-xs text-gray-500 mt-1">현재 학기(${currentSemester?.name || '-'})의 반 배정을 변경합니다</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
                        <input type="text" name="address" value="${student.address || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">비상연락처</label>
                        <input type="tel" name="emergency_contact" value="${student.emergency_contact || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">상태</label>
                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="enrolled" ${student.status == 'enrolled' ? 'selected' : ''}>재학중</option>
                            <option value="graduated" ${student.status == 'graduated' ? 'selected' : ''}>졸업</option>
                            <option value="transferred" ${student.status == 'transferred' ? 'selected' : ''}>전학</option>
                            <option value="dropped" ${student.status == 'dropped' ? 'selected' : ''}>자퇴</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            저장
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 학년 선택 시 반 목록 필터링
        document.getElementById('edit-student-grade-select').addEventListener('change', function() {
            const selectedGrade = this.value;
            const classSelect = document.getElementById('edit-student-class-select');
            const classOptions = classSelect.querySelectorAll('option');
            
            classOptions.forEach(option => {
                if (option.value === '') {
                    option.style.display = '';
                } else {
                    const optionGrade = option.getAttribute('data-grade');
                    option.style.display = (!selectedGrade || optionGrade == selectedGrade) ? '' : 'none';
                }
            });
            
            // 선택된 반이 현재 학년과 맞지 않으면 초기화
            const selectedOption = classSelect.options[classSelect.selectedIndex];
            if (selectedOption && selectedOption.getAttribute('data-grade') != selectedGrade && selectedGrade) {
                classSelect.value = '';
            }
        });
        
        // 초기 로드 시 학년에 맞는 반만 표시
        const initialGrade = document.getElementById('edit-student-grade-select').value;
        if (initialGrade) {
            document.getElementById('edit-student-grade-select').dispatchEvent(new Event('change'));
        }
        
        document.getElementById('edit-student-form').addEventListener('submit', handleEditStudent);
    } catch (error) {
        console.error('Failed to load edit form:', error);
        alert('수정 폼을 불러오는데 실패했습니다.');
    }
}

// 학생 수정 처리
async function handleEditStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const studentId = data.student_id;
    
    try {
        await axios.put(`/api/students/${studentId}`, {
            grade: data.grade ? parseInt(data.grade) : null,
            class_id: data.class_id ? parseInt(data.class_id) : null,
            address: data.address || null,
            emergency_contact: data.emergency_contact || null,
            status: data.status
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('학생 정보가 수정되었습니다!');
        closeModal();
        navigateToPage('students');
    } catch (error) {
        console.error('Failed to update student:', error);
        alert('학생 정보 수정에 실패했습니다.');
    }
}

// 수업 관리 화면
async function showCourseManagement(container) {
    try {
        // 교사인 경우 담당 과목만 조회
        let coursesUrl = '/api/courses';
        if (currentUser.role === 'teacher' && window.currentTeacher) {
            coursesUrl += `?teacher_id=${window.currentTeacher.id}`;
        }
        
        const [subjectsRes, semestersRes, coursesRes] = await Promise.all([
            axios.get('/api/subjects', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get(coursesUrl, { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const courses = coursesRes.data.courses || [];
        // 교사인 경우 담당 과목만 표시
        const teacherSubjects = currentUser.role === 'teacher' && window.currentTeacher 
            ? [...new Set(courses.map(c => c.subject_id))] 
            : null;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">수업 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold text-gray-700 mb-6">과목 및 학기 정보</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">과목 목록</h3>
                            ${currentUser.role !== 'teacher' ? `
                                <button onclick="showAddSubjectForm()" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-1"></i>추가
                                </button>
                            ` : ''}
                        </div>
                        <div class="space-y-2">
                            ${(teacherSubjects 
                                ? subjectsRes.data.subjects.filter(s => teacherSubjects.includes(s.id))
                                : subjectsRes.data.subjects
                            ).map(subject => `
                                <div class="border p-4 rounded-lg hover:bg-gray-50">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <span class="font-medium">${subject.name}</span>
                                            <span class="text-sm text-gray-500 ml-2">(${subject.code})</span>
                                        </div>
                                        <span class="text-sm px-2 py-1 rounded ${subject.subject_type === 'required' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                                            ${subject.subject_type === 'required' ? '필수' : '선택'}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600 mt-1">
                                        ${subject.description || '설명 없음'} · ${subject.credits}학점
                                    </div>
                                </div>
                            `).join('')}
                            ${teacherSubjects && subjectsRes.data.subjects.filter(s => teacherSubjects.includes(s.id)).length === 0 ? `
                                <p class="text-gray-500 text-center py-4">담당 과목이 없습니다.</p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div>
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">학기 목록</h3>
                            ${currentUser.role !== 'teacher' ? `
                                <button onclick="showAddSemesterForm()" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-1"></i>추가
                                </button>
                            ` : ''}
                        </div>
                        <div class="space-y-2">
                            ${semestersRes.data.semesters.map(semester => `
                                <div class="border p-4 rounded-lg hover:bg-gray-50 ${semester.is_current ? 'border-blue-500 bg-blue-50' : ''}">
                                    <div class="flex justify-between items-center">
                                        <span class="font-medium">${semester.name}</span>
                                        ${semester.is_current ? '<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">현재 학기</span>' : ''}
                                    </div>
                                    <div class="text-sm text-gray-600 mt-1">
                                        ${semester.start_date} ~ ${semester.end_date}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load courses:', error);
        alert('수업 정보를 불러오는데 실패했습니다.');
    }
}

// 출석 관리 화면
async function showAttendanceManagement(container) {
    try {
        let students = [];
        let classesUrl = '/api/classes';
        let allClassIds = [];
        
        if (currentUser.role === 'teacher' && window.currentTeacher) {
            // 1. 담임인 반의 학생들 가져오기
            const homeroomResponse = await axios.get(`/api/teacher-homeroom?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const homeroomClasses = (homeroomResponse.data.homerooms || []).map(h => h.class_id);
            
            // 2. 담당 과목의 학생들 가져오기
            const coursesResponse = await axios.get(`/api/courses?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const courses = coursesResponse.data.courses || [];
            const courseIds = courses.map(c => c.id);
            
            // 담당 과목의 학생 ID 수집 (enrollments 테이블 사용)
            const studentIdsFromCourses = new Set();
            if (courseIds.length > 0) {
                // 각 과목의 enrollments를 통해 학생 ID 가져오기
                for (const courseId of courseIds) {
                    try {
                        // enrollments는 courses API에서 student_id 파라미터로 조회 가능
                        // 또는 직접 enrollments API가 있다면 사용
                        // 일단 courses API의 student_id 필터를 사용할 수 없으므로
                        // 학생 목록을 가져온 후 enrollments로 필터링
                    } catch (error) {
                        console.error('과목 학생 조회 실패:', error);
                    }
                }
            }
            
            // 담임 반 학생들 가져오기
            if (homeroomClasses.length > 0) {
                allClassIds = [...homeroomClasses];
                for (const classId of homeroomClasses) {
                    try {
                        const classStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const classStudents = classStudentsRes.data.students || [];
                        students.push(...classStudents);
                    } catch (error) {
                        console.error('반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 담당 과목의 학생들 가져오기 (enrollments를 통해)
            // enrollments API가 없으므로, 모든 학생을 가져온 후 course_id로 필터링
            // 또는 courses API를 통해 간접적으로 가져오기
            // 일단 모든 학생을 가져온 후, 담당 과목에 등록된 학생만 필터링
            try {
                const allStudentsRes = await axios.get('/api/students?limit=1000', {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                const allStudents = allStudentsRes.data.students || [];
                
                // 각 학생의 enrollments 확인 (학생 상세 API 사용)
                // 하지만 이건 너무 많은 API 호출이 필요하므로
                // 일단 담임 반 학생들만 사용하고, 나중에 enrollments API 추가 시 확장
                
                // 담당 과목이 있는 반의 학생들도 포함
                const courseClassIds = [...new Set(courses.map(c => c.class_id).filter(id => id))];
                for (const classId of courseClassIds) {
                    if (!allClassIds.includes(classId)) {
                        allClassIds.push(classId);
                        try {
                            const courseClassStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                                headers: { 'Authorization': 'Bearer ' + authToken }
                            });
                            const courseClassStudents = courseClassStudentsRes.data.students || [];
                            students.push(...courseClassStudents);
                        } catch (error) {
                            console.error('과목 반 학생 조회 실패:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('학생 목록 조회 실패:', error);
            }
            
            // 중복 제거 (student_id 기준)
            const uniqueStudents = [];
            const seenIds = new Set();
            for (const student of students) {
                if (!seenIds.has(student.id)) {
                    seenIds.add(student.id);
                    uniqueStudents.push(student);
                }
            }
            students = uniqueStudents;
            
            if (allClassIds.length > 0) {
                classesUrl += `?class_ids=${allClassIds.join(',')}`;
            }
        } else {
            // 관리자는 전체 학생
            const studentsRes = await axios.get('/api/students?limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            students = studentsRes.data.students || [];
        }
        
        const classesRes = await axios.get(classesUrl, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        // 전역 변수에 저장
        window.allAttendanceStudents = students;
        window.filteredAttendanceStudents = students;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">출석 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-700">전체 학생 출석 입력</h2>
                        <button onclick="loadGlobalAttendanceByDate()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-calendar-check mr-2"></i>날짜별 출석 불러오기
                        </button>
                    </div>
                    
                    <!-- 검색 및 필터 -->
                    <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="text" 
                               id="attendance-search-input" 
                               placeholder="이름 또는 학번 검색..."
                               class="px-4 py-2 border border-gray-300 rounded-lg"
                               onkeyup="filterAttendanceStudents()">
                        
                        <select id="attendance-class-filter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg"
                                onchange="filterAttendanceStudents()">
                            <option value="">전체 반</option>
                            ${classesRes.data.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        
                        <input type="date" 
                               id="attendance-date-filter" 
                               value="${new Date().toISOString().split('T')[0]}"
                               class="px-4 py-2 border border-gray-300 rounded-lg"
                               onchange="loadGlobalAttendanceByDate()">
                        
                        <button onclick="resetAttendanceFilters()" 
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                            <i class="fas fa-redo mr-2"></i>초기화
                        </button>
                    </div>
                    
                    <!-- 출석 입력 영역 -->
                    <div id="attendance-students-list">
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-calendar-alt text-4xl mb-4"></i>
                            <p>날짜를 선택하면 출석 입력을 시작할 수 있습니다.</p>
                            <button onclick="loadGlobalAttendanceByDate()" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                출석 입력 시작
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 자동으로 오늘 날짜 출석 불러오기
        loadGlobalAttendanceByDate();
    } catch (error) {
        console.error('Failed to load attendance page:', error);
        alert('출석 관리 화면을 불러오는데 실패했습니다.');
    }
}

// 날짜별 전역 출석 불러오기 (반 관리 출석과 동일한 로직)
async function loadGlobalAttendanceByDate() {
    const dateElement = document.getElementById('attendance-date-filter');
    if (!dateElement) {
        alert('날짜 필터가 로드되지 않았습니다.');
        return;
    }
    
    const date = dateElement.value;
    const container = document.getElementById('attendance-students-list');
    
    container.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="text-gray-600 mt-2">학생 목록 로딩 중...</p>
        </div>
    `;
    
    try {
        // 필터링된 학생 목록 사용
        const students = window.filteredAttendanceStudents || window.allAttendanceStudents;
        
        if (!students || students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">조회된 학생이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        // 해당 날짜의 출석 기록 가져오기
        const attendanceResponse = await axios.get(`/api/attendance/by-date?date=${date}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const attendanceRecords = attendanceResponse.data.attendance || [];
        
        // 학생 목록과 출석 기록 매칭
        const studentsWithAttendance = students.map(student => {
            const record = attendanceRecords.find(a => a.student_id === student.id);
            return {
                student_id: student.id,
                student_number: student.student_number,
                student_name: student.name,
                class_name: student.class_name || '-',
                grade: student.grade || '-',
                status: record ? record.status : 'not_recorded',
                notes: record ? record.notes : ''
            };
        });
        
        // 통계 계산
        const stats = {
            total: studentsWithAttendance.length,
            present: studentsWithAttendance.filter(s => s.status === 'present').length,
            absent: studentsWithAttendance.filter(s => s.status === 'absent').length,
            late: studentsWithAttendance.filter(s => s.status === 'late').length,
            excused: studentsWithAttendance.filter(s => s.status === 'excused').length,
            not_recorded: studentsWithAttendance.filter(s => s.status === 'not_recorded').length
        };
        
        // 전역 변수에 저장
        window.globalAttendanceData = studentsWithAttendance;
        window.globalAttendanceDate = date;
        
        container.innerHTML = `
            <!-- 통계 카드 -->
            <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-600 mb-1">전체</p>
                    <p class="text-xl font-bold text-gray-800">${stats.total}</p>
                </div>
                <div class="bg-green-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-green-600 mb-1">출석</p>
                    <p class="text-xl font-bold text-green-800">${stats.present}</p>
                </div>
                <div class="bg-red-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-red-600 mb-1">결석</p>
                    <p class="text-xl font-bold text-red-800">${stats.absent}</p>
                </div>
                <div class="bg-yellow-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-yellow-600 mb-1">지각</p>
                    <p class="text-xl font-bold text-yellow-800">${stats.late}</p>
                </div>
                <div class="bg-blue-50 p-3 rounded-lg text-center">
                    <p class="text-xs text-blue-600 mb-1">인정결석</p>
                    <p class="text-xl font-bold text-blue-800">${stats.excused}</p>
                </div>
                <div class="bg-gray-100 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-600 mb-1">미입력</p>
                    <p class="text-xl font-bold text-gray-800">${stats.not_recorded}</p>
                </div>
            </div>
            
            <!-- 일괄 출석 및 저장 버튼 -->
            <div class="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center gap-3 flex-wrap">
                    <span class="text-sm font-medium text-gray-700">일괄 출석 처리:</span>
                    <select id="global-bulk-attendance-status" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">상태 선택</option>
                        <option value="present">출석</option>
                        <option value="absent">결석</option>
                        <option value="late">지각</option>
                        <option value="excused">인정결석</option>
                        <option value="not_recorded">미입력</option>
                    </select>
                    <button onclick="applyGlobalBulkAttendanceToSelected()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">
                        <i class="fas fa-check-double mr-2"></i>선택 학생에 적용
                    </button>
                    <button onclick="applyGlobalBulkAttendanceToAll()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm">
                        <i class="fas fa-users mr-2"></i>전체 학생에 적용
                    </button>
                </div>
                <button onclick="saveGlobalAttendance()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm">
                    <i class="fas fa-save mr-2"></i>전체 저장
                </button>
            </div>
            
            <!-- 출석 입력 테이블 -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                <input type="checkbox" 
                                       id="global-select-all-attendance"
                                       onchange="toggleGlobalAllAttendanceCheckboxes(this.checked)"
                                       class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                            </th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">학년</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">반</th>
                            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">출석상태</th>
                            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200" id="global-attendance-tbody">
                        ${studentsWithAttendance.map(student => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-3 py-2 text-center">
                                    <input type="checkbox" 
                                           class="global-attendance-checkbox"
                                           data-student-id="${student.student_id}"
                                           class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${student.student_number || '-'}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    ${student.student_name}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    ${student.grade}학년
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    ${student.class_name}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-center">
                                    <select id="global-status-${student.student_id}" 
                                            class="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onchange="updateGlobalAttendanceStatus(${student.student_id}, this.value)">
                                        <option value="not_recorded" ${student.status === 'not_recorded' ? 'selected' : ''}>미입력</option>
                                        <option value="present" ${student.status === 'present' ? 'selected' : ''}>출석</option>
                                        <option value="absent" ${student.status === 'absent' ? 'selected' : ''}>결석</option>
                                        <option value="late" ${student.status === 'late' ? 'selected' : ''}>지각</option>
                                        <option value="excused" ${student.status === 'excused' ? 'selected' : ''}>인정결석</option>
                                    </select>
                                </td>
                                <td class="px-3 py-2">
                                    <input type="text" 
                                           id="global-notes-${student.student_id}"
                                           value="${student.notes || ''}"
                                           placeholder="비고..."
                                           class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           onchange="updateGlobalAttendanceNotes(${student.student_id}, this.value)">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('출석 입력 로드 실패:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>출석 입력을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// 전역 출석 상태 업데이트 (코드 재활용)
function updateGlobalAttendanceStatus(studentId, status) {
    if (!window.globalAttendanceData) return;
    
    const student = window.globalAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.status = status;
        refreshGlobalAttendanceStats();
    }
}

// 전역 출석 비고 업데이트 (코드 재활용)
function updateGlobalAttendanceNotes(studentId, notes) {
    if (!window.globalAttendanceData) return;
    
    const student = window.globalAttendanceData.find(s => s.student_id === studentId);
    if (student) {
        student.notes = notes;
    }
}

// 전역 출석 통계 실시간 업데이트 (코드 재활용)
function refreshGlobalAttendanceStats() {
    if (!window.globalAttendanceData) return;
    
    const attendance = window.globalAttendanceData;
    const stats = {
        total: attendance.length,
        present: attendance.filter(s => s.status === 'present').length,
        absent: attendance.filter(s => s.status === 'absent').length,
        late: attendance.filter(s => s.status === 'late').length,
        excused: attendance.filter(s => s.status === 'excused').length,
        not_recorded: attendance.filter(s => s.status === 'not_recorded').length
    };
    
    // 통계 카드 업데이트
    const statsContainer = document.querySelector('#attendance-students-list .grid.grid-cols-2');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="bg-gray-50 p-3 rounded-lg text-center">
                <p class="text-xs text-gray-600 mb-1">전체</p>
                <p class="text-xl font-bold text-gray-800">${stats.total}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg text-center">
                <p class="text-xs text-green-600 mb-1">출석</p>
                <p class="text-xl font-bold text-green-800">${stats.present}</p>
            </div>
            <div class="bg-red-50 p-3 rounded-lg text-center">
                <p class="text-xs text-red-600 mb-1">결석</p>
                <p class="text-xl font-bold text-red-800">${stats.absent}</p>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg text-center">
                <p class="text-xs text-yellow-600 mb-1">지각</p>
                <p class="text-xl font-bold text-yellow-800">${stats.late}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-center">
                <p class="text-xs text-blue-600 mb-1">인정결석</p>
                <p class="text-xl font-bold text-blue-800">${stats.excused}</p>
            </div>
            <div class="bg-gray-100 p-3 rounded-lg text-center">
                <p class="text-xs text-gray-600 mb-1">미입력</p>
                <p class="text-xl font-bold text-gray-800">${stats.not_recorded}</p>
            </div>
        `;
    }
}

// 전체 선택/해제 (코드 재활용)
function toggleGlobalAllAttendanceCheckboxes(checked) {
    const checkboxes = document.querySelectorAll('.global-attendance-checkbox');
    checkboxes.forEach(cb => cb.checked = checked);
}

// 선택된 학생에게 일괄 출석 상태 적용 (코드 재활용)
function applyGlobalBulkAttendanceToSelected() {
    const bulkStatus = document.getElementById('global-bulk-attendance-status').value;
    if (!bulkStatus) {
        alert('적용할 출석 상태를 선택해주세요.');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.global-attendance-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('출석 상태를 적용할 학생을 선택해주세요.');
        return;
    }
    
    const statusText = {
        'present': '출석',
        'absent': '결석',
        'late': '지각',
        'excused': '인정결석',
        'not_recorded': '미입력'
    };
    
    if (!confirm(`선택한 ${checkboxes.length}명의 학생을 "${statusText[bulkStatus]}"로 변경하시겠습니까?`)) {
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const studentId = parseInt(checkbox.getAttribute('data-student-id'));
        const selectElement = document.getElementById(`global-status-${studentId}`);
        if (selectElement) {
            selectElement.value = bulkStatus;
            updateGlobalAttendanceStatus(studentId, bulkStatus);
        }
    });
    
    alert(`${checkboxes.length}명의 출석 상태를 "${statusText[bulkStatus]}"로 변경했습니다.`);
    
    // 체크박스 초기화
    document.getElementById('global-select-all-attendance').checked = false;
    checkboxes.forEach(cb => cb.checked = false);
}

// 전체 학생에게 일괄 출석 상태 적용 (코드 재활용)
function applyGlobalBulkAttendanceToAll() {
    const bulkStatus = document.getElementById('global-bulk-attendance-status').value;
    if (!bulkStatus) {
        alert('적용할 출석 상태를 선택해주세요.');
        return;
    }
    
    if (!window.globalAttendanceData) {
        alert('출석 데이터가 없습니다.');
        return;
    }
    
    const statusText = {
        'present': '출석',
        'absent': '결석',
        'late': '지각',
        'excused': '인정결석',
        'not_recorded': '미입력'
    };
    
    const studentCount = window.globalAttendanceData.length;
    
    if (!confirm(`전체 ${studentCount}명의 학생을 "${statusText[bulkStatus]}"로 변경하시겠습니까?`)) {
        return;
    }
    
    window.globalAttendanceData.forEach(student => {
        const selectElement = document.getElementById(`global-status-${student.student_id}`);
        if (selectElement) {
            selectElement.value = bulkStatus;
            updateGlobalAttendanceStatus(student.student_id, bulkStatus);
        }
    });
    
    alert(`전체 ${studentCount}명의 출석 상태를 "${statusText[bulkStatus]}"로 변경했습니다.`);
}

// 전역 출석 저장 (코드 재활용)
async function saveGlobalAttendance() {
    if (!window.globalAttendanceData || !window.globalAttendanceDate) {
        alert('출석 데이터가 없습니다.');
        return;
    }
    
    const recordsToSave = window.globalAttendanceData
        .filter(student => student.status !== 'not_recorded')
        .map(student => ({
            student_id: student.student_id,
            status: student.status,
            notes: student.notes || ''
        }));
    
    if (recordsToSave.length === 0) {
        alert('저장할 출석 데이터가 없습니다.\n(미입력 상태는 저장되지 않습니다)');
        return;
    }
    
    if (!confirm(`${recordsToSave.length}명의 출석을 저장하시겠습니까?`)) {
        return;
    }
    
    try {
        const response = await axios.post('/api/attendance/bulk-simple', {
            attendance_date: window.globalAttendanceDate,
            records: recordsToSave
        }, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        alert('출석이 성공적으로 저장되었습니다!');
        
        // 출석 데이터 새로고침
        loadGlobalAttendanceByDate();
    } catch (error) {
        console.error('출석 저장 실패:', error);
        alert('출석 저장에 실패했습니다.\n' + (error.response?.data?.error || error.message));
    }
}

// 출석 필터링
function filterAttendanceStudents() {
    const searchTerm = document.getElementById('attendance-search-input').value.toLowerCase();
    const classFilter = document.getElementById('attendance-class-filter').value;
    
    let filtered = window.allAttendanceStudents;
    
    // 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchTerm) ||
            s.student_number.toLowerCase().includes(searchTerm)
        );
    }
    
    // 반 필터
    if (classFilter) {
        filtered = filtered.filter(s => s.class_id == classFilter);
    }
    
    window.filteredAttendanceStudents = filtered;
    
    // 출석 입력 화면이 로드되어 있으면 새로고침
    if (window.globalAttendanceDate) {
        loadGlobalAttendanceByDate();
    }
}

// 출석 필터 초기화
function resetAttendanceFilters() {
    document.getElementById('attendance-search-input').value = '';
    document.getElementById('attendance-class-filter').value = '';
    document.getElementById('attendance-date-filter').value = new Date().toISOString().split('T')[0];
    window.filteredAttendanceStudents = window.allAttendanceStudents;
    loadGlobalAttendanceByDate();
}

// 학생 출석 상세보기
function viewStudentAttendance(studentId, studentName) {
    alert(`${studentName} 학생의 출석 상세 기록 조회 기능입니다.\n(출석 기록 API 구현 필요)`);
    // 실제 구현: 학생의 출석 기록을 조회하여 모달이나 새 페이지에 표시
}



// 성적 관리 화면
async function showGradeManagement(container) {
    try {
        let students = [];
        let classesUrl = '/api/classes';
        let allClassIds = [];
        
        if (currentUser.role === 'teacher' && window.currentTeacher) {
            // 1. 담임인 반의 학생들 가져오기
            const homeroomResponse = await axios.get(`/api/teacher-homeroom?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const homeroomClasses = (homeroomResponse.data.homerooms || []).map(h => h.class_id);
            
            // 2. 담당 과목의 학생들 가져오기
            const coursesResponse = await axios.get(`/api/courses?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const courses = coursesResponse.data.courses || [];
            
            // 담임 반 학생들 가져오기
            if (homeroomClasses.length > 0) {
                allClassIds = [...homeroomClasses];
                for (const classId of homeroomClasses) {
                    try {
                        const classStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const classStudents = classStudentsRes.data.students || [];
                        students.push(...classStudents);
                    } catch (error) {
                        console.error('반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 담당 과목이 있는 반의 학생들도 포함
            const courseClassIds = [...new Set(courses.map(c => c.class_id).filter(id => id))];
            for (const classId of courseClassIds) {
                if (!allClassIds.includes(classId)) {
                    allClassIds.push(classId);
                    try {
                        const courseClassStudentsRes = await axios.get(`/api/students?class_id=${classId}`, {
                            headers: { 'Authorization': 'Bearer ' + authToken }
                        });
                        const courseClassStudents = courseClassStudentsRes.data.students || [];
                        students.push(...courseClassStudents);
                    } catch (error) {
                        console.error('과목 반 학생 조회 실패:', error);
                    }
                }
            }
            
            // 중복 제거 (student_id 기준)
            const uniqueStudents = [];
            const seenIds = new Set();
            for (const student of students) {
                if (!seenIds.has(student.id)) {
                    seenIds.add(student.id);
                    uniqueStudents.push(student);
                }
            }
            students = uniqueStudents;
            
            if (allClassIds.length > 0) {
                classesUrl += `?class_ids=${allClassIds.join(',')}`;
            }
        } else {
            // 관리자는 전체 학생
            const studentsRes = await axios.get('/api/students?limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            students = studentsRes.data.students || [];
        }
        
        const classesRes = await axios.get(classesUrl, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        // 전역 변수에 저장
        window.allGradeStudents = students;
        window.filteredGradeStudents = students;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">성적 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-700">전체 학생 목록</h2>
                    </div>
                    
                    <!-- 검색 및 필터 -->
                    <div class="mb-6 flex items-center gap-3">
                        <input type="text" 
                               id="grade-search-input" 
                               placeholder="학생 이름 또는 학번으로 검색..."
                               class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               oninput="filterGradeStudents()">
                        <select id="grade-class-filter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg"
                                onchange="filterGradeStudents()">
                            <option value="">전체 반</option>
                        </select>
                        <select id="grade-grade-filter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg"
                                onchange="filterGradeStudents()">
                            <option value="">전체 학년</option>
                            <option value="1">1학년</option>
                            <option value="2">2학년</option>
                            <option value="3">3학년</option>
                        </select>
                    </div>
                    
                    <!-- 학생 목록 테이블 -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학년</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">반</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200" id="grade-students-tbody">
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4 text-sm text-gray-600">
                        총 <span id="grade-student-count" class="font-bold text-blue-600">${students.length}</span>명
                    </div>
                </div>
            </div>
        `;
        
        // 반 목록 로드 (이미 위에서 로드됨)
        try {
            const classFilter = document.getElementById('grade-class-filter');
            const classes = classesRes.data.classes || [];
            classFilter.innerHTML = '<option value="">전체 반</option>' + 
                classes.map(cls => `
                    <option value="${cls.name}">${cls.name}</option>
                `).join('');
        } catch (err) {
            console.error('반 목록 로드 실패:', err);
        }
        
        // 테이블 렌더링
        renderGradeStudentsTable(students);
        
    } catch (error) {
        console.error('Failed to load grade management:', error);
        alert('성적 관리 화면을 불러오는데 실패했습니다.');
    }
}

// 성적 관리 학생 목록 렌더링
function renderGradeStudentsTable(students) {
    const tbody = document.getElementById('grade-students-tbody');
    if (!tbody) return;
    
    const gradeColors = {
        1: 'bg-blue-100 text-blue-800',
        2: 'bg-green-100 text-green-800',
        3: 'bg-purple-100 text-purple-800'
    };
    
    tbody.innerHTML = students.map(student => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${student.student_number || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${student.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${student.grade ? `<span class="px-2 py-1 text-xs font-semibold rounded-full ${gradeColors[student.grade] || 'bg-gray-100 text-gray-800'}">${student.grade}학년</span>` : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${student.class_name ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}">
                    ${student.class_name || '미배정'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                <button onclick="showGradeInputModal(${student.id}, '${student.name}')" 
                        class="text-blue-600 hover:text-blue-800 font-medium">
                    <i class="fas fa-edit mr-1"></i>성적 입력
                </button>
            </td>
        </tr>
    `).join('');
}

// 성적 관리 학생 필터링
function filterGradeStudents() {
    const searchText = document.getElementById('grade-search-input').value.toLowerCase();
    const classFilter = document.getElementById('grade-class-filter').value;
    const gradeFilter = document.getElementById('grade-grade-filter').value;
    
    let filtered = window.allGradeStudents;
    
    // 검색어 필터
    if (searchText) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchText) || 
            (s.student_number && s.student_number.toLowerCase().includes(searchText))
        );
    }
    
    // 반 필터
    if (classFilter) {
        filtered = filtered.filter(s => s.class_name === classFilter);
    }
    
    // 학년 필터
    if (gradeFilter) {
        filtered = filtered.filter(s => s.grade == parseInt(gradeFilter));
    }
    
    window.filteredGradeStudents = filtered;
    renderGradeStudentsTable(filtered);
    
    // 카운트 업데이트
    const countElement = document.getElementById('grade-student-count');
    if (countElement) {
        countElement.textContent = filtered.length;
    }
}

// 성적 입력 모달
async function showGradeInputModal(studentId, studentName) {
    try {
        // 학생의 수강 과목 조회
        const response = await axios.get(`/api/students/${studentId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const enrollments = response.data.enrollments || [];
        
        if (enrollments.length === 0) {
            alert('수강 중인 과목이 없습니다.');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'grade-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">${studentName} - 성적 입력</h2>
                    <button onclick="closeGradeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">교사</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">중간고사</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">기말고사</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">수행평가</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">총점</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${enrollments.map((e, index) => `
                                <tr>
                                    <td class="px-4 py-3 text-sm font-medium">${e.subject_name}</td>
                                    <td class="px-4 py-3 text-sm">${e.teacher_name || '-'}</td>
                                    <td class="px-4 py-3 text-center">
                                        <input type="number" 
                                               id="midterm-${index}" 
                                               value="${e.midterm_score || ''}"
                                               min="0" 
                                               max="100" 
                                               class="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                               onchange="calculateTotalScore(${index})">
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <input type="number" 
                                               id="final-${index}" 
                                               value="${e.final_score || ''}"
                                               min="0" 
                                               max="100" 
                                               class="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                               onchange="calculateTotalScore(${index})">
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <input type="number" 
                                               id="performance-${index}" 
                                               value="${e.performance_score || ''}"
                                               min="0" 
                                               max="100" 
                                               class="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                               onchange="calculateTotalScore(${index})">
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <span id="total-${index}" class="font-bold text-blue-600">
                                            ${calculateTotal(e.midterm_score, e.final_score, e.performance_score)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="flex justify-end space-x-4 mt-6">
                    <button onclick="closeGradeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button onclick="saveGrades(${studentId}, ${enrollments.length})" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>저장
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Failed to load grade input modal:', error);
        alert('성적 입력 화면을 불러오는데 실패했습니다.');
    }
}

// 총점 계산
function calculateTotal(midterm, final, performance) {
    const m = parseFloat(midterm) || 0;
    const f = parseFloat(final) || 0;
    const p = parseFloat(performance) || 0;
    
    if (m === 0 && f === 0 && p === 0) return '-';
    
    const total = (m * 0.3 + f * 0.4 + p * 0.3).toFixed(1);
    return total;
}

// 실시간 총점 계산
function calculateTotalScore(index) {
    const midterm = document.getElementById(`midterm-${index}`).value;
    const final = document.getElementById(`final-${index}`).value;
    const performance = document.getElementById(`performance-${index}`).value;
    
    const total = calculateTotal(midterm, final, performance);
    document.getElementById(`total-${index}`).textContent = total;
}

// 성적 저장
async function saveGrades(studentId, enrollmentCount) {
    try {
        const grades = [];
        
        for (let i = 0; i < enrollmentCount; i++) {
            const midterm = document.getElementById(`midterm-${i}`).value;
            const final = document.getElementById(`final-${i}`).value;
            const performance = document.getElementById(`performance-${i}`).value;
            
            if (midterm || final || performance) {
                grades.push({
                    index: i,
                    midterm_score: midterm ? parseFloat(midterm) : null,
                    final_score: final ? parseFloat(final) : null,
                    performance_score: performance ? parseFloat(performance) : null
                });
            }
        }
        
        if (grades.length === 0) {
            alert('입력된 성적이 없습니다.');
            return;
        }
        
        // 여기에 실제 API 호출을 추가할 수 있습니다
        // await axios.post('/api/grades', { student_id: studentId, grades }, ...)
        
        alert(`성적이 저장되었습니다! (${grades.length}개 과목)`);
        closeGradeModal();
        
    } catch (error) {
        console.error('Failed to save grades:', error);
        alert('성적 저장에 실패했습니다.');
    }
}

// 모달 닫기
function closeGradeModal() {
    const modal = document.getElementById('grade-modal');
    if (modal) {
        modal.remove();
    }
}



// 봉사활동 관리 화면
async function showVolunteerManagement(container) {
    try {
        const response = await axios.get('/api/volunteer?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const activities = response.data.activities;
        
        // 전역 변수에 저장
        window.allVolunteerActivities = activities;
        window.filteredVolunteerActivities = activities;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">봉사활동 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-700">봉사활동 현황</h2>
                    <button onclick="navigateToPage('volunteer-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>활동 등록
                    </button>
                </div>
                
                <!-- 검색 및 필터 -->
                <div class="mb-6 flex items-center gap-3">
                    <input type="text" 
                           id="volunteer-search-input" 
                           placeholder="학생 이름 또는 활동명으로 검색..."
                           class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           oninput="filterVolunteerActivities()">
                    <select id="volunteer-type-filter" 
                            class="px-4 py-2 border border-gray-300 rounded-lg"
                            onchange="filterVolunteerActivities()">
                        <option value="">전체 유형</option>
                        <option value="교육">교육</option>
                        <option value="환경">환경</option>
                        <option value="복지">복지</option>
                        <option value="의료">의료</option>
                        <option value="문화">문화</option>
                        <option value="기타">기타</option>
                    </select>
                    <input type="date" 
                           id="volunteer-date-from" 
                           class="px-4 py-2 border border-gray-300 rounded-lg"
                           onchange="filterVolunteerActivities()">
                    <span class="text-gray-500">~</span>
                    <input type="date" 
                           id="volunteer-date-to" 
                           class="px-4 py-2 border border-gray-300 rounded-lg"
                           onchange="filterVolunteerActivities()">
                </div>
                
                <div id="volunteer-stats" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"></div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">활동명</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기관</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="volunteer-activities-tbody"></tbody>
                    </table>
                </div>
                
                <div class="mt-4 text-sm text-gray-600">
                    총 <span id="volunteer-count" class="font-bold text-blue-600">${activities.length}</span>건
                </div>
                </div>
            </div>
        `;
        
        // 테이블 렌더링
        renderVolunteerActivitiesTable(activities);
        
    } catch (error) {
        console.error('Failed to load volunteer activities:', error);
        alert('봉사활동 목록을 불러오는데 실패했습니다.');
    }
}

// 봉사활동 목록 렌더링
function renderVolunteerActivitiesTable(activities) {
    const tbody = document.getElementById('volunteer-activities-tbody');
    const statsDiv = document.getElementById('volunteer-stats');
    const countSpan = document.getElementById('volunteer-count');
    
    if (!tbody || !statsDiv || !countSpan) return;
    
    // 통계 업데이트
    const totalHours = activities.reduce((sum, a) => sum + parseFloat(a.hours || 0), 0);
    statsDiv.innerHTML = `
        <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">전체 활동</div>
            <div class="text-2xl font-bold text-green-600">${activities.length}건</div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">총 봉사 시간</div>
            <div class="text-2xl font-bold text-blue-600">${totalHours.toFixed(1)}시간</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-sm text-gray-600">평균 시간</div>
            <div class="text-2xl font-bold text-purple-600">${activities.length > 0 ? (totalHours / activities.length).toFixed(1) : 0}시간</div>
        </div>
    `;
    
    countSpan.textContent = activities.length;
    
    tbody.innerHTML = activities.map(activity => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${activity.student_name}</td>
            <td class="px-6 py-4 text-sm">${activity.activity_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${activity.activity_type ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">${activity.activity_type}</span>` : '-'}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">${activity.organization || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${activity.activity_date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">${activity.hours}시간</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="editVolunteer(${activity.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteVolunteer(${activity.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 봉사활동 필터링
function filterVolunteerActivities() {
    const searchText = document.getElementById('volunteer-search-input').value.toLowerCase();
    const typeFilter = document.getElementById('volunteer-type-filter').value;
    const dateFrom = document.getElementById('volunteer-date-from').value;
    const dateTo = document.getElementById('volunteer-date-to').value;
    
    let filtered = window.allVolunteerActivities;
    
    // 검색어 필터
    if (searchText) {
        filtered = filtered.filter(a => 
            a.student_name.toLowerCase().includes(searchText) || 
            a.activity_name.toLowerCase().includes(searchText)
        );
    }
    
    // 유형 필터
    if (typeFilter) {
        filtered = filtered.filter(a => a.activity_type === typeFilter);
    }
    
    // 날짜 필터
    if (dateFrom) {
        filtered = filtered.filter(a => a.activity_date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(a => a.activity_date <= dateTo);
    }
    
    window.filteredVolunteerActivities = filtered;
    renderVolunteerActivitiesTable(filtered);
}

// 동아리 관리 화면
async function showClubManagement(container) {
    try {
        const response = await axios.get('/api/clubs', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const clubs = response.data.clubs;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">동아리 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-700">전체 동아리 목록</h2>
                    <button onclick="showAddClubForm()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>동아리 추가
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${clubs.map(club => `
                        <div class="border rounded-lg p-6 hover:shadow-lg transition">
                            <h3 class="text-lg font-bold text-gray-800 mb-2">${club.name}</h3>
                            <p class="text-sm text-gray-600 mb-4">${club.description || '설명 없음'}</p>
                            <div class="text-sm space-y-1">
                                <div class="flex items-center text-gray-700">
                                    <i class="fas fa-user-tie w-5"></i>
                                    <span>지도교사: ${club.advisor_name || '미지정'}</span>
                                </div>
                                <div class="flex items-center text-gray-700">
                                    <i class="fas fa-calendar w-5"></i>
                                    <span>${club.semester_name}</span>
                                </div>
                                <div class="flex items-center text-gray-700">
                                    <i class="fas fa-users w-5"></i>
                                    <span>정원: ${club.max_members}명</span>
                                </div>
                            </div>
                            <button onclick="viewClubMembers(${club.id}, '${club.name}')" 
                                    class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                회원 보기
                            </button>
                        </div>
                    `).join('')}
                </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load clubs:', error);
        alert('동아리 목록을 불러오는데 실패했습니다.');
    }
}

// 동아리 회원 보기
async function viewClubMembers(clubId, clubName) {
    try {
        const response = await axios.get(`/api/clubs/${clubId}/members`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const members = response.data.members;
        const memberList = members.map(m => 
            `${m.student_name} (${m.student_number}) - ${m.role === 'president' ? '회장' : m.role === 'vice_president' ? '부회장' : '회원'}`
        ).join('\n');
        
        alert(`${clubName} 회원 목록\n\n${memberList || '회원이 없습니다.'}`);
    } catch (error) {
        console.error('Failed to load club members:', error);
        alert('회원 목록을 불러오는데 실패했습니다.');
    }
}

// 반 관리 화면
// 반 목록 보기 모드 (localStorage에 저장)
function getClassViewMode() {
    return localStorage.getItem('classViewMode') || 'card';
}

function setClassViewMode(mode) {
    localStorage.setItem('classViewMode', mode);
}

async function showClassManagement(container) {
    try {
        // 교사인 경우 담임인 반만 조회
        let url = '/api/classes';
        if (currentUser.role === 'teacher' && window.currentTeacher) {
            // 담임인 반 조회 (teacher_homeroom 테이블 사용)
            const homeroomResponse = await axios.get(`/api/teacher-homeroom?teacher_id=${window.currentTeacher.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            const homeroomClasses = (homeroomResponse.data.homerooms || []).map(h => h.class_id);
            if (homeroomClasses.length > 0) {
                url += `?class_ids=${homeroomClasses.join(',')}`;
            } else {
                // 담임인 반이 없으면 빈 배열 반환
                container.innerHTML = `
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800 mb-8">반 관리</h1>
                        <div class="bg-white rounded-lg shadow p-6">
                            <p class="text-gray-500 text-center py-8">담당 반이 없습니다.</p>
                        </div>
                    </div>
                `;
                return;
            }
        }
        
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        let classes = response.data.classes || [];
        
        // class_ids로 필터링된 경우
        if (currentUser.role === 'teacher' && window.currentTeacher && url.includes('class_ids')) {
            const classIds = url.split('class_ids=')[1].split(',').map(id => parseInt(id));
            classes = classes.filter(c => classIds.includes(c.id));
        }
        const viewMode = getClassViewMode();
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">반 관리</h1>
                
                <div class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-700">${currentUser.role === 'teacher' ? '담당 반 목록' : '전체 반 목록'}</h2>
                    <div class="flex gap-2">
                        <!-- 보기 모드 전환 버튼 -->
                        <div class="flex bg-gray-100 rounded-lg p-1">
                            <button onclick="toggleClassView('card')" 
                                    id="view-card-btn"
                                    class="px-3 py-2 rounded ${viewMode === 'card' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}">
                                <i class="fas fa-th-large mr-1"></i>카드형
                            </button>
                            <button onclick="toggleClassView('list')" 
                                    id="view-list-btn"
                                    class="px-3 py-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}">
                                <i class="fas fa-list mr-1"></i>리스트형
                            </button>
                        </div>
                        ${currentUser.role !== 'teacher' ? `
                            <button onclick="showBulkStudentTransfer()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                <i class="fas fa-exchange-alt mr-2"></i>학생 소속 일괄 변경
                            </button>
                            <button onclick="navigateToPage('class-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                <i class="fas fa-plus mr-2"></i>반 추가
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div id="classes-container">
                    ${renderClassesView(classes, viewMode)}
                </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load classes:', error);
        alert('반 목록을 불러오는데 실패했습니다.');
    }
}

// 반 목록 렌더링
function renderClassesView(classes, viewMode) {
    if (viewMode === 'list') {
        // 리스트형
        return `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반 이름</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학년</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담임</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">교실</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학기</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classes.map(cls => {
                            // 학년별 색상 정의
                            const gradeColors = {
                                1: 'bg-blue-100 text-blue-800',
                                2: 'bg-green-100 text-green-800',
                                3: 'bg-purple-100 text-purple-800'
                            };
                            const gradeColor = gradeColors[cls.grade] || 'bg-gray-100 text-gray-800';
                            
                            return `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${cls.name}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${gradeColor}">
                                        ${cls.grade}학년
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-700">${cls.teacher_name || '미지정'}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-700">${cls.room_number || '-'}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                        ${cls.semester_name}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="showClassDetail(${cls.id})" 
                                            class="text-blue-600 hover:text-blue-900">
                                        상세 보기 <i class="fas fa-arrow-right ml-1"></i>
                                    </button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        // 카드형 (기본)
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${classes.map(cls => `
                    <div class="border rounded-lg p-6 hover:shadow-lg transition">
                        <h3 class="text-lg font-bold text-gray-800 mb-2">${cls.name}</h3>
                        <div class="text-sm space-y-2">
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-graduation-cap w-5"></i>
                                <span>${cls.grade}학년</span>
                            </div>
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-user-tie w-5"></i>
                                <span>담임: ${cls.teacher_name || '미지정'}</span>
                            </div>
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-door-open w-5"></i>
                                <span>${cls.room_number || '교실 미지정'}</span>
                            </div>
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-calendar w-5"></i>
                                <span>${cls.semester_name}</span>
                            </div>
                        </div>
                        <button onclick="showClassDetail(${cls.id})" 
                                class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-arrow-right mr-2"></i>상세 보기
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// 반 상세 페이지
async function showClassDetail(classId) {
    try {
        // 반 정보, 학생 목록, 과목 목록 가져오기
        const [classRes, studentsRes] = await Promise.all([
            axios.get(`/api/classes/${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const classInfo = classRes.data.class || classRes.data;
        const students = studentsRes.data.students || [];
        
        const contentArea = document.getElementById('main-content');
        if (!contentArea) {
            console.error('main-content 요소를 찾을 수 없습니다.');
            return;
        }
        
        contentArea.innerHTML = `
            <div>
                <!-- 헤더 -->
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('classes')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold text-gray-800">${classInfo.name}</h1>
                        <p class="text-gray-600 mt-1">${classInfo.grade}학년 · ${classInfo.semester_name} · 담임: ${classInfo.teacher_name || '미지정'}</p>
                    </div>
                </div>
                
                <!-- 탭 메뉴 -->
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="border-b border-gray-200">
                        <nav class="flex">
                            <button onclick="switchClassTab('students')" id="class-tab-students" 
                                    class="class-tab px-6 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600">
                                <i class="fas fa-user-graduate mr-2"></i>학생 관리
                            </button>
                            <button onclick="switchClassTab('attendance')" id="class-tab-attendance" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-clipboard-check mr-2"></i>출석
                            </button>
                            <button onclick="switchClassTab('grades')" id="class-tab-grades" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-chart-line mr-2"></i>성적
                            </button>
                            <button onclick="switchClassTab('awards')" id="class-tab-awards" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-trophy mr-2"></i>수상
                            </button>
                            <button onclick="switchClassTab('reading')" id="class-tab-reading" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-book-reader mr-2"></i>독서활동
                            </button>
                            <button onclick="switchClassTab('volunteer')" id="class-tab-volunteer" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-hands-helping mr-2"></i>봉사활동
                            </button>
                            <button onclick="switchClassTab('counseling')" id="class-tab-counseling" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-comments mr-2"></i>상담기록
                            </button>
                            <button onclick="switchClassTab('schedule')" id="class-tab-schedule" 
                                    class="class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
                                <i class="fas fa-calendar-alt mr-2"></i>시간표
                            </button>
                        </nav>
                    </div>
                    
                    <!-- 탭 콘텐츠 -->
                    <div class="p-6">
                        <!-- 학생 관리 탭 -->
                        <div id="class-content-students" class="class-tab-content">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">학생 목록 (${students.length}명)</h2>
                            </div>
                            
                            ${students.length === 0 ? `
                                <div class="text-center py-12 text-gray-400">
                                    <i class="fas fa-user-graduate text-6xl mb-4"></i>
                                    <p class="text-lg">등록된 학생이 없습니다</p>
                                </div>
                            ` : `
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생명</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            ${students.map(student => `
                                                <tr class="hover:bg-gray-50">
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.name}</td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.student_number}</td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.email || '-'}</td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button onclick="viewStudentDetail(${student.id})" class="text-blue-600 hover:text-blue-800">
                                                            <i class="fas fa-eye"></i> 상세
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </div>
                        
                        <!-- 출석 탭 -->
                        <div id="class-content-attendance" class="class-tab-content hidden">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">반 학생 출석 관리</h2>
                                <button onclick="navigateToPage('attendance')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    <i class="fas fa-clipboard-check mr-2"></i>출석 페이지로 이동
                                </button>
                            </div>
                            <div id="class-attendance-summary">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- 성적 탭 -->
                        <div id="class-content-grades" class="class-tab-content hidden">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">반 학생 성적 관리</h2>
                                <button onclick="navigateToPage('grades')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    <i class="fas fa-chart-line mr-2"></i>성적 페이지로 이동
                                </button>
                            </div>
                            <div id="class-grades-summary">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- 수상 탭 -->
                        <div id="class-content-awards" class="class-tab-content hidden">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">반 학생 수상 내역</h2>
                                <button onclick="navigateToPage('awards-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-2"></i>수상 추가
                                </button>
                            </div>
                            <div id="class-awards-list">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- 독서활동 탭 -->
                        <div id="class-content-reading" class="class-tab-content hidden">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">반 학생 독서활동</h2>
                                <button onclick="navigateToPage('reading-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-2"></i>독서활동 추가
                                </button>
                            </div>
                            <div id="class-reading-list">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- 봉사활동 탭 -->
                        <div id="class-content-volunteer" class="class-tab-content hidden">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">반 학생 봉사활동</h2>
                                <button onclick="navigateToPage('volunteer-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-2"></i>봉사활동 추가
                                </button>
                            </div>
                            <div id="class-volunteer-list">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- 상담기록 탭 -->
                        <div id="class-content-counseling" class="class-tab-content hidden">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold text-gray-700">반 학생 상담기록</h2>
                                <button onclick="navigateToPage('counseling-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    <i class="fas fa-plus mr-2"></i>상담기록 추가
                                </button>
                            </div>
                            <div id="class-counseling-list">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                        
                        <!-- 시간표 탭 -->
                        <div id="class-content-schedule" class="class-tab-content hidden">
                            <div id="class-schedule-view">
                                <p class="text-gray-500 text-center py-8">로딩 중...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 현재 반 ID 저장
        window.currentClassId = classId;
        
    } catch (error) {
        console.error('반 상세 정보 로드 실패:', error);
        alert('반 정보를 불러오는데 실패했습니다.');
    }
}

// 반 상세 페이지 탭 전환
function switchClassTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.class-tab').forEach(tab => {
        tab.className = 'class-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent';
    });
    
    // 선택된 탭 활성화
    const selectedTab = document.getElementById(`class-tab-${tabName}`);
    if (selectedTab) {
        selectedTab.className = 'class-tab px-6 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600';
    }
    
    // 모든 콘텐츠 숨기기
    document.querySelectorAll('.class-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // 선택된 탭 콘텐츠 보이기
    const selectedContent = document.getElementById(`class-content-${tabName}`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
        
        // 데이터 로드
        if (tabName === 'attendance') {
            loadClassAttendance(window.currentClassId);
        } else if (tabName === 'grades') {
            loadClassGrades(window.currentClassId);
        } else if (tabName === 'awards') {
            loadClassAwards(window.currentClassId);
        } else if (tabName === 'reading') {
            loadClassReading(window.currentClassId);
        } else if (tabName === 'volunteer') {
            loadClassVolunteer(window.currentClassId);
        } else if (tabName === 'counseling') {
            loadClassCounseling(window.currentClassId);
        } else if (tabName === 'schedule') {
            loadClassSchedule(window.currentClassId);
        }
    }
}

// 반별 출석 요약 로드
async function loadClassAttendance(classId) {
    try {
        const [studentsRes, attendanceRes] = await Promise.all([
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/attendance?limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const students = studentsRes.data.students || [];
        const allAttendance = attendanceRes.data.attendance || [];
        const studentIds = students.map(s => s.id);
        const classAttendance = allAttendance.filter(a => studentIds.includes(a.student_id));
        
        // 학생별 출석 통계 계산
        const attendanceStats = {};
        students.forEach(student => {
            attendanceStats[student.id] = {
                student_name: student.name,
                student_number: student.student_number,
                present: 0,
                late: 0,
                absent: 0,
                excused: 0,
                total: 0
            };
        });
        
        classAttendance.forEach(record => {
            if (attendanceStats[record.student_id]) {
                attendanceStats[record.student_id].total++;
                if (record.status === 'present') attendanceStats[record.student_id].present++;
                else if (record.status === 'late') attendanceStats[record.student_id].late++;
                else if (record.status === 'absent') attendanceStats[record.student_id].absent++;
                else if (record.status === 'excused') attendanceStats[record.student_id].excused++;
            }
        });
        
        const container = document.getElementById('class-attendance-summary');
        const statsArray = Object.values(attendanceStats);
        
        if (statsArray.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">학생이 없습니다</p>';
        } else {
            container.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">출석</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">지각</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">결석</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">병결</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">합계</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${statsArray.map(stat => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${stat.student_number}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${stat.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">${stat.present}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600">${stat.late}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">${stat.absent}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600">${stat.excused}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold">${stat.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('출석 요약 로드 실패:', error);
        document.getElementById('class-attendance-summary').innerHTML = '<p class="text-red-500 text-center py-8">로드 실패</p>';
    }
}

// 반별 성적 요약 로드
async function loadClassGrades(classId) {
    try {
        const [studentsRes, gradesRes] = await Promise.all([
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/grades?limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const students = studentsRes.data.students || [];
        const allGrades = gradesRes.data.grades || [];
        const studentIds = students.map(s => s.id);
        const classGrades = allGrades.filter(g => studentIds.includes(g.student_id));
        
        // 학생별 성적 통계 계산
        const gradeStats = {};
        students.forEach(student => {
            gradeStats[student.id] = {
                student_name: student.name,
                student_number: student.student_number,
                subjects: [],
                average: 0,
                count: 0
            };
        });
        
        classGrades.forEach(grade => {
            if (gradeStats[grade.student_id]) {
                gradeStats[grade.student_id].subjects.push({
                    subject: grade.subject_name,
                    score: grade.score,
                    grade: grade.grade
                });
                gradeStats[grade.student_id].average += grade.score;
                gradeStats[grade.student_id].count++;
            }
        });
        
        // 평균 계산
        Object.values(gradeStats).forEach(stat => {
            if (stat.count > 0) {
                stat.average = (stat.average / stat.count).toFixed(2);
            }
        });
        
        const container = document.getElementById('class-grades-summary');
        const statsArray = Object.values(gradeStats);
        
        if (statsArray.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">학생이 없습니다</p>';
        } else {
            container.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">과목 수</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">평균 점수</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">최근 과목</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${statsArray.map(stat => {
                            const recentSubjects = stat.subjects.slice(-3).map(s => `${s.subject}(${s.score})`).join(', ');
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">${stat.student_number}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${stat.student_name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${stat.count}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${stat.average >= 90 ? 'text-green-600' : stat.average >= 80 ? 'text-blue-600' : stat.average >= 70 ? 'text-yellow-600' : 'text-red-600'}">${stat.average || '-'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-600">${recentSubjects || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('성적 요약 로드 실패:', error);
        document.getElementById('class-grades-summary').innerHTML = '<p class="text-red-500 text-center py-8">로드 실패</p>';
    }
}

// 반별 수상 내역 로드
async function loadClassAwards(classId) {
    try {
        const [studentsRes, awardsRes] = await Promise.all([
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/awards?limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const students = studentsRes.data.students || [];
        const allAwards = awardsRes.data.awards || [];
        const studentIds = students.map(s => s.id);
        const classAwards = allAwards.filter(a => studentIds.includes(a.student_id));
        
        const container = document.getElementById('class-awards-list');
        if (classAwards.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">수상 내역이 없습니다</p>';
        } else {
            container.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수상명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">분야</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등급</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수상일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classAwards.map(award => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${award.award_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.award_category || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.award_level || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${award.award_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onclick="editAward(${award.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteAward(${award.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('수상 내역 로드 실패:', error);
        document.getElementById('class-awards-list').innerHTML = '<p class="text-red-500 text-center py-8">로드 실패</p>';
    }
}

// 반별 독서활동 로드
async function loadClassReading(classId) {
    try {
        const [studentsRes, readingRes] = await Promise.all([
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/reading?limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const students = studentsRes.data.students || [];
        const allReading = readingRes.data.reading_activities || [];
        const studentIds = students.map(s => s.id);
        const classReading = allReading.filter(r => studentIds.includes(r.student_id));
        
        const container = document.getElementById('class-reading-list');
        if (classReading.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">독서활동이 없습니다</p>';
        } else {
            container.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도서명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">저자</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">독서일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classReading.map(reading => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${reading.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${reading.book_title}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${reading.author || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${reading.read_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onclick="editReading(${reading.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteReading(${reading.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('독서활동 로드 실패:', error);
        document.getElementById('class-reading-list').innerHTML = '<p class="text-red-500 text-center py-8">로드 실패</p>';
    }
}

// 반별 봉사활동 로드
async function loadClassVolunteer(classId) {
    try {
        const [studentsRes, volunteerRes] = await Promise.all([
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/volunteer?limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const students = studentsRes.data.students || [];
        const allVolunteer = volunteerRes.data.activities || [];
        const studentIds = students.map(s => s.id);
        const classVolunteer = allVolunteer.filter(v => studentIds.includes(v.student_id));
        
        const container = document.getElementById('class-volunteer-list');
        if (classVolunteer.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">봉사활동이 없습니다</p>';
        } else {
            container.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">활동명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기관</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">활동일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classVolunteer.map(volunteer => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${volunteer.activity_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.organization || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.activity_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${volunteer.hours}시간</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onclick="editVolunteer(${volunteer.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteVolunteer(${volunteer.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('봉사활동 로드 실패:', error);
        document.getElementById('class-volunteer-list').innerHTML = '<p class="text-red-500 text-center py-8">로드 실패</p>';
    }
}

// 반별 상담기록 로드
async function loadClassCounseling(classId) {
    try {
        const [studentsRes, counselingRes] = await Promise.all([
            axios.get(`/api/students?class_id=${classId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/counseling?limit=1000', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const students = studentsRes.data.students || [];
        const allCounseling = counselingRes.data.records || [];
        const studentIds = students.map(s => s.id);
        const classCounseling = allCounseling.filter(c => studentIds.includes(c.student_id));
        
        const container = document.getElementById('class-counseling-list');
        if (classCounseling.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">상담기록이 없습니다</p>';
        } else {
            container.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담일</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주제</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${classCounseling.map(counseling => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.student_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.counseling_date}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">${counseling.counseling_type || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${counseling.topic}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onclick="editCounseling(${counseling.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteCounseling(${counseling.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('상담기록 로드 실패:', error);
        document.getElementById('class-counseling-list').innerHTML = '<p class="text-red-500 text-center py-8">로드 실패</p>';
    }
}

// editClassSchedule는 schedule-management.js에 정의됨

// 보기 모드 전환
async function toggleClassView(mode) {
    setClassViewMode(mode);
    
    // 반 목록 다시 로드
    const response = await axios.get('/api/classes', {
        headers: { 'Authorization': 'Bearer ' + authToken }
    });
    
    const classes = response.data.classes;
    const container = document.getElementById('classes-container');
    container.innerHTML = renderClassesView(classes, mode);
    
    // 버튼 스타일 업데이트
    const cardBtn = document.getElementById('view-card-btn');
    const listBtn = document.getElementById('view-list-btn');
    
    if (mode === 'card') {
        cardBtn.className = 'px-3 py-2 rounded bg-white shadow text-blue-600';
        listBtn.className = 'px-3 py-2 rounded text-gray-600 hover:text-gray-800';
    } else {
        listBtn.className = 'px-3 py-2 rounded bg-white shadow text-blue-600';
        cardBtn.className = 'px-3 py-2 rounded text-gray-600 hover:text-gray-800';
    }
}

// 반 학생 보기
async function viewClassStudents(classId, className) {
    try {
        const response = await axios.get(`/api/classes/${classId}/students`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const students = response.data.students;
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">${className} 학생 목록</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="mb-4 text-sm text-gray-600">총 ${students.length}명</div>
                
                ${students.length > 0 ? `
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${students.map(s => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">${s.student_number}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${s.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">${s.phone || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : '<div class="text-center py-12 text-gray-500">학생이 없습니다.</div>'}
                
                <div class="flex justify-end mt-6">
                    <button onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        닫기
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Failed to load class students:', error);
        alert('학생 목록을 불러오는데 실패했습니다.');
    }
}

// 반 추가 폼
async function showAddClassForm() {
    try {
        const [semestersRes, teachersRes] = await Promise.all([
            axios.get('/api/semesters', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/users?role=teacher&limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        // 교사 ID를 teachers 테이블에서 가져오기
        const teacherDetailsPromises = teachersRes.data.users.map(async (user) => {
            const res = await axios.get(`/api/users/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            return res.data.teacher;
        });
        
        const teacherDetails = await Promise.all(teacherDetailsPromises);
        const teachers = teacherDetails.filter(t => t); // null 제거
        
        const modal = document.createElement('div');
        modal.id = 'student-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">새 반 추가</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="add-class-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">반 이름 *</label>
                            <input type="text" name="name" required placeholder="예: 1학년 1반" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학년 *</label>
                            <select name="grade" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택하세요</option>
                                <option value="1">1학년</option>
                                <option value="2">2학년</option>
                                <option value="3">3학년</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                            <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택하세요</option>
                                ${semestersRes.data.semesters.map(s => `
                                    <option value="${s.id}" ${s.is_current ? 'selected' : ''}>${s.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">담임교사</label>
                            <select name="homeroom_teacher_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택 안함</option>
                                ${teachers.map(t => {
                                    const teacherUser = teachersRes.data.users.find(u => u.id === t.user_id);
                                    return `<option value="${t.id}">${teacherUser?.name || '알 수 없음'}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교실 번호</label>
                            <input type="text" name="room_number" placeholder="예: 101" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">정원</label>
                            <input type="number" name="max_students" value="30" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            추가
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('add-class-form').addEventListener('submit', handleAddClass);
    } catch (error) {
        console.error('Failed to load form:', error);
        alert('폼을 불러오는데 실패했습니다.');
    }
}

// 반 추가 처리
async function handleAddClass(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        await axios.post('/api/classes', {
            name: data.name,
            grade: parseInt(data.grade),
            semester_id: parseInt(data.semester_id),
            homeroom_teacher_id: data.homeroom_teacher_id ? parseInt(data.homeroom_teacher_id) : null,
            room_number: data.room_number || null,
            max_students: data.max_students ? parseInt(data.max_students) : 30
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('반이 성공적으로 추가되었습니다!');
        closeModal();
        navigateToPage('classes');
    } catch (error) {
        console.error('Failed to add class:', error);
        alert('반 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 학생 소속 일괄 변경 (반 관리 페이지에서)
async function showBulkStudentTransfer() {
    try {
        // 모든 학생과 반 정보 가져오기
        const [allStudentsRes, classesRes, semestersRes] = await Promise.all([
            axios.get('/api/students', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/classes', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/semesters', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        const allStudents = allStudentsRes.data.students;
        const classes = classesRes.data.classes;
        const currentSemester = semestersRes.data.semesters.find(s => s.is_current);
        
        if (!currentSemester) {
            alert('현재 활성화된 학기가 없습니다.');
            return;
        }
        
        // 학생들을 현재 반별로 그룹화
        const studentsByClass = {};
        const unassignedStudents = [];
        
        allStudents.forEach(student => {
            // class_name이 null이면 classes에서 찾아서 사용
            const classInfo = student.class_name 
                ? { id: student.class_id, name: student.class_name, grade: student.current_class_grade || student.grade }
                : classes.find(c => c.id === student.class_id);
            
            if (student.class_id && classInfo) {
                if (!studentsByClass[student.class_id]) {
                    studentsByClass[student.class_id] = {
                        classInfo: classInfo,
                        students: []
                    };
                }
                studentsByClass[student.class_id].students.push(student);
            } else {
                unassignedStudents.push(student);
            }
        });
        
        // 학년별로 반 그룹화
        const classesByGrade = {};
        Object.values(studentsByClass).forEach(({ classInfo, students }) => {
            const grade = classInfo.grade || '기타';
            if (!classesByGrade[grade]) {
                classesByGrade[grade] = [];
            }
            classesByGrade[grade].push({ classInfo, students });
        });
        
        // 목표 반 목록 (현재 학기의 반만)
        const targetClasses = classes.filter(c => c.semester_id === currentSemester.id);
        const targetClassesByGrade = {};
        targetClasses.forEach(cls => {
            const grade = cls.grade || '기타';
            if (!targetClassesByGrade[grade]) {
                targetClassesByGrade[grade] = [];
            }
            targetClassesByGrade[grade].push(cls);
        });
        
        // 모달 생성
        const modal = document.createElement('div');
        modal.id = 'bulk-transfer-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                <!-- 헤더 -->
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-exchange-alt mr-2"></i>학생 소속 일괄 변경
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">
                            학생을 선택하고 이동할 반을 선택하세요
                        </p>
                    </div>
                    <button onclick="closeBulkTransferModal()" 
                            class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- 본문 -->
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="grid grid-cols-2 gap-6">
                        <!-- 왼쪽: 현재 소속 트리 -->
                        <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-bold text-gray-800">
                                    <i class="fas fa-sitemap mr-2"></i>현재 소속
                                </h4>
                                <div class="text-xs text-gray-600">
                                    선택: <span id="bulk-selected-count" class="font-bold text-blue-600">0</span>명
                                </div>
                            </div>
                            
                            <div class="space-y-2 max-h-[55vh] overflow-y-auto">
                                ${Object.keys(classesByGrade).sort().map(grade => `
                                    <div class="mb-3">
                                        <div class="flex items-center mb-2">
                                            <button onclick="toggleBulkGrade('bulk-grade-${grade}')" 
                                                    class="text-left font-semibold text-gray-700 hover:text-gray-900 flex items-center">
                                                <i class="fas fa-chevron-down mr-2 text-xs bulk-grade-toggle" id="bulk-toggle-grade-${grade}"></i>
                                                <i class="fas fa-layer-group mr-2 text-blue-600"></i>
                                                ${grade}학년
                                            </button>
                                        </div>
                                        <div id="bulk-grade-${grade}" class="ml-6 space-y-2">
                                            ${classesByGrade[grade].map(({ classInfo, students }) => `
                                                <div class="mb-2">
                                                    <button onclick="toggleBulkClass('bulk-class-${classInfo.id}')"
                                                            class="text-left text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center w-full">
                                                        <i class="fas fa-chevron-down mr-2 text-xs bulk-class-toggle" id="bulk-toggle-class-${classInfo.id}"></i>
                                                        <i class="fas fa-door-open mr-2 text-green-600"></i>
                                                        ${classInfo.name} (${students.length}명)
                                                    </button>
                                                    <div id="bulk-class-${classInfo.id}" class="ml-6 mt-1 space-y-1">
                                                        ${students.map(student => `
                                                            <label class="flex items-center p-2 hover:bg-white rounded cursor-pointer text-sm">
                                                                <input type="checkbox" 
                                                                       class="bulk-student-checkbox mr-2" 
                                                                       value="${student.id}"
                                                                       data-name="${student.name}"
                                                                       data-number="${student.student_number}"
                                                                       data-grade="${student.grade}"
                                                                       onchange="updateBulkSelectedCount()">
                                                                <i class="fas fa-user mr-2 text-gray-400 text-xs"></i>
                                                                <span>${student.name}</span>
                                                                <span class="text-gray-500 text-xs ml-2">(${student.student_number})</span>
                                                            </label>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                                
                                ${unassignedStudents.length > 0 ? `
                                    <div class="mb-3">
                                        <div class="flex items-center mb-2">
                                            <button onclick="toggleBulkClass('bulk-unassigned')"
                                                    class="text-left font-semibold text-gray-700 hover:text-gray-900 flex items-center">
                                                <i class="fas fa-chevron-down mr-2 text-xs bulk-class-toggle" id="bulk-toggle-unassigned"></i>
                                                <i class="fas fa-user-slash mr-2 text-red-600"></i>
                                                미소속 (${unassignedStudents.length}명)
                                            </button>
                                        </div>
                                        <div id="bulk-unassigned" class="ml-6 space-y-1">
                                            ${unassignedStudents.map(student => `
                                                <label class="flex items-center p-2 hover:bg-white rounded cursor-pointer text-sm">
                                                    <input type="checkbox" 
                                                           class="bulk-student-checkbox mr-2" 
                                                           value="${student.id}"
                                                           data-name="${student.name}"
                                                           data-number="${student.student_number}"
                                                           data-grade="${student.grade}"
                                                           onchange="updateBulkSelectedCount()">
                                                    <i class="fas fa-user mr-2 text-gray-400 text-xs"></i>
                                                    <span>${student.name}</span>
                                                    <span class="text-gray-500 text-xs ml-2">(${student.student_number})</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-gray-300 flex gap-2">
                                <button onclick="selectAllBulkStudents()" 
                                        class="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                    <i class="fas fa-check-double mr-1"></i>전체 선택
                                </button>
                                <button onclick="deselectAllBulkStudents()" 
                                        class="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                                    <i class="fas fa-times mr-1"></i>선택 해제
                                </button>
                            </div>
                        </div>
                        
                        <!-- 오른쪽: 목표 반 선택 (트리 구조) -->
                        <div class="border border-blue-300 rounded-lg p-4 bg-blue-50">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-bold text-gray-800">
                                    <i class="fas fa-arrow-right mr-2 text-blue-600"></i>새로운 소속
                                </h4>
                            </div>
                            
                            <!-- 학년 불일치 경고 -->
                            <div id="grade-warning" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3" style="display:none;">
                                <div class="flex items-start">
                                    <i class="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
                                    <div class="text-xs text-yellow-800">
                                        <p class="font-semibold mb-1">학년이 다른 학생들이 선택되었습니다</p>
                                        <p>학생은 자신의 학년에 해당하는 반에만 배정할 수 있습니다.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 반 트리 구조 -->
                            <div class="bg-white rounded-lg p-3 mb-3 max-h-[50vh] overflow-y-auto">
                                <p class="text-xs font-semibold text-gray-700 mb-2">${currentSemester.name}</p>
                                <div class="space-y-1">
                                    ${Object.keys(targetClassesByGrade).sort().map(grade => `
                                        <div class="mb-2">
                                            <button onclick="toggleTargetGrade('target-grade-${grade}')" 
                                                    class="text-left font-semibold text-gray-700 hover:text-gray-900 flex items-center text-sm w-full">
                                                <i class="fas fa-chevron-down mr-2 text-xs target-grade-toggle" id="target-toggle-grade-${grade}"></i>
                                                <i class="fas fa-layer-group mr-2 text-blue-600"></i>
                                                ${grade}학년
                                            </button>
                                            <div id="target-grade-${grade}" class="ml-6 mt-1 space-y-1">
                                                ${targetClassesByGrade[grade].map(cls => `
                                                    <label class="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer text-sm">
                                                        <input type="radio" 
                                                               name="target-class" 
                                                               value="${cls.id}"
                                                               data-name="${cls.name}"
                                                               data-grade="${cls.grade}"
                                                               data-teacher="${cls.teacher_name || '미배정'}"
                                                               onchange="updateTargetClassDisplay()"
                                                               class="mr-2">
                                                        <i class="fas fa-door-open mr-2 text-green-600 text-xs"></i>
                                                        <span class="flex-1">${cls.name}</span>
                                                        <span class="text-xs text-gray-500">${cls.teacher_name || '미배정'}</span>
                                                    </label>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <!-- 선택된 반 정보 -->
                            <div id="bulk-target-class-info" class="bg-white rounded-lg p-3 mb-3 border border-blue-200" style="display:none;">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-door-open text-blue-600 mr-2"></i>
                                        <div>
                                            <p class="font-semibold text-gray-800 text-sm" id="target-class-name"></p>
                                            <p class="text-xs text-gray-600" id="target-class-info"></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 선택된 학생 목록 -->
                            <div class="bg-white rounded-lg p-3 max-h-[20vh] overflow-y-auto">
                                <h5 class="font-semibold text-gray-700 mb-2 text-sm">
                                    <i class="fas fa-users mr-2"></i>이동할 학생
                                </h5>
                                <div id="bulk-selected-students-list" class="space-y-1 text-sm text-gray-500">
                                    <p class="text-center py-2 text-xs">학생을 선택해주세요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 푸터 -->
                <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-2"></i>
                        선택한 학생들의 현재 학기(${currentSemester.name}) 소속이 변경됩니다
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="closeBulkTransferModal()"
                                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                        <button onclick="submitBulkTransfer()"
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-check mr-2"></i>선택한 학생 이동
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 전역 변수 저장
        window.bulkTransferSemesterId = currentSemester.id;
        
    } catch (error) {
        console.error('학생 목록 로드 실패:', error);
        alert('학생 목록을 불러오는데 실패했습니다.');
    }
}

// 일괄 변경 모달 닫기
function closeBulkTransferModal() {
    const modal = document.getElementById('bulk-transfer-modal');
    if (modal) modal.remove();
}

// 학년 토글 (일괄 변경)
function toggleBulkGrade(gradeId) {
    const gradeDiv = document.getElementById(gradeId);
    const toggleIcon = document.getElementById('bulk-toggle-' + gradeId);
    
    if (gradeDiv.style.display === 'none') {
        gradeDiv.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-down mr-2 text-xs bulk-grade-toggle';
    } else {
        gradeDiv.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-right mr-2 text-xs bulk-grade-toggle';
    }
}

// 반 토글 (일괄 변경)
function toggleBulkClass(classId) {
    const classDiv = document.getElementById(classId);
    const toggleIcon = document.getElementById('bulk-toggle-' + classId);
    
    if (classDiv.style.display === 'none') {
        classDiv.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-down mr-2 text-xs bulk-class-toggle';
    } else {
        classDiv.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-right mr-2 text-xs bulk-class-toggle';
    }
}

// 선택된 학생 수 업데이트 (일괄 변경)
function updateBulkSelectedCount() {
    const checkboxes = document.querySelectorAll('.bulk-student-checkbox:checked');
    const count = checkboxes.length;
    document.getElementById('bulk-selected-count').textContent = count;
    
    // 선택된 학생 목록 표시
    const listContainer = document.getElementById('bulk-selected-students-list');
    if (count === 0) {
        listContainer.innerHTML = '<p class="text-center py-4">학생을 선택해주세요</p>';
    } else {
        listContainer.innerHTML = Array.from(checkboxes).map(cb => `
            <div class="flex items-center p-2 bg-blue-50 rounded">
                <i class="fas fa-user mr-2 text-blue-600 text-xs"></i>
                <span class="font-medium">${cb.dataset.name}</span>
                <span class="text-gray-500 text-xs ml-2">(${cb.dataset.number})</span>
            </div>
        `).join('');
    }
    
    // 선택된 학생들의 학년 확인 및 반 필터링
    const selectedGrades = new Set(Array.from(checkboxes).map(cb => cb.dataset.grade).filter(g => g));
    
    // 모든 학년 div를 숨기기/보이기
    document.querySelectorAll('[id^="target-grade-"]').forEach(gradeDiv => {
        const grade = gradeDiv.id.replace('target-grade-', '');
        const gradeButton = gradeDiv.previousElementSibling;
        
        if (selectedGrades.size === 0 || selectedGrades.has(grade)) {
            // 해당 학년 표시
            gradeButton.style.display = 'flex';
            gradeDiv.parentElement.style.display = 'block';
        } else {
            // 다른 학년 숨기기
            gradeButton.style.display = 'none';
            gradeDiv.parentElement.style.display = 'none';
        }
    });
    
    // 학년이 섞여있으면 경고 표시
    if (selectedGrades.size > 1) {
        const warningDiv = document.getElementById('grade-warning');
        if (warningDiv) {
            warningDiv.style.display = 'block';
        }
    } else {
        const warningDiv = document.getElementById('grade-warning');
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
    }
}

// 전체 선택 (일괄 변경)
function selectAllBulkStudents() {
    document.querySelectorAll('.bulk-student-checkbox').forEach(cb => {
        cb.checked = true;
    });
    updateBulkSelectedCount();
}

// 선택 해제 (일괄 변경)
function deselectAllBulkStudents() {
    document.querySelectorAll('.bulk-student-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateBulkSelectedCount();
}

// 목표 반 정보 표시 업데이트
// 목표 반 학년 토글
function toggleTargetGrade(gradeId) {
    const gradeDiv = document.getElementById(gradeId);
    const toggleIcon = document.getElementById('target-toggle-' + gradeId);
    
    if (gradeDiv.style.display === 'none') {
        gradeDiv.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-down mr-2 text-xs target-grade-toggle';
    } else {
        gradeDiv.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-right mr-2 text-xs target-grade-toggle';
    }
}

// 목표 반 정보 표시 업데이트 (심플하게)
function updateTargetClassDisplay() {
    const selectedRadio = document.querySelector('input[name="target-class"]:checked');
    const infoDiv = document.getElementById('bulk-target-class-info');
    const nameSpan = document.getElementById('target-class-name');
    const infoSpan = document.getElementById('target-class-info');
    
    if (selectedRadio) {
        infoDiv.style.display = 'block';
        nameSpan.textContent = selectedRadio.dataset.name;
        infoSpan.textContent = `${selectedRadio.dataset.grade}학년 · 담임: ${selectedRadio.dataset.teacher}`;
    } else {
        infoDiv.style.display = 'none';
    }
}

// 일괄 학생 이동 제출
async function submitBulkTransfer() {
    const checkboxes = document.querySelectorAll('.bulk-student-checkbox:checked');
    const selectedRadio = document.querySelector('input[name="target-class"]:checked');
    
    if (checkboxes.length === 0) {
        alert('이동할 학생을 선택해주세요.');
        return;
    }
    
    if (!selectedRadio) {
        alert('이동할 반을 선택해주세요.');
        return;
    }
    
    // 학년 검증
    const targetGrade = parseInt(selectedRadio.dataset.grade);
    const invalidStudents = Array.from(checkboxes).filter(cb => {
        const studentGrade = parseInt(cb.dataset.grade);
        return studentGrade && studentGrade !== targetGrade;
    });
    
    if (invalidStudents.length > 0) {
        const invalidNames = invalidStudents.map(cb => cb.dataset.name).join(', ');
        alert(`학년이 맞지 않는 학생이 있습니다.\n${targetGrade}학년 반에는 ${targetGrade}학년 학생만 배정할 수 있습니다.\n\n학년이 다른 학생: ${invalidNames}`);
        return;
    }
    
    const studentIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const targetClassId = parseInt(selectedRadio.value);
    const targetClassName = selectedRadio.dataset.name;
    const semesterId = window.bulkTransferSemesterId;
    
    if (!confirm(`선택한 ${studentIds.length}명의 학생을 ${targetClassName} 반으로 이동하시겠습니까?`)) {
        return;
    }
    
    try {
        // 각 학생에 대해 새 배정 생성 (서버에서 기존 배정 자동 비활성화)
        const promises = studentIds.map(async studentId => {
            // 새 배정 생성 (서버에서 기존 배정을 자동으로 비활성화함)
            return axios.post('/api/student-class-history', {
                student_id: studentId,
                class_id: targetClassId,
                semester_id: semesterId,
                start_date: new Date().toISOString().split('T')[0]
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
        });
        
        const results = await Promise.allSettled(promises);
        
        // 성공/실패 카운트
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        if (failed > 0) {
            const failedReasons = results
                .filter(r => r.status === 'rejected')
                .map(r => r.reason?.response?.data?.message || r.reason?.message)
                .join('\n');
            console.error('실패 이유:', failedReasons);
        }
        
        // 결과 메시지
        if (succeeded > 0) {
            if (failed > 0) {
                alert(`${succeeded}명의 학생이 이동되었습니다.\n${failed}명은 실패했습니다. (콘솔 확인)`);
            } else {
                alert(`${succeeded}명의 학생이 ${targetClassName} 반으로 이동되었습니다.`);
            }
            closeBulkTransferModal();
            navigateToPage('classes'); // 반 관리 페이지 새로고침
        } else {
            alert('모든 학생 이동에 실패했습니다. 콘솔을 확인해주세요.');
        }
    } catch (error) {
        console.error('=== 학생 일괄 이동 실패 ===');
        console.error('에러 상세:', error);
        console.error('에러 응답:', error.response?.data);
        alert('학생 이동 중 오류가 발생했습니다.');
    }
}

// ==========================================
// 수상 관리 (Awards Management)
// ==========================================

// 수상 관리 페이지 표시
async function showAwardsManagement(container) {
    try {
        const response = await axios.get('/api/awards?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const awards = response.data.awards || [];
        
        // 전역 변수에 저장
        window.allAwards = awards;
        window.filteredAwards = awards;
        
        container.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-trophy mr-2 text-yellow-500"></i>수상 관리
                    </h1>
                    <button onclick="navigateToPage('awards-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus mr-2"></i>수상 추가
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    ${awards.length === 0 ? `
                        <div class="text-center py-12">
                            <i class="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-600 mb-4">등록된 수상 내역이 없습니다</p>
                            <button onclick="navigateToPage('awards-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                첫 수상 추가하기
                            </button>
                        </div>
                    ` : `
                        <!-- 검색 및 필터 -->
                        <div class="mb-6 flex items-center gap-3">
                            <input type="text" 
                                   id="awards-search-input" 
                                   placeholder="학생 이름 또는 수상명으로 검색..."
                                   class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   oninput="filterAwards()">
                            <select id="awards-category-filter" 
                                    class="px-4 py-2 border border-gray-300 rounded-lg"
                                    onchange="filterAwards()">
                                <option value="">전체 분야</option>
                                <option value="학업우수상">학업우수상</option>
                                <option value="봉사상">봉사상</option>
                                <option value="체육상">체육상</option>
                                <option value="예술상">예술상</option>
                                <option value="모범상">모범상</option>
                                <option value="기타">기타</option>
                            </select>
                            <select id="awards-level-filter" 
                                    class="px-4 py-2 border border-gray-300 rounded-lg"
                                    onchange="filterAwards()">
                                <option value="">전체 등급</option>
                                <option value="교내">교내</option>
                                <option value="지역">지역</option>
                                <option value="전국">전국</option>
                                <option value="국제">국제</option>
                            </select>
                            <input type="date" 
                                   id="awards-date-from" 
                                   class="px-4 py-2 border border-gray-300 rounded-lg"
                                   onchange="filterAwards()">
                            <span class="text-gray-500">~</span>
                            <input type="date" 
                                   id="awards-date-to" 
                                   class="px-4 py-2 border border-gray-300 rounded-lg"
                                   onchange="filterAwards()">
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수상명</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">분류</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수준</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수상일</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200" id="awards-tbody"></tbody>
                            </table>
                        </div>
                        
                        <div class="mt-4 text-sm text-gray-600">
                            총 <span id="awards-count" class="font-bold text-blue-600">${awards.length}</span>건
                        </div>
                    `}
                </div>
            </div>
        `;
        
        // 테이블 렌더링
        if (awards.length > 0) {
            renderAwardsTable(awards);
        }
        
    } catch (error) {
        console.error('수상 관리 로드 실패:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>수상 관리를 불러올 수 없습니다</p>
            </div>
        `;
    }
}

// 수상 목록 렌더링
function renderAwardsTable(awards) {
    const tbody = document.getElementById('awards-tbody');
    const countSpan = document.getElementById('awards-count');
    
    if (!tbody || !countSpan) return;
    
    countSpan.textContent = awards.length;
    
    tbody.innerHTML = awards.map(award => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${award.student_name || '-'}</div>
                <div class="text-xs text-gray-500">${award.student_number || '-'}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">${award.award_name}</td>
            <td class="px-6 py-4">
                ${award.award_category ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">${award.award_category}</span>` : '-'}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    award.award_level === '국제' ? 'bg-purple-100 text-purple-800' :
                    award.award_level === '전국' ? 'bg-green-100 text-green-800' :
                    award.award_level === '지역' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${award.award_level || '-'}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${award.award_date || '-'}</td>
            <td class="px-6 py-4 text-sm">
                <button onclick="editAward(${award.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAward(${award.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 수상 필터링
function filterAwards() {
    const searchText = document.getElementById('awards-search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('awards-category-filter').value;
    const levelFilter = document.getElementById('awards-level-filter').value;
    const dateFrom = document.getElementById('awards-date-from').value;
    const dateTo = document.getElementById('awards-date-to').value;
    
    let filtered = window.allAwards;
    
    // 검색어 필터
    if (searchText) {
        filtered = filtered.filter(a => 
            a.student_name.toLowerCase().includes(searchText) || 
            a.award_name.toLowerCase().includes(searchText)
        );
    }
    
    // 분야 필터
    if (categoryFilter) {
        filtered = filtered.filter(a => a.award_category === categoryFilter);
    }
    
    // 등급 필터
    if (levelFilter) {
        filtered = filtered.filter(a => a.award_level === levelFilter);
    }
    
    // 날짜 필터
    if (dateFrom) {
        filtered = filtered.filter(a => a.award_date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(a => a.award_date <= dateTo);
    }
    
    window.filteredAwards = filtered;
    renderAwardsTable(filtered);
}


// editAward와 deleteAward는 add-pages-functions.js에 정의됨

// ==========================================
// 독서활동 관리 (Reading Management)
// ==========================================

// 독서활동 관리 페이지 표시
async function showReadingManagement(container) {
    try {
        const response = await axios.get('/api/reading?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const readings = response.data.reading_activities || [];
        
        // 전역 변수에 저장
        window.allReadings = readings;
        window.filteredReadings = readings;
        
        container.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-book-reader mr-2 text-indigo-600"></i>독서활동 관리
                    </h1>
                    <button onclick="navigateToPage('reading-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus mr-2"></i>독서활동 추가
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    ${readings.length === 0 ? `
                        <div class="text-center py-12">
                            <i class="fas fa-book-reader text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-600 mb-4">등록된 독서활동이 없습니다</p>
                            <button onclick="navigateToPage('reading-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                첫 독서활동 추가하기
                            </button>
                        </div>
                    ` : `
                        <!-- 검색 및 필터 -->
                        <div class="mb-6 flex items-center gap-3">
                            <input type="text" 
                                   id="reading-search-input" 
                                   placeholder="학생 이름, 도서명, 저자로 검색..."
                                   class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   oninput="filterReadings()">
                            <select id="reading-type-filter" 
                                    class="px-4 py-2 border border-gray-300 rounded-lg"
                                    onchange="filterReadings()">
                                <option value="">전체 유형</option>
                                <option value="필독">필독</option>
                                <option value="추천">추천</option>
                                <option value="선택">선택</option>
                            </select>
                            <select id="reading-rating-filter" 
                                    class="px-4 py-2 border border-gray-300 rounded-lg"
                                    onchange="filterReadings()">
                                <option value="">전체 평점</option>
                                <option value="5">⭐⭐⭐⭐⭐</option>
                                <option value="4">⭐⭐⭐⭐</option>
                                <option value="3">⭐⭐⭐</option>
                                <option value="2">⭐⭐</option>
                                <option value="1">⭐</option>
                            </select>
                            <input type="date" 
                                   id="reading-date-from" 
                                   class="px-4 py-2 border border-gray-300 rounded-lg"
                                   onchange="filterReadings()">
                            <span class="text-gray-500">~</span>
                            <input type="date" 
                                   id="reading-date-to" 
                                   class="px-4 py-2 border border-gray-300 rounded-lg"
                                   onchange="filterReadings()">
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도서명</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">저자</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">독서일</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평점</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200" id="reading-tbody"></tbody>
                            </table>
                        </div>
                        
                        <div class="mt-4 text-sm text-gray-600">
                            총 <span id="reading-count" class="font-bold text-blue-600">${readings.length}</span>건
                        </div>
                    `}
                </div>
            </div>
        `;
        
        // 테이블 렌더링
        if (readings.length > 0) {
            renderReadingsTable(readings);
        }
        
    } catch (error) {
        console.error('독서활동 관리 로드 실패:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>독서활동 관리를 불러올 수 없습니다</p>
            </div>
        `;
    }
}

// 독서활동 목록 렌더링
function renderReadingsTable(readings) {
    const tbody = document.getElementById('reading-tbody');
    const countSpan = document.getElementById('reading-count');
    
    if (!tbody || !countSpan) return;
    
    countSpan.textContent = readings.length;
    
    tbody.innerHTML = readings.map(reading => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${reading.student_name || '-'}</div>
                <div class="text-xs text-gray-500">${reading.student_number || '-'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${reading.book_title}</div>
                ${reading.pages ? `<div class="text-xs text-gray-500">${reading.pages}쪽</div>` : ''}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">${reading.author || '-'}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    reading.reading_type === '필독' ? 'bg-red-100 text-red-800' :
                    reading.reading_type === '추천' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                }">
                    ${reading.reading_type || '선택'}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${reading.read_date || '-'}</td>
            <td class="px-6 py-4">
                ${reading.rating ? `
                    <div class="text-yellow-500">
                        ${'★'.repeat(reading.rating)}${'☆'.repeat(5 - reading.rating)}
                    </div>
                ` : '-'}
            </td>
            <td class="px-6 py-4 text-sm">
                <button onclick="editReading(${reading.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteReading(${reading.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 독서활동 필터링
function filterReadings() {
    const searchText = document.getElementById('reading-search-input').value.toLowerCase();
    const typeFilter = document.getElementById('reading-type-filter').value;
    const ratingFilter = document.getElementById('reading-rating-filter').value;
    const dateFrom = document.getElementById('reading-date-from').value;
    const dateTo = document.getElementById('reading-date-to').value;
    
    let filtered = window.allReadings;
    
    // 검색어 필터
    if (searchText) {
        filtered = filtered.filter(r => 
            r.student_name.toLowerCase().includes(searchText) || 
            r.book_title.toLowerCase().includes(searchText) ||
            (r.author && r.author.toLowerCase().includes(searchText))
        );
    }
    
    // 유형 필터
    if (typeFilter) {
        filtered = filtered.filter(r => r.reading_type === typeFilter);
    }
    
    // 평점 필터
    if (ratingFilter) {
        filtered = filtered.filter(r => r.rating >= parseInt(ratingFilter));
    }
    
    // 날짜 필터
    if (dateFrom) {
        filtered = filtered.filter(r => r.read_date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(r => r.read_date <= dateTo);
    }
    
    window.filteredReadings = filtered;
    renderReadingsTable(filtered);
}

// editReading과 deleteReading은 add-pages-functions.js에 정의됨

// ============================================
// 상담기록 관리 화면
// ============================================
async function showCounselingManagement(container) {
    try {
        const response = await axios.get('/api/counseling?limit=100', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const records = response.data.records || [];
        
        container.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-comments mr-2 text-green-600"></i>상담기록 관리
                    </h1>
                    <button onclick="navigateToPage('counseling-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus mr-2"></i>상담기록 추가
                    </button>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    ${records.length === 0 ? `
                        <div class="text-center py-12">
                            <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-600 mb-4">등록된 상담기록이 없습니다</p>
                            <button onclick="navigateToPage('counseling-add')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                첫 상담기록 추가하기
                            </button>
                        </div>
                    ` : `
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담일</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주제</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상담자</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${records.map(record => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4">
                                            <div class="text-sm font-medium text-gray-900">${record.student_name || '-'}</div>
                                            <div class="text-xs text-gray-500">${record.student_number || '-'}</div>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-500">${record.counseling_date || '-'}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 text-xs rounded-full ${
                                                record.counseling_type === '학업' ? 'bg-blue-100 text-blue-800' :
                                                record.counseling_type === '진로' ? 'bg-green-100 text-green-800' :
                                                record.counseling_type === '교우관계' ? 'bg-yellow-100 text-yellow-800' :
                                                record.counseling_type === '가정' ? 'bg-purple-100 text-purple-800' :
                                                record.counseling_type === '심리/정서' ? 'bg-pink-100 text-pink-800' :
                                                'bg-gray-100 text-gray-800'
                                            }">
                                                ${record.counseling_type || '기타'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">${record.topic}</div>
                                            ${record.is_confidential ? '<span class="text-xs text-red-600"><i class="fas fa-lock mr-1"></i>비공개</span>' : ''}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-500">${record.counselor_name || '-'}</td>
                                        <td class="px-6 py-4 text-sm">
                                            <button onclick="editCounseling(${record.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="deleteCounseling(${record.id})" class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('상담기록 관리 로드 실패:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>상담기록 관리를 불러올 수 없습니다</p>
            </div>
        `;
    }
}

// editCounseling과 deleteCounseling은 add-pages-functions.js에 정의됨

// 수상 추가 모달 (완성)
async function showAddAwardModal() {
    try {
        // 학생과 학기 목록 가져오기
        const [studentsRes, semestersRes] = await Promise.all([
            axios.get('/api/students?limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/semesters', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        const students = studentsRes.data.students || [];
        const semesters = semestersRes.data.semesters || [];
        
        const modalHtml = `
            <div id="award-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-trophy text-yellow-500 mr-2"></i>수상 추가
                            </h2>
                            <button onclick="closeAwardModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        
                        <form id="award-form" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">학생 선택 *</label>
                                    <select id="award-student-id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">학생 선택</option>
                                        ${students.map(s => `
                                            <option value="${s.id}">${s.student_number} - ${s.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">학기 선택 *</label>
                                    <select id="award-semester-id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">학기 선택</option>
                                        ${semesters.map(sem => `
                                            <option value="${sem.id}">${sem.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">수상명 *</label>
                                <input type="text" id="award-name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       placeholder="예: 학업우수상">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">수상 분류</label>
                                    <select id="award-category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">분류 선택</option>
                                        <option value="학업우수상">학업우수상</option>
                                        <option value="과학상">과학상</option>
                                        <option value="체육상">체육상</option>
                                        <option value="예술상">예술상</option>
                                        <option value="봉사상">봉사상</option>
                                        <option value="품성상">품성상</option>
                                        <option value="문학상">문학상</option>
                                        <option value="특별상">특별상</option>
                                        <option value="공로상">공로상</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">수상 수준</label>
                                    <select id="award-level" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">수준 선택</option>
                                        <option value="교내">교내</option>
                                        <option value="지역">지역</option>
                                        <option value="전국">전국</option>
                                        <option value="국제">국제</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">수상일 *</label>
                                    <input type="date" id="award-date" required 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">주최기관</label>
                                    <input type="text" id="award-organizer" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           placeholder="예: ○○교육청">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                                <textarea id="award-description" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="수상 내역에 대한 상세 설명"></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-3 mt-6">
                                <button type="button" onclick="closeAwardModal()" 
                                        class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    취소
                                </button>
                                <button type="submit" 
                                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-save mr-2"></i>저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 폼 제출 이벤트
        document.getElementById('award-form').addEventListener('submit', saveAward);
        
    } catch (error) {
        console.error('수상 추가 모달 로드 실패:', error);
        alert('수상 추가 모달을 불러올 수 없습니다.');
    }
}

function closeAwardModal() {
    const modal = document.getElementById('award-modal');
    if (modal) modal.remove();
}

async function saveAward(e) {
    e.preventDefault();
    
    const data = {
        student_id: parseInt(document.getElementById('award-student-id').value),
        semester_id: parseInt(document.getElementById('award-semester-id').value),
        award_name: document.getElementById('award-name').value,
        award_category: document.getElementById('award-category').value || null,
        award_level: document.getElementById('award-level').value || null,
        award_date: document.getElementById('award-date').value,
        organizer: document.getElementById('award-organizer').value || null,
        description: document.getElementById('award-description').value || null
    };
    
    try {
        await axios.post('/api/awards', data, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('수상 내역이 추가되었습니다.');
        closeAwardModal();
        navigateToPage('awards');
    } catch (error) {
        console.error('수상 추가 실패:', error);
        alert('수상 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// 독서활동 추가 모달 (완성)
async function showAddReadingModal() {
    try {
        // 학생과 학기 목록 가져오기
        const [studentsRes, semestersRes] = await Promise.all([
            axios.get('/api/students?limit=1000', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/semesters', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        const students = studentsRes.data.students || [];
        const semesters = semestersRes.data.semesters || [];
        
        const modalHtml = `
            <div id="reading-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-book-reader text-indigo-600 mr-2"></i>독서활동 추가
                            </h2>
                            <button onclick="closeReadingModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        
                        <form id="reading-form" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">학생 선택 *</label>
                                    <select id="reading-student-id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">학생 선택</option>
                                        ${students.map(s => `
                                            <option value="${s.id}">${s.student_number} - ${s.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">학기 선택 *</label>
                                    <select id="reading-semester-id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">학기 선택</option>
                                        ${semesters.map(sem => `
                                            <option value="${sem.id}">${sem.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">도서명 *</label>
                                <input type="text" id="reading-book-title" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       placeholder="예: 총, 균, 쇠">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">저자</label>
                                    <input type="text" id="reading-author" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           placeholder="예: 재레드 다이아몬드">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">출판사</label>
                                    <input type="text" id="reading-publisher" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           placeholder="예: 문학사상">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">독서일 *</label>
                                    <input type="date" id="reading-date" required 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">페이지 수</label>
                                    <input type="number" id="reading-pages" min="0"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           placeholder="300">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">독서 유형</label>
                                    <select id="reading-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">유형 선택</option>
                                        <option value="필독">필독</option>
                                        <option value="추천">추천</option>
                                        <option value="선택">선택</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">줄거리/요약</label>
                                <textarea id="reading-summary" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="책의 주요 내용을 간단히 요약해주세요"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">독후감</label>
                                <textarea id="reading-review" rows="4"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="책을 읽고 느낀 점을 자유롭게 작성해주세요"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">평점</label>
                                <div class="flex items-center gap-2">
                                    <div id="rating-stars" class="flex gap-1 text-3xl cursor-pointer">
                                        <i class="far fa-star" data-rating="1"></i>
                                        <i class="far fa-star" data-rating="2"></i>
                                        <i class="far fa-star" data-rating="3"></i>
                                        <i class="far fa-star" data-rating="4"></i>
                                        <i class="far fa-star" data-rating="5"></i>
                                    </div>
                                    <input type="hidden" id="reading-rating" value="0">
                                    <span class="text-sm text-gray-500" id="rating-text">평점을 선택하세요</span>
                                </div>
                            </div>
                            
                            <div class="flex justify-end gap-3 mt-6">
                                <button type="button" onclick="closeReadingModal()" 
                                        class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    취소
                                </button>
                                <button type="submit" 
                                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-save mr-2"></i>저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 별점 이벤트
        initRatingStars();
        
        // 폼 제출 이벤트
        document.getElementById('reading-form').addEventListener('submit', saveReading);
        
    } catch (error) {
        console.error('독서활동 추가 모달 로드 실패:', error);
        alert('독서활동 추가 모달을 불러올 수 없습니다.');
    }
}

function initRatingStars() {
    const stars = document.querySelectorAll('#rating-stars i');
    const ratingInput = document.getElementById('reading-rating');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            ratingText.textContent = `${rating}점`;
            
            // 별 표시 업데이트
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'text-yellow-500');
                } else {
                    s.classList.remove('fas', 'text-yellow-500');
                    s.classList.add('far');
                }
            });
        });
        
        // 호버 효과
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('text-yellow-300');
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            stars.forEach(s => {
                s.classList.remove('text-yellow-300');
            });
        });
    });
}

function closeReadingModal() {
    const modal = document.getElementById('reading-modal');
    if (modal) modal.remove();
}

async function saveReading(e) {
    e.preventDefault();
    
    const data = {
        student_id: parseInt(document.getElementById('reading-student-id').value),
        semester_id: parseInt(document.getElementById('reading-semester-id').value),
        book_title: document.getElementById('reading-book-title').value,
        author: document.getElementById('reading-author').value || null,
        publisher: document.getElementById('reading-publisher').value || null,
        read_date: document.getElementById('reading-date').value,
        pages: parseInt(document.getElementById('reading-pages').value) || null,
        reading_type: document.getElementById('reading-type').value || null,
        summary: document.getElementById('reading-summary').value || null,
        review: document.getElementById('reading-review').value || null,
        rating: parseInt(document.getElementById('reading-rating').value) || null
    };
    
    try {
        await axios.post('/api/reading', data, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('독서활동이 추가되었습니다.');
        closeReadingModal();
        navigateToPage('reading');
    } catch (error) {
        console.error('독서활동 추가 실패:', error);
        alert('독서활동 추가에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}

// ============================================
// 봉사활동 추가 페이지
// ============================================
async function showVolunteerAddPage(container) {
    try {
        const [studentsRes, semestersRes] = await Promise.all([
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('volunteer')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">봉사활동 등록</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="volunteer-add-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}">${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.is_current ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동명 *</label>
                            <input type="text" name="activity_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">기관/단체</label>
                                <input type="text" name="organization" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동 유형</label>
                                <select name="activity_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="교육">교육</option>
                                    <option value="환경">환경</option>
                                    <option value="복지">복지</option>
                                    <option value="의료">의료</option>
                                    <option value="문화">문화</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동일 *</label>
                                <input type="date" name="activity_date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">시간 (시간) *</label>
                                <input type="number" name="hours" step="0.5" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
                            <input type="text" name="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동 내용</label>
                            <textarea name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">인정 사항</label>
                            <input type="text" name="recognition" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="navigateToPage('volunteer')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('volunteer-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.post('/api/volunteer', data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('봉사활동이 등록되었습니다.');
                navigateToPage('volunteer');
            } catch (error) {
                console.error('봉사활동 등록 실패:', error);
                alert('봉사활동 등록에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load volunteer add page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// ============================================
// 봉사활동 수정 페이지
// ============================================
async function showVolunteerEditPage(container) {
    const volunteerId = window.currentVolunteerId;
    if (!volunteerId) {
        alert('수정할 봉사활동을 선택해주세요.');
        navigateToPage('volunteer');
        return;
    }
    
    try {
        const [volunteerRes, studentsRes, semestersRes] = await Promise.all([
            axios.get(`/api/volunteer/${volunteerId}`, { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/students', { headers: { 'Authorization': 'Bearer ' + authToken } }),
            axios.get('/api/semesters', { headers: { 'Authorization': 'Bearer ' + authToken } })
        ]);
        
        const volunteer = volunteerRes.data;
        
        container.innerHTML = `
            <div>
                <div class="flex items-center mb-8">
                    <button onclick="navigateToPage('volunteer')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-800">봉사활동 수정</h1>
                </div>
                
                <div class="bg-white rounded-lg shadow p-8 max-w-3xl">
                    <form id="volunteer-edit-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학생 *</label>
                                <select name="student_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${studentsRes.data.students.map(s => `<option value="${s.id}" ${s.id == volunteer.student_id ? 'selected' : ''}>${s.name} (${s.student_number})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">학기 *</label>
                                <select name="semester_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    ${semestersRes.data.semesters.map(sem => `<option value="${sem.id}" ${sem.id == volunteer.semester_id ? 'selected' : ''}>${sem.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동명 *</label>
                            <input type="text" name="activity_name" value="${volunteer.activity_name || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">기관/단체</label>
                                <input type="text" name="organization" value="${volunteer.organization || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동 유형</label>
                                <select name="activity_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">선택하세요</option>
                                    <option value="교육" ${volunteer.activity_type === '교육' ? 'selected' : ''}>교육</option>
                                    <option value="환경" ${volunteer.activity_type === '환경' ? 'selected' : ''}>환경</option>
                                    <option value="복지" ${volunteer.activity_type === '복지' ? 'selected' : ''}>복지</option>
                                    <option value="의료" ${volunteer.activity_type === '의료' ? 'selected' : ''}>의료</option>
                                    <option value="문화" ${volunteer.activity_type === '문화' ? 'selected' : ''}>문화</option>
                                    <option value="기타" ${volunteer.activity_type === '기타' ? 'selected' : ''}>기타</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">활동일 *</label>
                                <input type="date" name="activity_date" value="${volunteer.activity_date || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">시간 (시간) *</label>
                                <input type="number" name="hours" step="0.5" min="0" value="${volunteer.hours || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
                            <input type="text" name="location" value="${volunteer.location || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">활동 내용</label>
                            <textarea name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${volunteer.description || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">인정 사항</label>
                            <input type="text" name="recognition" value="${volunteer.recognition || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" onclick="navigateToPage('volunteer')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('volunteer-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await axios.put(`/api/volunteer/${volunteerId}`, data, {
                    headers: { 'Authorization': 'Bearer ' + authToken }
                });
                alert('봉사활동이 수정되었습니다.');
                navigateToPage('volunteer');
            } catch (error) {
                console.error('봉사활동 수정 실패:', error);
                alert('봉사활동 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        });
    } catch (error) {
        console.error('Failed to load volunteer edit page:', error);
        alert('페이지를 불러오는데 실패했습니다.');
    }
}

// 봉사활동 수정 헬퍼 함수
function editVolunteer(id) {
    window.currentVolunteerId = id;
    navigateToPage('volunteer-edit');
}

// 봉사활동 삭제 헬퍼 함수
async function deleteVolunteer(id) {
    if (!confirm('이 봉사활동을 삭제하시겠습니까?')) return;
    
    try {
        await axios.delete(`/api/volunteer/${id}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        alert('삭제되었습니다.');
        navigateToPage('volunteer');
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}
