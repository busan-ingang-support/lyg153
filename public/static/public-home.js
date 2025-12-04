// ============================================
// 공개 홈페이지 (로그인 전)
// ============================================

// 공개 홈페이지 표시
async function showPublicHome() {
    const app = document.getElementById('app');
    
    // 홈페이지 설정 로드 (푸터용)
    let contactPhone = '000-0000-0000';
    let contactEmail = 'school@example.com';
    let contactAddress = '서울시 강남구';
    
    try {
        const response = await axios.get('/api/homepage');
        const settings = response.data.settings || {};
        contactPhone = settings.contact_phone || contactPhone;
        contactEmail = settings.contact_email || contactEmail;
        contactAddress = settings.contact_address || contactAddress;
    } catch (error) {
        console.error('푸터 정보 로드 실패:', error);
    }
    
    app.innerHTML = `
        <!-- 공개 학교 홈페이지 -->
        <div id="public-home" class="min-h-screen bg-white">
            <!-- 헤더 -->
            <header class="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
                <div class="container mx-auto px-4 py-5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4 cursor-pointer group" onclick="navigatePublicPage('home')">
                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <i class="fas fa-graduation-cap text-white text-2xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">대안학교</h1>
                                <p class="text-sm text-gray-500 font-medium">꿈을 키우는 학교</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-8">
                            <nav class="hidden md:flex space-x-6">
                                <a href="#" class="public-nav-item text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 relative group" data-page="home">
                                    홈
                                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <a href="#" class="public-nav-item text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 relative group" data-page="about">
                                    학교소개
                                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <a href="#" class="public-nav-item text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 relative group" data-page="education">
                                    교육과정
                                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <a href="#" class="public-nav-item text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 relative group" data-page="notice">
                                    공지사항
                                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <a href="#" class="public-nav-item text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 relative group" data-page="location">
                                    오시는 길
                                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            </nav>
                            ${typeof currentUser !== 'undefined' && currentUser ? `
                                <div class="flex items-center space-x-4">
                                    <span class="text-sm text-gray-600 font-medium">${escapeHtml(currentUser.name)}님</span>
                                    <button onclick="goToDashboard()" class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105">
                                        <i class="fas fa-tachometer-alt mr-2"></i>대시보드
                                    </button>
                                </div>
                            ` : `
                                <button onclick="showLoginModal()" class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105">
                                    <i class="fas fa-sign-in-alt mr-2"></i>로그인
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </header>

            <!-- 메인 컨텐츠 -->
            <main id="public-content">
                <!-- 여기에 동적으로 컨텐츠 로드 -->
            </main>

            <!-- 푸터 -->
            <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 mt-24 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div class="container mx-auto px-4 relative z-10">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div>
                            <div class="flex items-center space-x-3 mb-6">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                    <i class="fas fa-graduation-cap text-white text-xl"></i>
                                </div>
                                <h3 class="text-2xl font-bold">대안학교</h3>
                            </div>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                꿈을 키우고 가능성을 발견하는<br>
                                행복한 배움의 공간
                            </p>
                        </div>
                        <div>
                            <h4 class="font-bold text-lg mb-6 text-indigo-300">바로가기</h4>
                            <ul class="space-y-3 text-sm">
                                <li><a href="#" onclick="navigatePublicPage('about')" class="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <i class="fas fa-chevron-right text-xs mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform"></i>학교소개
                                </a></li>
                                <li><a href="#" onclick="navigatePublicPage('education')" class="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <i class="fas fa-chevron-right text-xs mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform"></i>교육과정
                                </a></li>
                                <li><a href="#" onclick="navigatePublicPage('notice')" class="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <i class="fas fa-chevron-right text-xs mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform"></i>공지사항
                                </a></li>
                                <li><a href="#" onclick="navigatePublicPage('location')" class="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <i class="fas fa-chevron-right text-xs mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform"></i>오시는 길
                                </a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-bold text-lg mb-6 text-indigo-300">문의</h4>
                            <ul class="space-y-3 text-sm text-gray-300">
                                <li class="flex items-center">
                                    <i class="fas fa-phone mr-3 text-indigo-400 w-5"></i>대표전화: ${escapeHtml(contactPhone)}
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-envelope mr-3 text-indigo-400 w-5"></i>이메일: ${escapeHtml(contactEmail)}
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-map-marker-alt mr-3 text-indigo-400 w-5"></i>주소: ${escapeHtml(contactAddress)}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="border-t border-gray-700/50 mt-12 pt-8 text-center">
                        <p class="text-gray-400 text-sm">&copy; 2024 대안학교. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>

        <!-- 로그인 모달 -->
        <div id="login-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                <button onclick="closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-2xl"></i>
                </button>
                
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 mb-4">
                        <i class="fas fa-graduation-cap text-2xl text-purple-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-1">로그인</h2>
                    <p class="text-gray-500 text-sm">학적 관리 시스템</p>
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
    `;

    // 네비게이션 이벤트 설정
    setupPublicNavigation();
    
    // URL에서 페이지 확인하여 해당 페이지로 이동
    const pageFromURL = getPublicPageFromURL();
    if (pageFromURL && pageFromURL !== 'home') {
        // 약간의 지연을 두어 기본 구조가 먼저 로드되도록 함
        setTimeout(() => {
            navigatePublicPage(pageFromURL, false); // URL은 이미 설정되어 있으므로 업데이트하지 않음
        }, 100);
    } else {
        // 기본 홈 페이지 로드
        showPublicHomePage();
        // URL이 없으면 기본 홈으로 설정
        if (!window.location.hash) {
            navigatePublicPage('home', false);
        }
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
            const page = e.target.getAttribute('data-page');
            
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

// 홈페이지 모듈 렌더링
function renderHomepageModule(module) {
    const containerClass = {
        'container': 'container mx-auto px-4',
        'full_width': 'w-full',
        'narrow': 'container mx-auto px-4 max-w-4xl'
    }[module.container_type] || 'container mx-auto px-4';
    
    const style = [];
    if (module.background_color) {
        style.push(`background-color: ${module.background_color}`);
    }
    if (module.background_image) {
        style.push(`background-image: url('${escapeHtml(module.background_image)}')`);
        style.push(`background-size: cover`);
        style.push(`background-position: center`);
    }
    if (module.padding_top) {
        style.push(`padding-top: ${module.padding_top}px`);
    }
    if (module.padding_bottom) {
        style.push(`padding-bottom: ${module.padding_bottom}px`);
    }
    if (module.margin_top) {
        style.push(`margin-top: ${module.margin_top}px`);
    }
    if (module.margin_bottom) {
        style.push(`margin-bottom: ${module.margin_bottom}px`);
    }
    
    const sectionStyle = style.length > 0 ? ` style="${style.join('; ')}"` : '';
    
    let moduleHTML = '';
    
    switch (module.module_type) {
        case 'hero':
            const heroBgStyle = module.background_image ? '' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600';
            moduleHTML = `
                <section class="relative text-white py-32 overflow-hidden"${sectionStyle}>
                    ${!module.background_image ? `<div class="absolute inset-0 ${heroBgStyle}"></div>` : ''}
                    <div class="absolute inset-0 bg-black/20"></div>
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
                    <div class="${containerClass} text-center relative z-10">
                        <div class="animate-fade-in-up">
                            <h2 class="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                                ${escapeHtml(module.title || '꿈을 키우는 학교')}
                            </h2>
                            <p class="text-xl md:text-2xl mb-12 text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
                                ${escapeHtml(module.subtitle || '우리 모두가 주인공이 되는 배움의 공간')}
                            </p>
                            <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <button onclick="navigatePublicPage('about')" class="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                    <i class="fas fa-info-circle mr-2"></i>학교 소개 보기
                                </button>
                                <button onclick="showLoginModal()" class="bg-indigo-600/90 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/30 shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                                    <i class="fas fa-sign-in-alt mr-2"></i>로그인
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                </section>
            `;
            break;
            
        case 'slides':
            if (module.slides && module.slides.length > 0) {
                moduleHTML = `
                    <section class="py-16"${sectionStyle}>
                        <div class="${containerClass}">
                            <div class="relative overflow-hidden rounded-lg">
                                <div id="slideshow-${module.id}" class="slideshow-container">
                                    ${module.slides.map((slide, index) => `
                                        <div class="slide ${index === 0 ? 'active' : ''}" style="display: ${index === 0 ? 'block' : 'none'};">
                                            <img src="${escapeHtml(slide.image_url)}" alt="${escapeHtml(slide.image_alt || '')}" class="w-full h-auto object-cover" style="max-height: 600px;">
                                            ${slide.title || slide.subtitle ? `
                                                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                                    <div class="text-center text-white px-4">
                                                        ${slide.title ? `<h3 class="text-4xl font-bold mb-2">${escapeHtml(slide.title)}</h3>` : ''}
                                                        ${slide.subtitle ? `<p class="text-xl">${escapeHtml(slide.subtitle)}</p>` : ''}
                                                        ${slide.link_url ? `<a href="${escapeHtml(slide.link_url)}" class="inline-block mt-4 bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">${escapeHtml(slide.link_text || '자세히 보기')}</a>` : ''}
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                                ${module.slides.length > 1 ? `
                                    <button onclick="previousSlide(${module.id})" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3">
                                        <i class="fas fa-chevron-left text-gray-800"></i>
                                    </button>
                                    <button onclick="nextSlide(${module.id})" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3">
                                        <i class="fas fa-chevron-right text-gray-800"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </section>
                `;
            }
            break;
            
        case 'values':
            const valueColors = [
                { bg: 'from-red-500 to-pink-500', icon: 'from-red-100 to-pink-100', text: 'text-red-600' },
                { bg: 'from-blue-500 to-indigo-500', icon: 'from-blue-100 to-indigo-100', text: 'text-blue-600' },
                { bg: 'from-green-500 to-emerald-500', icon: 'from-green-100 to-emerald-100', text: 'text-green-600' }
            ];
            moduleHTML = `
                <section class="py-20 bg-gradient-to-br from-gray-50 to-white"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="text-center mb-16">
                            <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">우리의 교훈</h2>
                            <p class="text-gray-600 text-lg">가치 있는 교육을 위한 우리의 약속</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            ${[1, 2, 3].map((i, idx) => {
                                const icon = module[`value${i}_icon`];
                                const title = module[`value${i}_title`] || '';
                                const desc = module[`value${i}_desc`] || '';
                                const colors = valueColors[idx] || valueColors[0];
                                const isFontAwesome = icon && (icon.startsWith('fa-') || icon.startsWith('fas ') || icon.startsWith('far ') || icon.startsWith('fab ') || icon.startsWith('fal ') || icon.startsWith('fad '));
                                const iconClass = isFontAwesome ? (icon.startsWith('fa-') ? `fas ${icon}` : icon) : '';
                                return `
                                    <div class="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                                        <div class="text-center">
                                            ${icon ? (
                                                isFontAwesome ? `
                                                    <div class="w-24 h-24 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                                                        <i class="${iconClass} text-5xl ${colors.text}"></i>
                                                    </div>
                                                ` : `
                                                    <div class="w-24 h-24 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg p-4">
                                                        <img src="${escapeHtml(icon)}" alt="${escapeHtml(title)}" class="w-full h-full object-contain">
                                                    </div>
                                                `
                                            ) : `
                                                <div class="w-24 h-24 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                                                    <i class="fas fa-heart text-5xl ${colors.text}"></i>
                                                </div>
                                            `}
                                            <h3 class="text-2xl font-bold text-gray-800 mb-3">${escapeHtml(title)}</h3>
                                            <p class="text-gray-600 leading-relaxed">${escapeHtml(desc)}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'features':
            const featureColors = [
                { bg: 'from-indigo-500 to-purple-500', icon: 'from-indigo-100 to-purple-100', text: 'text-indigo-600' },
                { bg: 'from-blue-500 to-cyan-500', icon: 'from-blue-100 to-cyan-100', text: 'text-blue-600' },
                { bg: 'from-purple-500 to-pink-500', icon: 'from-purple-100 to-pink-100', text: 'text-purple-600' },
                { bg: 'from-green-500 to-teal-500', icon: 'from-green-100 to-teal-100', text: 'text-green-600' }
            ];
            moduleHTML = `
                <section class="py-20 bg-white"${sectionStyle}>
                    <div class="${containerClass}">
                        <div class="text-center mb-16">
                            <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">우리 학교의 특징</h2>
                            <p class="text-gray-600 text-lg">차별화된 교육 프로그램과 시설</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${[1, 2, 3, 4].map((i, idx) => {
                                const icon = module[`feature${i}_icon`];
                                const title = module[`feature${i}_title`] || '';
                                const desc = module[`feature${i}_desc`] || '';
                                const colors = featureColors[idx] || featureColors[0];
                                const isFontAwesome = icon && (icon.startsWith('fa-') || icon.startsWith('fas ') || icon.startsWith('far ') || icon.startsWith('fab ') || icon.startsWith('fal ') || icon.startsWith('fad '));
                                const iconClass = isFontAwesome ? (icon.startsWith('fa-') ? `fas ${icon}` : icon) : '';
                                return `
                                    <div class="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-md hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                                        <div class="text-center">
                                            ${icon ? (
                                                isFontAwesome ? `
                                                    <div class="w-20 h-20 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                                                        <i class="${iconClass} text-4xl ${colors.text}"></i>
                                                    </div>
                                                ` : `
                                                    <div class="w-20 h-20 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg p-4">
                                                        <img src="${escapeHtml(icon)}" alt="${escapeHtml(title)}" class="w-full h-full object-contain">
                                                    </div>
                                                `
                                            ) : `
                                                <div class="w-20 h-20 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                                                    <i class="fas fa-users text-4xl ${colors.text}"></i>
                                                </div>
                                            `}
                                            <h4 class="font-bold text-lg text-gray-800 mb-3">${escapeHtml(title)}</h4>
                                            <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(desc)}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'text':
            moduleHTML = `
                <section class="py-16"${sectionStyle}>
                    <div class="${containerClass}">
                        ${module.title ? `<h2 class="text-3xl font-bold mb-6 text-gray-800">${escapeHtml(module.title)}</h2>` : ''}
                        <div class="prose max-w-none">
                            ${escapeHtml(module.content || '').replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </section>
            `;
            break;
            
        case 'image':
            if (module.image_url) {
                const imgStyle = [];
                if (module.image_width) imgStyle.push(`width: ${module.image_width}px`);
                if (module.image_height) imgStyle.push(`height: ${module.image_height}px`);
                moduleHTML = `
                    <section class="py-16"${sectionStyle}>
                        <div class="${containerClass} text-center">
                            <img src="${escapeHtml(module.image_url)}" 
                                 alt="${escapeHtml(module.image_alt || '')}" 
                                 class="mx-auto ${imgStyle.length > 0 ? '' : 'max-w-full h-auto'}"
                                 ${imgStyle.length > 0 ? `style="${imgStyle.join('; ')}"` : ''}>
                        </div>
                    </section>
                `;
            }
            break;
            
        case 'custom':
            if (module.html_content) {
                moduleHTML = `
                    <section class="py-16"${sectionStyle}>
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

// 슬라이드 네비게이션
let slideIndices = {};

function nextSlide(moduleId) {
    if (!slideIndices[moduleId]) slideIndices[moduleId] = 0;
    const container = document.querySelector(`#slideshow-${moduleId}`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    slides[slideIndices[moduleId]].style.display = 'none';
    slideIndices[moduleId] = (slideIndices[moduleId] + 1) % slides.length;
    slides[slideIndices[moduleId]].style.display = 'block';
}

function previousSlide(moduleId) {
    if (!slideIndices[moduleId]) slideIndices[moduleId] = 0;
    const container = document.querySelector(`#slideshow-${moduleId}`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    slides[slideIndices[moduleId]].style.display = 'none';
    slideIndices[moduleId] = (slideIndices[moduleId] - 1 + slides.length) % slides.length;
    slides[slideIndices[moduleId]].style.display = 'block';
}

// 공개 공지사항 미리보기 로드
async function loadPublicNoticePreview() {
    try {
        // 게시판 API 호출 (인증 없이)
        const response = await axios.get('/api/boards/posts?board_type=student&is_notice=1&limit=5');
        
        const container = document.getElementById('public-notice-preview');
        const notices = response.data.posts || [];
        
        if (notices.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">등록된 공지사항이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="space-y-3">
                ${notices.map(notice => `
                    <div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex items-center space-x-3 flex-1">
                            <i class="fas fa-bullhorn text-purple-600"></i>
                            <span class="font-medium text-gray-800">${escapeHtml(notice.title)}</span>
                        </div>
                        <span class="text-sm text-gray-500">${formatDate(notice.created_at)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        document.getElementById('public-notice-preview').innerHTML = 
            '<p class="text-gray-500 text-center py-8">공지사항을 불러올 수 없습니다.</p>';
    }
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

                        <div class="bg-gray-50 rounded-xl p-8">
                            <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">연혁</h3>
                            <div class="space-y-4">
                                ${historyList.map(item => `
                                    <div class="flex">
                                        <span class="font-bold text-purple-600 w-32">${escapeHtml(item.date)}</span>
                                        <span class="text-gray-700">${escapeHtml(item.event)}</span>
                                    </div>
                                `).join('')}
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

