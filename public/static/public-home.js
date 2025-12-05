// ============================================
// 공개 홈페이지 (로그인 전) - 학교 홈페이지 스타일
// ============================================

// 홈페이지 설정 전역 변수
let homepageSettings = {
    school_name: '대안학교',
    school_slogan: '꿈을 키우는 학교',
    contact_phone: '000-0000-0000',
    contact_email: 'school@example.com',
    contact_address: '서울시 강남구',
    primary_color: '#1e40af'
};

// 공개 홈페이지 표시
async function showPublicHome() {
    const app = document.getElementById('app');
    
    // 홈페이지 설정 로드
    try {
        const response = await axios.get('/api/homepage');
        const settings = response.data.settings || {};
        homepageSettings = { ...homepageSettings, ...settings };
    } catch (error) {
        console.error('홈페이지 설정 로드 실패:', error);
    }
    
    const primaryColor = homepageSettings.primary_color || '#1e40af';
    
    app.innerHTML = `
        <!-- 학교 공개 홈페이지 -->
        <div id="public-home" class="min-h-screen bg-gray-50">
            <!-- 최상단 바 -->
            <div class="bg-slate-800 text-white text-sm py-2">
                <div class="container mx-auto px-4 flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <span><i class="fas fa-phone mr-1"></i>${escapeHtml(homepageSettings.contact_phone)}</span>
                        <span class="hidden sm:inline"><i class="fas fa-envelope mr-1"></i>${escapeHtml(homepageSettings.contact_email)}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        ${typeof currentUser !== 'undefined' && currentUser ? `
                            <span class="text-gray-300">${escapeHtml(currentUser.name)}님</span>
                            <button onclick="goToDashboard()" class="hover:text-blue-300 transition-colors">
                                <i class="fas fa-tachometer-alt mr-1"></i>대시보드
                            </button>
                        ` : `
                            <button onclick="showLoginModal()" class="hover:text-blue-300 transition-colors">
                                <i class="fas fa-sign-in-alt mr-1"></i>로그인
                            </button>
                        `}
                    </div>
                </div>
            </div>
            
            <!-- 메인 헤더 -->
            <header class="bg-white shadow-md sticky top-0 z-50">
                <div class="container mx-auto px-4">
                    <!-- 로고 영역 -->
                    <div class="py-4 flex items-center justify-between border-b border-gray-100">
                        <div class="flex items-center space-x-4 cursor-pointer" onclick="navigatePublicPage('home')">
                            <div class="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center shadow-md">
                                <i class="fas fa-graduation-cap text-white text-2xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">${escapeHtml(homepageSettings.school_name)}</h1>
                                <p class="text-sm text-blue-600 font-medium">${escapeHtml(homepageSettings.school_slogan)}</p>
                            </div>
                        </div>
                        <div class="hidden lg:flex items-center space-x-2">
                            <a href="#" onclick="navigatePublicPage('about')" class="px-3 py-2 text-sm text-gray-600 hover:text-blue-600">
                                <i class="fas fa-info-circle mr-1"></i>학교소개
                            </a>
                            <a href="#" onclick="navigatePublicPage('notice')" class="px-3 py-2 text-sm text-gray-600 hover:text-blue-600">
                                <i class="fas fa-bullhorn mr-1"></i>공지사항
                            </a>
                            <a href="#" onclick="navigatePublicPage('location')" class="px-3 py-2 text-sm text-gray-600 hover:text-blue-600">
                                <i class="fas fa-map-marker-alt mr-1"></i>오시는 길
                            </a>
                        </div>
                    </div>
                    
                    <!-- 메인 네비게이션 -->
                    <nav class="hidden md:block">
                        <ul class="flex">
                            <li class="relative group">
                                <a href="#" class="public-nav-item flex items-center px-6 py-4 text-gray-700 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors" data-page="home">
                                    <i class="fas fa-home mr-2"></i>홈
                                </a>
                            </li>
                            <li class="relative group">
                                <a href="#" class="public-nav-item flex items-center px-6 py-4 text-gray-700 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors" data-page="about">
                                    <i class="fas fa-school mr-2"></i>학교소개
                                </a>
                            </li>
                            <li class="relative group">
                                <a href="#" class="public-nav-item flex items-center px-6 py-4 text-gray-700 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors" data-page="education">
                                    <i class="fas fa-book-open mr-2"></i>교육과정
                                </a>
                            </li>
                            <li class="relative group">
                                <a href="#" class="public-nav-item flex items-center px-6 py-4 text-gray-700 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors" data-page="notice">
                                    <i class="fas fa-clipboard-list mr-2"></i>공지사항
                                </a>
                            </li>
                            <li class="relative group">
                                <a href="#" class="public-nav-item flex items-center px-6 py-4 text-gray-700 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors" data-page="location">
                                    <i class="fas fa-directions mr-2"></i>오시는 길
                                </a>
                            </li>
                        </ul>
                    </nav>
                    
                    <!-- 모바일 메뉴 버튼 -->
                    <button class="md:hidden py-4 text-gray-700" onclick="toggleMobileMenu()">
                        <i class="fas fa-bars text-2xl"></i>
                    </button>
                </div>
                
                <!-- 모바일 메뉴 -->
                <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">
                    <nav class="container mx-auto px-4 py-2">
                        <a href="#" class="public-nav-item block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700" data-page="home">홈</a>
                        <a href="#" class="public-nav-item block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700" data-page="about">학교소개</a>
                        <a href="#" class="public-nav-item block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700" data-page="education">교육과정</a>
                        <a href="#" class="public-nav-item block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700" data-page="notice">공지사항</a>
                        <a href="#" class="public-nav-item block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700" data-page="location">오시는 길</a>
                    </nav>
                </div>
            </header>

            <!-- 메인 컨텐츠 -->
            <main id="public-content">
                <!-- 여기에 동적으로 컨텐츠 로드 -->
            </main>

            <!-- 마퀴 섹션 -->
            <section class="marquee-section py-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                <div class="marquee-container flex whitespace-nowrap">
                    <div class="marquee-text flex animate-marquee">
                        ${Array(6).fill(`<span class="text-4xl md:text-5xl font-black px-8" style="-webkit-text-stroke: 1px rgba(255,255,255,0.2); color: transparent;">• DREAM BIG • LEARN MORE • GROW TOGETHER</span>`).join('')}
                    </div>
                </div>
            </section>

            <!-- 포스텍 스타일 푸터 -->
            <footer class="main-footer bg-slate-900 text-white">
                <div class="container mx-auto px-4 py-16">
                    <div class="footer-top grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/10">
                        <div class="lg:col-span-2">
                            <div class="flex items-center space-x-4 mb-6">
                                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <i class="fas fa-graduation-cap text-white text-2xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-2xl font-black">${escapeHtml(homepageSettings.school_name)}</h3>
                                    <p class="text-amber-400 font-medium">${escapeHtml(homepageSettings.school_slogan)}</p>
                                </div>
                            </div>
                            <p class="text-gray-400 leading-relaxed mb-6 max-w-md">
                                학생 한 명 한 명의 꿈과 잠재력을 발견하고, 미래를 열어가는 교육을 실현합니다.
                            </p>
                            <div class="space-y-3 text-gray-400">
                                <p class="flex items-center gap-3">
                                    <i class="fas fa-map-marker-alt w-5 text-amber-400"></i>
                                    <span>${escapeHtml(homepageSettings.contact_address)}</span>
                                </p>
                                <p class="flex items-center gap-3">
                                    <i class="fas fa-phone w-5 text-amber-400"></i>
                                    <span>${escapeHtml(homepageSettings.contact_phone)}</span>
                                </p>
                                <p class="flex items-center gap-3">
                                    <i class="fas fa-envelope w-5 text-amber-400"></i>
                                    <span>${escapeHtml(homepageSettings.contact_email)}</span>
                                </p>
                            </div>
                        </div>
                        <div class="footer-links">
                            <h4 class="text-lg font-bold mb-6 text-white">바로가기</h4>
                            <ul class="space-y-3">
                                <li><a href="#" onclick="navigatePublicPage('about'); return false;" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>학교소개</a></li>
                                <li><a href="#" onclick="navigatePublicPage('education'); return false;" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>교육과정</a></li>
                                <li><a href="#" onclick="navigatePublicPage('notice'); return false;" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>공지사항</a></li>
                                <li><a href="#" onclick="navigatePublicPage('location'); return false;" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>오시는 길</a></li>
                            </ul>
                        </div>
                        <div class="footer-links">
                            <h4 class="text-lg font-bold mb-6 text-white">이용안내</h4>
                            <ul class="space-y-3">
                                <li><a href="#" onclick="showLoginModal(); return false;" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>로그인</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>개인정보처리방침</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"><i class="fas fa-chevron-right text-xs"></i>이용약관</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
                        <p class="text-gray-500 text-sm">
                            &copy; ${new Date().getFullYear()} ${escapeHtml(homepageSettings.school_name)}. All rights reserved.
                        </p>
                        <div class="footer-social flex gap-3">
                            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-amber-500 transition-all hover:-translate-y-1"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-amber-500 transition-all hover:-translate-y-1"><i class="fab fa-youtube"></i></a>
                            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-amber-500 transition-all hover:-translate-y-1"><i class="fab fa-facebook-f"></i></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>

        <!-- 로그인 모달 -->
        <div id="login-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 relative">
                <button onclick="closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-2xl"></i>
                </button>
                
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                        <i class="fas fa-graduation-cap text-3xl text-blue-700"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-1">로그인</h2>
                    <p class="text-gray-500 text-sm">${escapeHtml(homepageSettings.school_name)} 통합 관리 시스템</p>
                </div>
                
                <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                    <span id="error-message"></span>
                </div>
                
                <form id="login-form" class="space-y-5">
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">아이디</label>
                        <input type="text" id="username" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">비밀번호</label>
                        <input type="password" id="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <button type="submit" class="w-full py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
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
    `;

    // 네비게이션 이벤트 설정
    setupPublicNavigation();
    
    // URL에서 페이지 확인하여 해당 페이지로 이동
    const pageFromURL = getPublicPageFromURL();
    if (pageFromURL && pageFromURL !== 'home') {
        setTimeout(() => {
            navigatePublicPage(pageFromURL, false);
        }, 100);
    } else {
        showPublicHomePage();
        if (!window.location.hash) {
            navigatePublicPage('home', false);
        }
    }
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// 공개 페이지용 URL에서 페이지 추출
function getPublicPageFromURL() {
    const hash = window.location.hash.slice(1); // # 제거
    if (hash) {
        // public- 접두사가 있으면 제거
        if (hash.startsWith('public-')) {
            return hash.replace('public-', '');
        }
        return hash;
    }
    return 'home';
}

// 공개 네비게이션 설정
function setupPublicNavigation() {
    // 네비게이션 링크 클릭 이벤트
    document.querySelectorAll('.public-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // closest를 사용하여 data-page를 가진 요소 찾기
            const target = e.target.closest('.public-nav-item');
            const page = target ? target.getAttribute('data-page') : null;
            
            if (!page) return;
            
            // 활성 상태 업데이트
            document.querySelectorAll('.public-nav-item').forEach(link => {
                link.classList.remove('text-indigo-600', 'font-semibold');
                link.classList.add('text-gray-700');
            });
            e.target.classList.add('text-indigo-600', 'font-semibold');
            e.target.classList.remove('text-gray-700');
            
            navigatePublicPage(page);
        });
    });
    
    // 브라우저 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', (e) => {
        const page = e.state?.page || getPublicPageFromURL();
        navigatePublicPage(page, false); // URL은 이미 변경되었으므로 업데이트하지 않음
        updatePublicNavActive(page);
    });
    
    // 해시 변경 처리 (직접 URL 입력 시)
    window.addEventListener('hashchange', () => {
        const page = getPublicPageFromURL();
        navigatePublicPage(page, false);
        updatePublicNavActive(page);
    });
}

// 공개 네비게이션 활성 상태 업데이트
function updatePublicNavActive(page) {
    document.querySelectorAll('.public-nav-item').forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === page) {
            link.classList.add('text-indigo-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        } else {
            link.classList.remove('text-indigo-600', 'font-semibold');
            link.classList.add('text-gray-700');
        }
    });
}

// 공개 페이지 네비게이션
function navigatePublicPage(page, updateURL = true) {
    // URL 업데이트
    if (updateURL) {
        const newURL = `#public-${page}`;
        if (window.location.hash !== newURL) {
            window.history.pushState({ page }, '', newURL);
        }
    }
    
    // 스크롤 최상단으로
    window.scrollTo(0, 0);
    
    switch (page) {
        case 'home':
            showPublicHomePage();
            break;
        case 'about':
            showAboutPage();
            break;
        case 'education':
            showEducationPage();
            break;
        case 'notice':
            showPublicNoticePage();
            break;
        case 'location':
            showLocationPage();
            break;
        default:
            showPublicHomePage();
    }
}

// ============================================
// 메인 홈 페이지
// ============================================
async function showPublicHomePage() {
    const content = document.getElementById('public-content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="text-center py-24">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
            <p class="text-gray-600 mt-4">로딩 중...</p>
        </div>
    `;
    
    try {
        // 홈페이지 모듈 로드
        const response = await axios.get('/api/homepage-modules');
        const modules = response.data.modules || [];
        
        if (modules.length === 0) {
            // 모듈이 없으면 안내 메시지 표시
            content.innerHTML = `
                <section class="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-32 overflow-hidden">
                    <div class="absolute inset-0 bg-black/20"></div>
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
                    <div class="container mx-auto px-4 text-center relative z-10">
                        <div class="animate-fade-in-up">
                            <h2 class="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                                꿈을 키우는 학교
                            </h2>
                            <p class="text-xl md:text-2xl mb-12 text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
                                우리 모두가 주인공이 되는 배움의 공간
                            </p>
                            <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <button onclick="navigatePublicPage('about')" class="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                    <i class="fas fa-info-circle mr-2"></i>학교 소개 보기
                                </button>
                                ${typeof currentUser !== 'undefined' && currentUser ? `
                                    <button onclick="goToDashboard()" class="bg-indigo-600/90 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/30 shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                        <i class="fas fa-tachometer-alt mr-2"></i>대시보드
                                    </button>
                                ` : `
                                    <button onclick="showLoginModal()" class="bg-indigo-600/90 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/30 shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                        <i class="fas fa-sign-in-alt mr-2"></i>로그인
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                </section>
                <section class="py-20 bg-gradient-to-br from-gray-50 to-white">
                    <div class="container mx-auto px-4 text-center">
                        <div class="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                            <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <i class="fas fa-info-circle text-4xl text-indigo-600"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">홈페이지 모듈이 아직 설정되지 않았습니다</h3>
                            <p class="text-gray-600 mb-6">최고 관리자로 로그인하여 홈페이지 모듈을 추가해주세요.</p>
                            ${typeof currentUser !== 'undefined' && currentUser && currentUser.role === 'super_admin' ? `
                                <button onclick="goToDashboard(); setTimeout(() => navigateToPage('homepage-management'), 500)" class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105">
                                    <i class="fas fa-cog mr-2"></i>홈페이지 관리하기
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </section>
            `;
            return;
        }
        
        // 모듈 렌더링
        let html = '';
        for (const module of modules) {
            html += renderHomepageModule(module);
        }
        
        content.innerHTML = html;
        
        // 공지사항 모듈이 있으면 로드
        const noticeModule = modules.find(m => m.module_type === 'notice');
        if (noticeModule) {
            loadPublicNoticePreview();
        }
    } catch (error) {
        console.error('홈페이지 모듈 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg m-4">
                홈페이지를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 홈페이지 모듈 렌더링 (학교 스타일)
function renderHomepageModule(module) {
    const containerClass = {
        'container': 'container mx-auto px-4',
        'full_width': 'w-full',
        'narrow': 'container mx-auto px-4 max-w-4xl'
    }[module.container_type] || 'container mx-auto px-4';
    
    const style = [];
    if (module.background_color && module.background_color !== '#ffffff') {
        style.push(`background-color: ${module.background_color}`);
    }
    if (module.background_image) {
        style.push(`background-image: url('${escapeHtml(module.background_image)}')`);
        style.push(`background-size: cover`);
        style.push(`background-position: center`);
    }
    if (module.padding_top) style.push(`padding-top: ${module.padding_top}px`);
    if (module.padding_bottom) style.push(`padding-bottom: ${module.padding_bottom}px`);
    if (module.margin_top) style.push(`margin-top: ${module.margin_top}px`);
    if (module.margin_bottom) style.push(`margin-bottom: ${module.margin_bottom}px`);
    
    const sectionStyle = style.length > 0 ? ` style="${style.join('; ')}"` : '';
    
    let moduleHTML = '';
    
    switch (module.module_type) {
        case 'hero':
        case 'banner':
            // 포스텍 스타일 메인 히어로 섹션
            const heroTitle = module.title || homepageSettings.school_name;
            const heroSubtitle = module.subtitle || homepageSettings.school_slogan;
            const heroVideo = module.video_url || null;
            const heroBgImage = module.background_image || module.hero_background_image || null;
            
            moduleHTML = `
                <section class="hero-visual relative min-h-[70vh] md:min-h-[85vh] overflow-hidden"${sectionStyle}>
                    <!-- 배경 -->
                    ${heroVideo ? `
                        <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover">
                            <source src="${escapeHtml(heroVideo)}" type="video/mp4">
                        </video>
                    ` : heroBgImage ? `
                        <div class="absolute inset-0 w-full h-full">
                            <img src="${escapeHtml(heroBgImage)}" alt="" class="w-full h-full object-cover">
                        </div>
                    ` : `
                        <!-- 기본 그라데이션 배경 -->
                        <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
                        <div class="absolute inset-0 opacity-30">
                            <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                            <div class="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
                            <div class="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
                        </div>
                    `}
                    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                    
                    <!-- 콘텐츠 -->
                    <div class="relative z-10 flex flex-col justify-center items-center text-center min-h-[70vh] md:min-h-[85vh] px-4">
                        <div class="max-w-4xl mx-auto">
                            <h2 class="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight tracking-tight" style="text-shadow: 0 4px 30px rgba(0,0,0,0.5);">
                                ${escapeHtml(heroTitle)}
                            </h2>
                            <p class="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                                ${escapeHtml(heroSubtitle)}
                            </p>
                            <div class="flex flex-col sm:flex-row justify-center gap-4">
                                <a href="#" onclick="navigatePublicPage('about'); return false;" class="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-lg rounded-full hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 hover:-translate-y-1">
                                    <i class="fas fa-school"></i>
                                    <span>학교소개</span>
                                    <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                </a>
                                <a href="#" onclick="navigatePublicPage('notice'); return false;" class="group inline-flex items-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-md text-white font-semibold text-lg rounded-full border-2 border-white/20 hover:bg-white hover:text-gray-900 transition-all duration-300 hover:-translate-y-1">
                                    <i class="fas fa-bullhorn"></i>
                                    <span>공지사항</span>
                                    <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 스크롤 인디케이터 -->
                    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                        <div class="w-8 h-14 border-2 border-white/30 rounded-full flex justify-center pt-2">
                            <div class="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'slides':
            if (module.slides && module.slides.length > 0) {
                moduleHTML = `
                    <section class="relative"${sectionStyle}>
                        <div id="slideshow-${module.id}" class="relative overflow-hidden" style="height: 450px;">
                            ${module.slides.map((slide, index) => `
                                <div class="slide absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}" style="${index === 0 ? '' : 'pointer-events: none;'}">
                                    <img src="${escapeHtml(slide.image_url)}" alt="${escapeHtml(slide.image_alt || '')}" class="w-full h-full object-cover">
                                    <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                                        <div class="container mx-auto px-4">
                                            <div class="max-w-xl text-white">
                                                ${slide.title ? `<h3 class="text-3xl md:text-4xl font-bold mb-3">${escapeHtml(slide.title)}</h3>` : ''}
                                                ${slide.subtitle ? `<p class="text-lg text-gray-200 mb-4">${escapeHtml(slide.subtitle)}</p>` : ''}
                                                ${slide.link_url ? `<a href="${escapeHtml(slide.link_url)}" class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">${escapeHtml(slide.link_text || '자세히 보기')}</a>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            ${module.slides.length > 1 ? `
                                <button onclick="previousSlide(${module.id})" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                                    <i class="fas fa-chevron-left text-gray-700"></i>
                                </button>
                                <button onclick="nextSlide(${module.id})" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                                    <i class="fas fa-chevron-right text-gray-700"></i>
                                </button>
                                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                                    ${module.slides.map((_, idx) => `
                                        <button onclick="goToSlide(${module.id}, ${idx})" class="slide-dot w-3 h-3 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'} hover:bg-white transition-colors"></button>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </section>
                `;
                // 자동 슬라이드 시작
                setTimeout(() => startAutoSlide(module.id, module.slides.length), 100);
            }
            break;
            
        case 'quick_links':
            // 바로가기 메뉴
            const links = module.links || [
                { icon: 'fa-user-graduate', title: '입학안내', url: '#', color: 'blue' },
                { icon: 'fa-calendar-alt', title: '학사일정', url: '#', color: 'green' },
                { icon: 'fa-utensils', title: '급식안내', url: '#', color: 'orange' },
                { icon: 'fa-file-alt', title: '가정통신문', url: '#', color: 'purple' }
            ];
            const colorMap = {
                blue: 'bg-blue-600 hover:bg-blue-700',
                green: 'bg-green-600 hover:bg-green-700',
                orange: 'bg-orange-500 hover:bg-orange-600',
                purple: 'bg-purple-600 hover:bg-purple-700',
                red: 'bg-red-600 hover:bg-red-700',
                teal: 'bg-teal-600 hover:bg-teal-700'
            };
            moduleHTML = `
                <section class="py-8 bg-gray-100"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            ${(Array.isArray(links) ? links : []).map((link, idx) => {
                                const bgColor = colorMap[link.color] || colorMap.blue;
                                return `
                                    <a href="${escapeHtml(link.url || '#')}" class="${bgColor} text-white rounded-xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                                        <i class="fas ${escapeHtml(link.icon || 'fa-link')} text-3xl mb-3"></i>
                                        <p class="font-semibold">${escapeHtml(link.title || '')}</p>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'notice':
        case 'notice_board':
            // 포스텍 스타일 뉴스 섹션
            moduleHTML = `
                <section class="news-section py-16 md:py-24 bg-white"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                            <div>
                                <h2 class="section-title text-3xl md:text-4xl font-bold text-gray-900 mb-2 relative inline-block">
                                    ${escapeHtml(module.section_title || '주요 소식')}
                                    <span class="absolute -bottom-2 left-0 w-16 h-1 bg-amber-500 rounded"></span>
                                </h2>
                                <p class="text-gray-500 mt-4">${escapeHtml(module.section_subtitle || '학교의 새로운 소식을 확인하세요')}</p>
                            </div>
                            <a href="#" onclick="navigatePublicPage('notice'); return false;" class="mt-4 md:mt-0 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors group">
                                뉴스센터 바로가기
                                <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        </div>
                        <div id="public-notice-preview" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="col-span-full text-center py-12">
                                <i class="fas fa-spinner fa-spin text-3xl text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'values':
            // 포스텍 스타일 교훈/핵심가치
            const valueGradients = [
                'from-blue-600 to-indigo-700',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-600'
            ];
            moduleHTML = `
                <section class="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"${sectionStyle}>
                    <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
                    <div class="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-100/50 rounded-full blur-3xl"></div>
                    <div class="${containerClass} relative z-10">
                        <div class="text-center mb-16">
                            <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">${escapeHtml(module.section_title || '교훈')}</h2>
                            <div class="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            ${[1, 2, 3].map((i) => {
                                const icon = module[`value${i}_icon`];
                                const title = module[`value${i}_title`] || '';
                                const desc = module[`value${i}_desc`] || '';
                                const gradient = valueGradients[i-1];
                                const iconClass = icon && icon.startsWith('fa-') ? `fas ${icon}` : (icon || 'fas fa-star');
                                return title ? `
                                    <div class="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                                        <div class="absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity"></div>
                                        <div class="w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                            <i class="${iconClass} text-3xl text-white"></i>
                                        </div>
                                        <h3 class="text-2xl font-bold text-gray-900 mb-3 text-center">${escapeHtml(title)}</h3>
                                        <p class="text-gray-500 text-center leading-relaxed">${escapeHtml(desc)}</p>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'features':
            // 포스텍 스타일 프로그램 섹션
            const gradientColors = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-amber-500 to-orange-500',
                'from-emerald-500 to-teal-500'
            ];
            moduleHTML = `
                <section class="programs-section py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="text-center mb-14">
                            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">${escapeHtml(module.section_title || '교육 프로그램')}</h2>
                            <p class="text-gray-500 text-lg max-w-2xl mx-auto">${escapeHtml(module.section_subtitle || '우리 학교만의 특별한 교육을 만나보세요')}</p>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            ${[1, 2, 3, 4].map((i) => {
                                const icon = module[`feature${i}_icon`];
                                const title = module[`feature${i}_title`] || '';
                                const desc = module[`feature${i}_desc`] || '';
                                const iconClass = icon && icon.startsWith('fa-') ? `fas ${icon}` : (icon || 'fas fa-lightbulb');
                                const gradient = gradientColors[i-1];
                                return title ? `
                                    <div class="program-card group bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div class="program-icon w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <i class="${iconClass} text-2xl text-white"></i>
                                        </div>
                                        <h4 class="program-title text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">${escapeHtml(title)}</h4>
                                        <p class="program-desc text-gray-500 leading-relaxed">${escapeHtml(desc)}</p>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'stats':
            // 포스텍 스타일 학교 현황 통계
            moduleHTML = `
                <section class="stats-section relative py-20 overflow-hidden"${sectionStyle || ' style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);"'}>
                    <div class="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div class="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    <div class="${containerClass} relative z-10">
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div class="stat-item text-center p-6">
                                <div class="stat-number text-5xl md:text-6xl font-black mb-2" style="color: #c9a227;">
                                    ${escapeHtml(module.stat1_value || '100')}
                                    <span class="text-3xl">${escapeHtml(module.stat1_suffix || '명')}</span>
                                </div>
                                <div class="stat-label text-lg text-white/80 font-medium">${escapeHtml(module.stat1_label || '재학생')}</div>
                            </div>
                            <div class="stat-item text-center p-6">
                                <div class="stat-number text-5xl md:text-6xl font-black mb-2" style="color: #c9a227;">
                                    ${escapeHtml(module.stat2_value || '15')}
                                    <span class="text-3xl">${escapeHtml(module.stat2_suffix || '명')}</span>
                                </div>
                                <div class="stat-label text-lg text-white/80 font-medium">${escapeHtml(module.stat2_label || '교원')}</div>
                            </div>
                            <div class="stat-item text-center p-6">
                                <div class="stat-number text-5xl md:text-6xl font-black mb-2" style="color: #c9a227;">
                                    ${escapeHtml(module.stat3_value || '6')}
                                    <span class="text-3xl">${escapeHtml(module.stat3_suffix || '개')}</span>
                                </div>
                                <div class="stat-label text-lg text-white/80 font-medium">${escapeHtml(module.stat3_label || '학급')}</div>
                            </div>
                            <div class="stat-item text-center p-6">
                                <div class="stat-number text-5xl md:text-6xl font-black mb-2" style="color: #c9a227;">
                                    ${escapeHtml(module.stat4_value || '2020')}
                                    <span class="text-3xl">${escapeHtml(module.stat4_suffix || '년')}</span>
                                </div>
                                <div class="stat-label text-lg text-white/80 font-medium">${escapeHtml(module.stat4_label || '설립')}</div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'gallery':
            // 학교 갤러리
            const images = module.images || [];
            moduleHTML = `
                <section class="py-12 bg-white"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="text-center mb-10">
                            <h2 class="text-3xl font-bold text-gray-800 mb-2">${escapeHtml(module.section_title || '학교 갤러리')}</h2>
                            <div class="w-20 h-1 bg-blue-600 mx-auto"></div>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            ${images.length > 0 ? images.map((img, idx) => `
                                <div class="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer" onclick="openGalleryImage('${escapeHtml(img.url)}')">
                                    <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || '')}" class="w-full h-full object-cover hover:scale-105 transition-transform">
                                </div>
                            `).join('') : `
                                <div class="col-span-full text-center py-12 bg-gray-100 rounded-lg">
                                    <i class="fas fa-images text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-500">갤러리 이미지를 추가해주세요</p>
                                </div>
                            `}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'contact':
        case 'map':
            // 연락처/오시는 길
            moduleHTML = `
                <section class="py-12 bg-gray-50"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="text-center mb-10">
                            <h2 class="text-3xl font-bold text-gray-800 mb-2">${escapeHtml(module.section_title || '오시는 길')}</h2>
                            <div class="w-20 h-1 bg-blue-600 mx-auto"></div>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div class="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                                <h3 class="text-xl font-bold text-gray-800 mb-6"><i class="fas fa-school mr-2 text-blue-600"></i>학교 정보</h3>
                                <div class="space-y-4">
                                    <div class="flex items-start">
                                        <i class="fas fa-map-marker-alt text-blue-600 w-6 mt-1"></i>
                                        <div class="ml-3">
                                            <p class="font-semibold text-gray-800">주소</p>
                                            <p class="text-gray-600">${escapeHtml(module.address || homepageSettings.contact_address)}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start">
                                        <i class="fas fa-phone text-blue-600 w-6 mt-1"></i>
                                        <div class="ml-3">
                                            <p class="font-semibold text-gray-800">전화</p>
                                            <p class="text-gray-600">${escapeHtml(module.phone || homepageSettings.contact_phone)}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start">
                                        <i class="fas fa-envelope text-blue-600 w-6 mt-1"></i>
                                        <div class="ml-3">
                                            <p class="font-semibold text-gray-800">이메일</p>
                                            <p class="text-gray-600">${escapeHtml(module.email || homepageSettings.contact_email)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-300 rounded-xl h-80 flex items-center justify-center">
                                ${module.map_embed ? module.map_embed : `
                                    <div class="text-center text-gray-500">
                                        <i class="fas fa-map text-5xl mb-3"></i>
                                        <p>지도 영역</p>
                                        <p class="text-sm">관리자에서 지도 코드를 입력해주세요</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'text':
            moduleHTML = `
                <section class="py-10"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                            ${module.title ? `
                                <h2 class="text-2xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-200">
                                    <i class="fas fa-file-alt mr-2 text-blue-600"></i>${escapeHtml(module.title)}
                                </h2>
                            ` : ''}
                            <div class="prose max-w-none text-gray-700 leading-relaxed">
                                ${formatTextContent(module.content || '')}
                            </div>
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'image':
            if (module.image_url) {
                const imgStyle = [];
                if (module.image_width) imgStyle.push(`max-width: ${module.image_width}px`);
                if (module.image_height) imgStyle.push(`max-height: ${module.image_height}px`);
                moduleHTML = `
                    <section class="py-10"${sectionStyle}>
                        <div class="${containerClass} text-center">
                            <img src="${escapeHtml(module.image_url)}" 
                                 alt="${escapeHtml(module.image_alt || '')}" 
                                 class="mx-auto rounded-lg shadow-md ${imgStyle.length > 0 ? '' : 'max-w-full h-auto'}"
                                 ${imgStyle.length > 0 ? `style="${imgStyle.join('; ')}"` : ''}>
                        </div>
                    </section>
                `;
            }
            break;
            
        case 'custom':
            if (module.html_content) {
                moduleHTML = `
                    <section class="py-10"${sectionStyle}>
                        <div class="${containerClass}">
                            ${module.html_content}
                        </div>
                    </section>
                `;
            }
            break;
    }
    
    return moduleHTML || '';
}

// 갤러리 이미지 열기
function openGalleryImage(url) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
    modal.onclick = () => modal.remove();
    modal.innerHTML = `
        <img src="${escapeHtml(url)}" class="max-w-full max-h-full rounded-lg">
        <button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">&times;</button>
    `;
    document.body.appendChild(modal);
}

// 슬라이드 네비게이션
let slideIndices = {};
let slideIntervals = {};

function nextSlide(moduleId) {
    if (slideIndices[moduleId] === undefined) slideIndices[moduleId] = 0;
    const container = document.querySelector(`#slideshow-${moduleId}`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    // 현재 슬라이드 숨기기
    slides[slideIndices[moduleId]].classList.remove('opacity-100');
    slides[slideIndices[moduleId]].classList.add('opacity-0');
    slides[slideIndices[moduleId]].style.pointerEvents = 'none';
    
    // 다음 슬라이드로
    slideIndices[moduleId] = (slideIndices[moduleId] + 1) % slides.length;
    
    // 다음 슬라이드 보이기
    slides[slideIndices[moduleId]].classList.remove('opacity-0');
    slides[slideIndices[moduleId]].classList.add('opacity-100');
    slides[slideIndices[moduleId]].style.pointerEvents = 'auto';
    
    // 인디케이터 업데이트
    updateSlideIndicators(moduleId);
}

function previousSlide(moduleId) {
    if (slideIndices[moduleId] === undefined) slideIndices[moduleId] = 0;
    const container = document.querySelector(`#slideshow-${moduleId}`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    // 현재 슬라이드 숨기기
    slides[slideIndices[moduleId]].classList.remove('opacity-100');
    slides[slideIndices[moduleId]].classList.add('opacity-0');
    slides[slideIndices[moduleId]].style.pointerEvents = 'none';
    
    // 이전 슬라이드로
    slideIndices[moduleId] = (slideIndices[moduleId] - 1 + slides.length) % slides.length;
    
    // 이전 슬라이드 보이기
    slides[slideIndices[moduleId]].classList.remove('opacity-0');
    slides[slideIndices[moduleId]].classList.add('opacity-100');
    slides[slideIndices[moduleId]].style.pointerEvents = 'auto';
    
    // 인디케이터 업데이트
    updateSlideIndicators(moduleId);
}

function goToSlide(moduleId, index) {
    if (slideIndices[moduleId] === undefined) slideIndices[moduleId] = 0;
    const container = document.querySelector(`#slideshow-${moduleId}`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    if (slides.length === 0 || index >= slides.length) return;
    
    // 현재 슬라이드 숨기기
    slides[slideIndices[moduleId]].classList.remove('opacity-100');
    slides[slideIndices[moduleId]].classList.add('opacity-0');
    slides[slideIndices[moduleId]].style.pointerEvents = 'none';
    
    // 선택한 슬라이드로
    slideIndices[moduleId] = index;
    
    // 슬라이드 보이기
    slides[slideIndices[moduleId]].classList.remove('opacity-0');
    slides[slideIndices[moduleId]].classList.add('opacity-100');
    slides[slideIndices[moduleId]].style.pointerEvents = 'auto';
    
    // 인디케이터 업데이트
    updateSlideIndicators(moduleId);
}

function updateSlideIndicators(moduleId) {
    const container = document.querySelector(`#slideshow-${moduleId}`);
    if (!container) return;
    
    const dots = container.querySelectorAll('.slide-dot');
    dots.forEach((dot, idx) => {
        if (idx === slideIndices[moduleId]) {
            dot.classList.remove('bg-white/50');
            dot.classList.add('bg-white');
        } else {
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white/50');
        }
    });
}

function startAutoSlide(moduleId, slideCount) {
    if (slideCount <= 1) return;
    
    // 기존 인터벌 정리
    if (slideIntervals[moduleId]) {
        clearInterval(slideIntervals[moduleId]);
    }
    
    slideIndices[moduleId] = 0;
    slideIntervals[moduleId] = setInterval(() => {
        nextSlide(moduleId);
    }, 5000); // 5초마다 자동 전환
}

// 공개 공지사항 미리보기 로드
async function loadPublicNoticePreview() {
    try {
        // 게시판 API 호출 (인증 없이)
        const response = await axios.get('/api/boards/posts?board_type=student&is_notice=1&limit=6');
        
        const container = document.getElementById('public-notice-preview');
        if (!container) return;
        
        let notices = response.data.posts || [];
        
        // 공지사항이 없으면 샘플 데이터 표시
        if (notices.length === 0) {
            notices = getSampleSchoolNews();
        }
        
        // 포스텍 스타일 뉴스 카드
        const categoryColors = {
            '공지': 'bg-blue-600',
            '안내': 'bg-green-600',
            '행사': 'bg-purple-600',
            '기타': 'bg-gray-600'
        };
        
        container.innerHTML = notices.map((notice, idx) => {
            const category = notice.category || '공지';
            const categoryColor = categoryColors[category] || 'bg-blue-600';
            const dateStr = formatDateKorean(notice.created_at);
            
            return `
                <article class="news-card group cursor-pointer" onclick="navigatePublicPage('notice')">
                    <div class="card-image relative h-48 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <i class="fas fa-newspaper text-5xl text-white/20"></i>
                        </div>
                        <span class="card-category absolute top-4 left-4 px-3 py-1 ${categoryColor} text-white text-xs font-bold rounded-full uppercase tracking-wide">
                            ${escapeHtml(category)}
                        </span>
                    </div>
                    <div class="card-body p-6">
                        <h3 class="card-title text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            ${escapeHtml(notice.title)}
                        </h3>
                        <p class="text-gray-500 text-sm line-clamp-2 mb-4">${escapeHtml(notice.content || '').substring(0, 100)}...</p>
                        <time class="card-date text-sm text-gray-400">${dateStr}</time>
                    </div>
                </article>
            `;
        }).join('');
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        const container = document.getElementById('public-notice-preview');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-red-50 rounded-2xl">
                    <i class="fas fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
                    <p class="text-red-500">공지사항을 불러올 수 없습니다.</p>
                </div>
            `;
        }
    }
}

// 한국어 날짜 포맷
function formatDateKorean(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
}

// 샘플 학교 뉴스 데이터
function getSampleSchoolNews() {
    const today = new Date();
    const formatDate = (daysAgo) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString();
    };
    
    return [
        {
            title: '2024학년도 2학기 신입생 모집 안내',
            content: '우리 학교에서 2024학년도 2학기 신입생을 모집합니다. 관심 있는 학부모님과 학생 여러분의 많은 지원 바랍니다.',
            category: '입학',
            created_at: formatDate(1),
            image: null
        },
        {
            title: '제15회 학교 축제 "꿈을 펼쳐라" 성황리 마감',
            content: '지난 주말 열린 학교 축제에 1,000여 명의 학부모와 지역 주민이 참여하여 큰 호응을 얻었습니다.',
            category: '행사',
            created_at: formatDate(3),
            image: null
        },
        {
            title: '전국 학생 과학탐구대회 대상 수상',
            content: '우리 학교 과학탐구반 학생들이 전국 학생 과학탐구대회에서 대상을 수상하는 쾌거를 이루었습니다.',
            category: '수상',
            created_at: formatDate(5),
            image: null
        },
        {
            title: '겨울방학 특별 프로그램 신청 안내',
            content: '겨울방학 기간 중 진행되는 다양한 특별 프로그램에 대한 신청을 받고 있습니다. 마감일 전 신청 바랍니다.',
            category: '안내',
            created_at: formatDate(7),
            image: null
        },
        {
            title: '학부모 상담주간 운영 안내',
            content: '12월 첫째 주 학부모 상담주간을 운영합니다. 담임 선생님과의 상담을 원하시는 분은 사전 예약해 주세요.',
            category: '안내',
            created_at: formatDate(10),
            image: null
        },
        {
            title: '교육부 우수학교 인증 획득',
            content: '우리 학교가 교육부 주관 "창의적 교육과정 운영 우수학교"로 선정되어 인증을 받았습니다.',
            category: '공지',
            created_at: formatDate(14),
            image: null
        }
    ];
}

// 짧은 날짜 포맷
function formatDateShort(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) return '오늘';
    if (dayDiff === 1) return '어제';
    if (dayDiff < 7) return `${dayDiff}일 전`;
    
    return `${date.getMonth() + 1}.${date.getDate()}`;
}

// ============================================
// 학교 소개
// ============================================
async function showAboutPage() {
    const content = document.getElementById('public-content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="text-center py-24">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
            <p class="text-gray-600 mt-4">로딩 중...</p>
        </div>
    `;
    
    try {
        // 학교소개 페이지 모듈 로드
        const response = await axios.get('/api/homepage-modules?page=about');
        const modules = response.data.modules || [];
        
        if (modules.length === 0) {
            // 기본 내용 표시
            content.innerHTML = `
                <section class="py-16 bg-white">
                    <div class="container mx-auto px-4 text-center">
                        <h2 class="text-4xl font-bold text-gray-800 mb-8">학교 소개</h2>
                        <p class="text-gray-600">학교 소개 내용을 추가해주세요.</p>
                    </div>
                </section>
            `;
            return;
        }
        
        // 모듈 렌더링
        let html = '';
        for (const module of modules) {
            html += renderHomepageModule(module);
        }
        content.innerHTML = html;
    } catch (error) {
        console.error('학교소개 페이지 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg m-4">
                페이지를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 이전 버전 (참고용, 사용 안 함)
async function showAboutPageOld() {
    const content = document.getElementById('public-content');
    
    try {
        // 홈페이지 설정 로드
        const response = await axios.get('/api/homepage');
        const settings = response.data.settings || {};
        
        // 기본값 설정
        const ideology = settings.about_ideology || '우리 학교는 학생 한 명 한 명의 꿈과 가능성을 소중히 여기며, 서로 존중하고 배려하는 공동체를 만들어갑니다. 기독교 정신을 바탕으로 사랑과 지혜, 섬김의 가치를 실천하며, 미래 사회를 이끌어갈 창의적인 인재를 양성합니다.';
        const goals = settings.about_goals || '• 자기주도적 학습 능력 함양\n• 창의적 문제해결 능력 개발\n• 공동체 의식과 협력 정신\n• 올바른 인성과 가치관 확립';
        const features = settings.about_features || '• 소규모 학급 운영 (학급당 15~20명)\n• 학생 맞춤형 개별화 교육\n• 현장 체험 중심 학습\n• 예체능 통합 교육과정';
        const history = settings.history || '2020.03|학교 설립 인가\n2021.03|제1회 입학식 (신입생 30명)\n2023.02|제1회 졸업식\n2024.03|현재 재학생 100여명';
        
        // 교육 목표와 특징을 리스트로 변환
        const goalsList = goals.split('\n').filter(line => line.trim());
        const featuresList = features.split('\n').filter(line => line.trim());
        
        // 연혁 파싱
        const historyList = history.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const parts = line.split('|');
                return {
                    date: parts[0]?.trim() || '',
                    event: parts[1]?.trim() || parts[0]?.trim() || ''
                };
            });
        
        content.innerHTML = `
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4 max-w-4xl">
                    <h2 class="text-4xl font-bold text-gray-800 mb-8 text-center">학교 소개</h2>
                    
                    <div class="prose prose-lg max-w-none">
                        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-8">
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">설립 이념</h3>
                            <p class="text-gray-700 leading-relaxed">${escapeHtml(ideology).replace(/\n/g, '<br>')}</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-white border-2 border-purple-100 rounded-xl p-6">
                                <h4 class="text-xl font-bold text-gray-800 mb-3">
                                    <i class="fas fa-flag text-purple-600 mr-2"></i>교육 목표
                                </h4>
                                <ul class="space-y-2 text-gray-700">
                                    ${goalsList.map(goal => `<li>${escapeHtml(goal)}</li>`).join('')}
                                </ul>
                            </div>

                            <div class="bg-white border-2 border-blue-100 rounded-xl p-6">
                                <h4 class="text-xl font-bold text-gray-800 mb-3">
                                    <i class="fas fa-star text-blue-600 mr-2"></i>교육 특징
                                </h4>
                                <ul class="space-y-2 text-gray-700">
                                    ${featuresList.map(feature => `<li>${escapeHtml(feature)}</li>`).join('')}
                                </ul>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl p-8 md:p-12">
                            <div class="mb-12 text-center">
                                <h3 class="text-4xl md:text-5xl font-bold mb-2">
                                    <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">History</span>
                                    <span class="text-gray-800 ml-3 text-2xl md:text-3xl">연혁</span>
                                </h3>
                                <p class="text-gray-600 mt-2">최고의 교육을 제공하는 학교로 성장해온 발자취</p>
                            </div>
                            
                            <div class="relative max-w-4xl mx-auto">
                                <!-- 세로 타임라인 -->
                                <div class="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-300 to-indigo-200"></div>
                                
                                <!-- 연혁 항목들 -->
                                <div class="space-y-8 md:space-y-12">
                                    ${historyList.map((item, index) => {
                                        // 날짜에서 연도 추출
                                        const yearMatch = item.date.match(/(\d{4})/);
                                        const year = yearMatch ? yearMatch[1] : '';
                                        const month = item.date.replace(year, '').trim();
                                        
                                        return `
                                            <div class="relative flex items-start gap-6 md:gap-8 group">
                                                <!-- 연도 (왼쪽) -->
                                                <div class="flex-shrink-0 w-16 md:w-20 text-right">
                                                    <div class="text-3xl md:text-4xl font-black text-indigo-600 leading-none">${escapeHtml(year)}</div>
                                                    ${month ? `<div class="text-xs md:text-sm text-gray-500 mt-1">${escapeHtml(month)}</div>` : ''}
                                                </div>
                                                
                                                <!-- 타임라인 마커 -->
                                                <div class="absolute left-8 md:left-12 top-2 transform -translate-x-1/2 z-10">
                                                    <div class="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                                                </div>
                                                
                                                <!-- 이벤트 설명 (오른쪽) -->
                                                <div class="flex-1 pl-4 md:pl-6 pt-1">
                                                    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 md:p-6 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300 group-hover:translate-x-2">
                                                        <p class="text-gray-800 text-base md:text-lg leading-relaxed">${escapeHtml(item.event)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    } catch (error) {
        console.error('구버전 학교 소개 페이지 로드 실패:', error);
    }
}

// ============================================
// 교육과정
// ============================================
async function showEducationPage() {
    const content = document.getElementById('public-content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="text-center py-24">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
            <p class="text-gray-600 mt-4">로딩 중...</p>
        </div>
    `;
    
    try {
        // 교육과정 페이지 모듈 로드
        const response = await axios.get('/api/homepage-modules?page=education');
        const modules = response.data.modules || [];
        
        if (modules.length === 0) {
            // 기본 내용 표시
            content.innerHTML = `
                <section class="py-16 bg-white">
                    <div class="container mx-auto px-4 text-center">
                        <h2 class="text-4xl font-bold text-gray-800 mb-8">교육 과정</h2>
                        <p class="text-gray-600">교육 과정 내용을 추가해주세요.</p>
                    </div>
                </section>
            `;
            return;
        }
        
        // 모듈 렌더링
        let html = '';
        for (const module of modules) {
            html += renderHomepageModule(module);
        }
        content.innerHTML = html;
    } catch (error) {
        console.error('교육과정 페이지 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg m-4">
                페이지를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 이전 버전 (참고용, 사용 안 함)
function showEducationPageOld() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-5xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-12 text-center">교육과정</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-book text-3xl text-red-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">기초 교과</h3>
                        <p class="text-gray-600 text-sm">국어, 영어, 수학, 사회, 과학 등 기본 교과목 학습</p>
                    </div>

                    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-palette text-3xl text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">예체능</h3>
                        <p class="text-gray-600 text-sm">음악, 미술, 체육 등 감성 계발 교육</p>
                    </div>

                    <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-leaf text-3xl text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">체험 학습</h3>
                        <p class="text-gray-600 text-sm">현장 견학, 봉사활동, 프로젝트 학습</p>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-xl p-8 mb-8">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6">특별 프로그램</h3>
                    <div class="space-y-6">
                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-users text-xl text-purple-600"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-2">동아리 활동</h4>
                                <p class="text-gray-600 text-sm">코딩, 음악, 미술, 스포츠 등 다양한 동아리 운영</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-hands-helping text-xl text-blue-600"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-2">봉사활동</h4>
                                <p class="text-gray-600 text-sm">지역사회 봉사, 환경 보호 활동 등</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-mountain text-xl text-green-600"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 mb-2">현장 체험</h4>
                                <p class="text-gray-600 text-sm">문화재 답사, 자연 생태 학습, 직업 체험 등</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// 공지사항
// ============================================
function showPublicNoticePage() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-4xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-8 text-center">공지사항</h2>
                
                <div id="public-notice-list" class="space-y-4">
                    <p class="text-gray-500 text-center py-12">로딩 중...</p>
                </div>
            </div>
        </section>
    `;

    loadPublicNoticeList();
}

async function loadPublicNoticeList() {
    try {
        const response = await axios.get('/api/boards/posts?board_type=student&is_notice=1&limit=20');
        
        const container = document.getElementById('public-notice-list');
        const notices = response.data.posts || [];
        
        if (notices.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-12">등록된 공지사항이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = notices.map(notice => `
            <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-800 flex items-center">
                        <i class="fas fa-bullhorn text-purple-600 mr-2"></i>
                        ${escapeHtml(notice.title)}
                    </h3>
                    <span class="text-sm text-gray-500">${formatDate(notice.created_at)}</span>
                </div>
                <p class="text-gray-600 text-sm">${escapeHtml(notice.content).substring(0, 100)}...</p>
                <div class="mt-3 text-sm text-gray-500">
                    <i class="fas fa-eye mr-1"></i>${notice.view_count || 0}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        document.getElementById('public-notice-list').innerHTML = 
            '<p class="text-red-500 text-center py-12">공지사항을 불러올 수 없습니다.</p>';
    }
}

// ============================================
// 오시는 길
// ============================================
async function showLocationPage() {
    const content = document.getElementById('public-content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="text-center py-24">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
            <p class="text-gray-600 mt-4">로딩 중...</p>
        </div>
    `;
    
    try {
        // 오시는 길 페이지 모듈 로드
        const response = await axios.get('/api/homepage-modules?page=location');
        const modules = response.data.modules || [];
        
        if (modules.length === 0) {
            // 기본 내용 표시
            content.innerHTML = `
                <section class="py-16 bg-white">
                    <div class="container mx-auto px-4 text-center">
                        <h2 class="text-4xl font-bold text-gray-800 mb-8">오시는 길</h2>
                        <p class="text-gray-600">오시는 길 내용을 추가해주세요.</p>
                    </div>
                </section>
            `;
            return;
        }
        
        // 모듈 렌더링
        let html = '';
        for (const module of modules) {
            html += renderHomepageModule(module);
        }
        content.innerHTML = html;
    } catch (error) {
        console.error('오시는 길 페이지 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg m-4">
                페이지를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 이전 버전 (참고용, 사용 안 함)
function showLocationPageOld() {
    const content = document.getElementById('public-content');
    
    content.innerHTML = `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-5xl">
                <h2 class="text-4xl font-bold text-gray-800 mb-12 text-center">오시는 길</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="bg-gray-50 rounded-xl p-8">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-map-marker-alt text-purple-600 mr-2"></i>학교 위치
                        </h3>
                        <div class="space-y-4 text-gray-700">
                            <div class="flex items-start">
                                <i class="fas fa-home text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">주소</p>
                                    <p class="text-sm">서울시 강남구 테헤란로 123</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-phone text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">전화</p>
                                    <p class="text-sm">02-000-0000</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-fax text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">팩스</p>
                                    <p class="text-sm">02-000-0001</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-envelope text-purple-600 mr-3 mt-1"></i>
                                <div>
                                    <p class="font-semibold">이메일</p>
                                    <p class="text-sm">school@example.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-8">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-bus text-blue-600 mr-2"></i>대중교통
                        </h3>
                        <div class="space-y-4 text-gray-700">
                            <div>
                                <p class="font-semibold mb-2">지하철</p>
                                <ul class="text-sm space-y-1">
                                    <li>• 2호선 강남역 3번 출구 도보 10분</li>
                                    <li>• 신분당선 강남역 5번 출구 도보 8분</li>
                                </ul>
                            </div>
                            <div>
                                <p class="font-semibold mb-2">버스</p>
                                <ul class="text-sm space-y-1">
                                    <li>• 간선버스: 146, 740, 341</li>
                                    <li>• 지선버스: 3411, 4318</li>
                                    <li>• 강남역 하차 후 도보 5분</li>
                                </ul>
                            </div>
                            <div>
                                <p class="font-semibold mb-2">자가용</p>
                                <ul class="text-sm space-y-1">
                                    <li>• 학교 내 주차장 이용 가능</li>
                                    <li>• 방문 시 사전 예약 필요</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 지도 영역 (실제로는 카카오맵 또는 구글맵 삽입) -->
                <div class="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
                    <p class="text-gray-500">
                        <i class="fas fa-map text-4xl mb-2"></i><br>
                        지도 영역 (카카오맵 또는 구글맵)
                    </p>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// 로그인 모달 제어
// ============================================
function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('username').focus();
    
    // 로그인 폼 이벤트 재설정
    const loginForm = document.getElementById('login-form');
    if (loginForm && !loginForm.hasAttribute('data-listener')) {
        loginForm.setAttribute('data-listener', 'true');
        loginForm.addEventListener('submit', handleLogin);
    }
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});

// HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 텍스트 콘텐츠 포맷 함수 (줄바꿈 처리 및 구조화)
function formatTextContent(text) {
    if (!text) return '';
    
    // 먼저 HTML 이스케이프
    let content = escapeHtml(text);
    
    // 리터럴 \n 문자열을 실제 줄바꿈으로 변환
    content = content.replace(/\\n/g, '\n');
    
    // 줄 단위로 분리하여 처리
    const lines = content.split('\n');
    let result = '';
    let currentSection = '';
    let currentItems = [];
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // ■ 로 시작하는 섹션 헤더 (연도 등)
        if (trimmedLine.startsWith('■')) {
            // 이전 섹션이 있으면 출력
            if (currentSection || currentItems.length > 0) {
                result += renderSection(currentSection, currentItems);
                currentItems = [];
            }
            currentSection = trimmedLine.replace('■', '').trim();
        }
        // • 로 시작하는 항목
        else if (trimmedLine.startsWith('•')) {
            currentItems.push(trimmedLine.replace('•', '').trim());
        }
        // 일반 텍스트
        else {
            if (currentSection || currentItems.length > 0) {
                result += renderSection(currentSection, currentItems);
                currentSection = '';
                currentItems = [];
            }
            result += `<p class="mb-2">${trimmedLine}</p>`;
        }
    }
    
    // 마지막 섹션 출력
    if (currentSection || currentItems.length > 0) {
        result += renderSection(currentSection, currentItems);
    }
    
    return result || content.replace(/\n/g, '<br>');
}

// 섹션 렌더링 헬퍼
function renderSection(title, items) {
    let html = '';
    if (title) {
        html += `<div class="mb-4"><h4 class="font-bold text-gray-800 text-lg mb-2"><span class="text-blue-600 mr-2">■</span>${title}</h4>`;
    }
    if (items.length > 0) {
        html += `<ul class="list-disc list-inside space-y-1 text-gray-600 ml-4">`;
        for (const item of items) {
            html += `<li>${item}</li>`;
        }
        html += `</ul>`;
    }
    if (title) {
        html += `</div>`;
    }
    return html;
}

// 날짜 포맷 함수
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 대시보드로 이동 (로그인 상태일 때)
function goToDashboard() {
    if (typeof showDashboard === 'function') {
        showDashboard();
        // URL을 대시보드로 설정
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + '#dashboard');
        } else {
            window.history.pushState(null, '', window.location.pathname + '#dashboard');
        }
    } else {
        // showDashboard가 아직 로드되지 않았으면 잠시 후 재시도
        setTimeout(() => {
            if (typeof showDashboard === 'function') {
                showDashboard();
            } else {
                alert('대시보드로 이동할 수 없습니다. 페이지를 새로고침해주세요.');
            }
        }, 100);
    }
}


