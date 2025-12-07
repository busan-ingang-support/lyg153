// 홈페이지 모듈 관리 기능

let currentModules = [];
let draggedModule = null;
let draggedOverModule = null;
let currentPage = 'home'; // 현재 선택된 페이지
let currentTab = 'modules'; // 현재 탭: 'modules' 또는 'settings'
let homepageBasicSettings = {}; // 기본 설정
let homepageContainer = null; // 컨테이너 참조 저장

// 홈페이지 모듈 관리 페이지 표시
async function showHomepageManagement(container) {
    // 권한 체크
    if (currentUser.role !== 'super_admin') {
        alert('홈페이지 관리는 최고 관리자만 접근할 수 있습니다.');
        navigateToPage('dashboard');
        return;
    }

    const content = container || document.getElementById('main-content');
    homepageContainer = content; // 컨테이너 참조 저장
    
    // 로딩 표시
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">
                <i class="fas fa-globe mr-2"></i>홈페이지 관리
            </h2>
            <p class="text-gray-600 mt-2">홈페이지 기본 설정 및 모듈을 관리합니다</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-500 py-8">로딩 중...</p>
        </div>
    `;
    
    try {
        // 현재 모듈 로드
        const [modulesResponse, settingsResponse] = await Promise.all([
            axios.get('/api/homepage-modules/admin', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            }),
            axios.get('/api/homepage/admin', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            })
        ]);
        
        currentModules = modulesResponse.data.modules || [];
        homepageBasicSettings = settingsResponse.data.settings || {};
        
        renderModuleManagement(content);
        
    } catch (error) {
        console.error('홈페이지 데이터 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                홈페이지 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 탭 전환
function switchTab(tab) {
    currentTab = tab;
    const container = homepageContainer || document.getElementById('main-content');
    if (!container) {
        console.error('Container not found for switchTab');
        return;
    }
    renderModuleManagement(container);
}

// 페이지 전환
function switchPage(page) {
    currentPage = page;
    const container = homepageContainer || document.getElementById('main-content');
    if (!container) {
        console.error('Container not found for switchPage');
        return;
    }
    renderModuleManagement(container);
}

// 모듈 관리 UI 렌더링
function renderModuleManagement(container) {
    // 현재 페이지의 모듈만 필터링
    const pageModules = currentModules.filter(m => m.page === currentPage);
    
    container.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-globe mr-2"></i>홈페이지 관리
                    </h2>
                    <p class="text-gray-600 mt-2">홈페이지 기본 설정 및 모듈을 관리합니다</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.open('/', '_blank')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                        <i class="fas fa-external-link-alt mr-2"></i>미리보기
                    </button>
                    ${currentTab === 'modules' ? `
                        <button onclick="showAddModuleModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>모듈 추가
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <!-- 메인 탭 (기본설정 / 모듈 관리) -->
            <div class="border-b border-gray-200 mb-6">
                <nav class="flex space-x-4">
                    <button onclick="switchTab('settings')" class="${currentTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-6 border-b-2 font-semibold transition-colors">
                        <i class="fas fa-cog mr-2"></i>기본 설정
                    </button>
                    <button onclick="switchTab('modules')" class="${currentTab === 'modules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-6 border-b-2 font-semibold transition-colors">
                        <i class="fas fa-puzzle-piece mr-2"></i>모듈 관리
                    </button>
                </nav>
            </div>
        </div>
        
        ${currentTab === 'settings' ? renderBasicSettingsTab() : renderModulesTab(pageModules)}
    `;
    
    // 드래그 앤 드롭 이벤트 설정 (모듈 탭에서만)
    if (currentTab === 'modules') {
        setupDragAndDrop();
    }
    
    // 기본 설정 폼 이벤트 설정
    if (currentTab === 'settings') {
        setupBasicSettingsForm();
    }
}

// 기본 설정 탭 렌더링
function renderBasicSettingsTab() {
    return `
        <div class="bg-white rounded-lg shadow-md p-6">
            <form id="basic-settings-form" class="space-y-8">
                <!-- 학교 기본 정보 -->
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        <i class="fas fa-school mr-2 text-blue-600"></i>학교 기본 정보
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학교명</label>
                            <input type="text" id="setting-school_name" 
                                   value="${escapeHtmlAttr(homepageBasicSettings.school_name || '')}"
                                   placeholder="예: 대안학교"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">학교 슬로건</label>
                            <input type="text" id="setting-school_slogan" 
                                   value="${escapeHtmlAttr(homepageBasicSettings.school_slogan || '')}"
                                   placeholder="예: 꿈을 키우는 학교"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                </div>
                
                <!-- 연락처 정보 -->
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        <i class="fas fa-address-card mr-2 text-green-600"></i>연락처 정보
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">대표전화</label>
                            <input type="text" id="setting-contact_phone" 
                                   value="${escapeHtmlAttr(homepageBasicSettings.contact_phone || '')}"
                                   placeholder="예: 02-1234-5678"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input type="email" id="setting-contact_email" 
                                   value="${escapeHtmlAttr(homepageBasicSettings.contact_email || '')}"
                                   placeholder="예: school@example.com"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
                            <input type="text" id="setting-contact_address" 
                                   value="${escapeHtmlAttr(homepageBasicSettings.contact_address || '')}"
                                   placeholder="예: 서울시 강남구 테헤란로 123"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                </div>
                
                <!-- 기타 설정 -->
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        <i class="fas fa-palette mr-2 text-purple-600"></i>디자인 설정
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">메인 컬러</label>
                            <div class="flex items-center space-x-3">
                                <input type="color" id="setting-primary_color" 
                                       value="${homepageBasicSettings.primary_color || '#1e40af'}"
                                       class="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer">
                                <input type="text" id="setting-primary_color_text" 
                                       value="${homepageBasicSettings.primary_color || '#1e40af'}"
                                       class="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                       oninput="document.getElementById('setting-primary_color').value = this.value">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 저장 버튼 -->
                <div class="flex justify-end pt-4 border-t border-gray-200">
                    <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-save mr-2"></i>기본 설정 저장
                    </button>
                </div>
            </form>
        </div>
        
        <!-- 도움말 -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-bold text-blue-800 mb-2"><i class="fas fa-info-circle mr-2"></i>도움말</h4>
            <ul class="text-sm text-blue-700 space-y-1">
                <li>• <strong>학교명</strong>과 <strong>슬로건</strong>은 홈페이지 헤더와 푸터에 표시됩니다.</li>
                <li>• <strong>연락처 정보</strong>는 홈페이지 상단바와 푸터, 오시는 길 페이지에 표시됩니다.</li>
                <li>• 모듈별 상세 내용은 <strong>모듈 관리</strong> 탭에서 설정하세요.</li>
            </ul>
        </div>
    `;
}

// 모듈 관리 탭 렌더링
function renderModulesTab(pageModules) {
    return `
        <!-- 페이지 탭 -->
        <div class="border-b border-gray-200 mb-6">
            <nav class="flex space-x-4">
                <button onclick="switchPage('home')" class="page-tab ${currentPage === 'home' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-4 border-b-2 font-medium transition-colors">
                    <i class="fas fa-home mr-2"></i>홈
                </button>
                <button onclick="switchPage('about')" class="page-tab ${currentPage === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-4 border-b-2 font-medium transition-colors">
                    <i class="fas fa-info-circle mr-2"></i>학교소개
                </button>
                <button onclick="switchPage('education')" class="page-tab ${currentPage === 'education' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-4 border-b-2 font-medium transition-colors">
                    <i class="fas fa-book mr-2"></i>교육과정
                </button>
                <button onclick="switchPage('notice')" class="page-tab ${currentPage === 'notice' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-4 border-b-2 font-medium transition-colors">
                    <i class="fas fa-bullhorn mr-2"></i>공지사항
                </button>
                <button onclick="switchPage('location')" class="page-tab ${currentPage === 'location' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'} py-3 px-4 border-b-2 font-medium transition-colors">
                    <i class="fas fa-map-marker-alt mr-2"></i>오시는 길
                </button>
            </nav>
        </div>
        
        <!-- 모듈 목록 -->
        <div id="modules-list" class="space-y-4">
            ${pageModules.length === 0 ? `
                <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <i class="fas fa-puzzle-piece text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 mb-4">등록된 모듈이 없습니다.</p>
                    <button onclick="showAddModuleModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        첫 번째 모듈 추가하기
                    </button>
                </div>
            ` : pageModules.map((module, index) => renderModuleCard(module, index)).join('')}
        </div>
        
        <!-- 저장 버튼 -->
        ${pageModules.length > 0 ? `
            <div class="mt-6 flex justify-end">
                <button onclick="saveModuleOrder()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-save mr-2"></i>순서 저장
                </button>
            </div>
        ` : ''}
    `;
}

// HTML 속성 이스케이프
function escapeHtmlAttr(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// 기본 설정 폼 이벤트 설정
function setupBasicSettingsForm() {
    const form = document.getElementById('basic-settings-form');
    if (!form) return;
    
    // 색상 입력 동기화
    const colorInput = document.getElementById('setting-primary_color');
    const colorTextInput = document.getElementById('setting-primary_color_text');
    if (colorInput && colorTextInput) {
        colorInput.addEventListener('input', () => {
            colorTextInput.value = colorInput.value;
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveBasicSettings();
    });
}

// 기본 설정 저장
async function saveBasicSettings() {
    try {
        const settings = {
            school_name: document.getElementById('setting-school_name')?.value || '',
            school_slogan: document.getElementById('setting-school_slogan')?.value || '',
            contact_phone: document.getElementById('setting-contact_phone')?.value || '',
            contact_email: document.getElementById('setting-contact_email')?.value || '',
            contact_address: document.getElementById('setting-contact_address')?.value || '',
            primary_color: document.getElementById('setting-primary_color')?.value || '#1e40af'
        };
        
        const response = await axios.post('/api/homepage', settings, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        if (response.data.success) {
            // 로컬 설정 업데이트
            homepageBasicSettings = { ...homepageBasicSettings, ...settings };
            alert('기본 설정이 저장되었습니다!');
        } else {
            alert('저장에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('기본 설정 저장 실패:', error);
        alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
}

// 모듈 카드 렌더링
function renderModuleCard(module, index) {
    const moduleTypeNames = {
        'hero': '메인 배너',
        'banner': '메인 배너',
        'slides': '슬라이드 배너',
        'quick_links': '바로가기 메뉴',
        'values': '교훈/핵심가치',
        'features': '학교 특징',
        'notice': '공지사항',
        'notice_board': '공지사항 게시판',
        'stats': '학교 현황 통계',
        'gallery': '학교 갤러리',
        'about': '학교 소개',
        'contact': '연락처/오시는 길',
        'map': '오시는 길',
        'text': '텍스트 섹션',
        'image': '이미지 섹션',
        'video': '비디오 섹션',
        'custom': '커스텀 HTML'
    };
    
    const statusBadge = module.is_active 
        ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">활성</span>'
        : '<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">비활성</span>';
    
    return `
        <div 
            class="module-card bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-move ${!module.is_active ? 'opacity-60' : ''}"
            data-module-id="${module.id}"
            draggable="true"
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 flex-1">
                    <div class="drag-handle text-gray-400 hover:text-gray-600">
                        <i class="fas fa-grip-vertical text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-3">
                            <h3 class="text-lg font-bold text-gray-800">${moduleTypeNames[module.module_type] || module.module_type}</h3>
                            ${statusBadge}
                            <span class="text-sm text-gray-500">순서: ${module.display_order + 1}</span>
                        </div>
                        <div class="mt-2 text-sm text-gray-600">
                            <span class="mr-4">컨테이너: ${module.container_type || 'container'}</span>
                            ${module.background_color ? `<span class="mr-4">배경색: <span class="inline-block w-4 h-4 rounded" style="background-color: ${module.background_color}"></span></span>` : ''}
                            ${module.background_image ? '<span class="mr-4"><i class="fas fa-image"></i> 배경 이미지</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="editModule(${module.id})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button onclick="toggleModuleActive(${module.id}, ${module.is_active ? 0 : 1})" class="px-3 py-1 ${module.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} rounded">
                        <i class="fas fa-${module.is_active ? 'eye-slash' : 'eye'}"></i> ${module.is_active ? '비활성' : '활성'}
                    </button>
                    <button onclick="deleteModule(${module.id})" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const moduleCards = document.querySelectorAll('.module-card');
    
    moduleCards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedModule = card;
            card.classList.add('opacity-50');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('opacity-50');
            draggedModule = null;
            draggedOverModule = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedModule && draggedModule !== card) {
                card.classList.add('border-blue-500');
                draggedOverModule = card;
            }
        });
        
        card.addEventListener('dragleave', () => {
            card.classList.remove('border-blue-500');
            draggedOverModule = null;
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('border-blue-500');
            
            if (draggedModule && draggedModule !== card) {
                const draggedId = parseInt(draggedModule.dataset.moduleId);
                const targetId = parseInt(card.dataset.moduleId);
                
                const draggedIndex = currentModules.findIndex(m => m.id === draggedId);
                const targetIndex = currentModules.findIndex(m => m.id === targetId);
                
                // 배열에서 이동
                const [moved] = currentModules.splice(draggedIndex, 1);
                currentModules.splice(targetIndex, 0, moved);
                
                // display_order 업데이트
                currentModules.forEach((module, index) => {
                    module.display_order = index;
                });
                
                // UI 다시 렌더링
                const container = document.getElementById('main-content');
                renderModuleManagement(container);
            }
        });
    });
}

// 모듈 순서 저장
async function saveModuleOrder() {
    try {
        const pageModules = currentModules.filter(m => m.page === currentPage);
        const moduleOrders = pageModules.map((module, index) => ({
            id: module.id,
            display_order: index
        }));
        
        await axios.post('/api/homepage-modules/reorder', { moduleOrders }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('모듈 순서가 저장되었습니다!');
        
        // 다시 로드 (페이지 유지)
        const response = await axios.get('/api/homepage-modules/admin', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        currentModules = response.data.modules || [];
        const container = document.getElementById('main-content');
        renderModuleManagement(container);
    } catch (error) {
        console.error('모듈 순서 저장 실패:', error);
        alert('모듈 순서 저장에 실패했습니다.');
    }
}

// 모듈 추가 모달 표시
function showAddModuleModal() {
    const modal = document.createElement('div');
    modal.id = 'add-module-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">새 모듈 추가</h2>
                <button onclick="closeAddModuleModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <form id="add-module-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">모듈 타입 *</label>
                    <select id="module-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">선택하세요</option>
                        <optgroup label="배너">
                            <option value="hero">메인 배너</option>
                            <option value="slides">슬라이드 배너</option>
                        </optgroup>
                        <optgroup label="주요 섹션">
                            <option value="quick_links">바로가기 메뉴</option>
                            <option value="notice">공지사항</option>
                            <option value="values">교훈/핵심가치</option>
                            <option value="features">학교 특징</option>
                        </optgroup>
                        <optgroup label="정보">
                            <option value="stats">학교 현황 통계</option>
                            <option value="gallery">학교 갤러리</option>
                            <option value="contact">연락처/오시는 길</option>
                        </optgroup>
                        <optgroup label="콘텐츠">
                            <option value="text">텍스트 섹션</option>
                            <option value="image">이미지 섹션</option>
                            <option value="custom">커스텀 HTML</option>
                        </optgroup>
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">컨테이너 타입</label>
                        <select id="container-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="container">컨테이너 (기본)</option>
                            <option value="full_width">전체 너비</option>
                            <option value="narrow">좁은 컨테이너</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">초기 상태</label>
                        <select id="is-active" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="1">활성</option>
                            <option value="0">비활성</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" onclick="closeAddModuleModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        추가 후 편집
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = document.getElementById('add-module-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const moduleType = document.getElementById('module-type').value;
        const containerType = document.getElementById('container-type').value;
        const isActive = parseInt(document.getElementById('is-active').value);
        
        if (!moduleType) {
            alert('모듈 타입을 선택해주세요.');
            return;
        }
        
        try {
            const pageModules = currentModules.filter(m => m.page === currentPage);
            const maxOrder = pageModules.length > 0 
                ? Math.max(...pageModules.map(m => m.display_order)) + 1 
                : 0;
            
            const response = await axios.post('/api/homepage-modules', {
                module_type: moduleType,
                page: currentPage,
                display_order: maxOrder,
                is_active: isActive,
                container_type: containerType,
                settings: getDefaultModuleSettings(moduleType),
                slides: moduleType === 'slides' ? [] : undefined
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            closeAddModuleModal();
            
            // 최신 모듈 목록 로드
            const refreshResponse = await axios.get('/api/homepage-modules/admin', {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            currentModules = refreshResponse.data.modules || [];
            
            // 편집 모달 열기
            editModule(response.data.id);
            
        } catch (error) {
            console.error('모듈 추가 실패:', error);
            alert('모듈 추가에 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
    });
}

// 모듈 추가 모달 닫기
function closeAddModuleModal() {
    const modal = document.getElementById('add-module-modal');
    if (modal) {
        modal.remove();
    }
}

// 기본 모듈 설정 가져오기
function getDefaultModuleSettings(moduleType) {
    const defaults = {
        'hero': {
            title: '대안학교',
            subtitle: '꿈을 키우는 학교'
        },
        'values': {
            section_title: '교훈',
            value1_icon: 'fa-heart',
            value1_title: '사랑',
            value1_desc: '서로를 존중하고 배려하는 마음',
            value2_icon: 'fa-book',
            value2_title: '지혜',
            value2_desc: '올바른 판단과 지식을 추구',
            value3_icon: 'fa-hands-helping',
            value3_title: '섬김',
            value3_desc: '공동체를 위해 봉사하는 정신'
        },
        'features': {
            section_title: '학교 특징',
            feature1_icon: 'fa-users',
            feature1_title: '소규모 학급',
            feature1_desc: '학급당 15~20명의 소규모 학급 운영',
            feature2_icon: 'fa-chalkboard-teacher',
            feature2_title: '맞춤형 교육',
            feature2_desc: '학생 개개인의 특성에 맞춘 교육',
            feature3_icon: 'fa-hiking',
            feature3_title: '현장 체험',
            feature3_desc: '다양한 현장 체험을 통한 실천적 학습',
            feature4_icon: 'fa-palette',
            feature4_title: '예체능 교육',
            feature4_desc: '음악, 미술, 체육 등 다양한 프로그램'
        },
        'quick_links': {
            links: JSON.stringify([
                { icon: 'fa-user-graduate', title: '입학안내', url: '#', color: 'blue' },
                { icon: 'fa-calendar-alt', title: '학사일정', url: '#', color: 'green' },
                { icon: 'fa-utensils', title: '급식안내', url: '#', color: 'orange' },
                { icon: 'fa-file-alt', title: '가정통신문', url: '#', color: 'purple' }
            ])
        },
        'stats': {
            stat1_label: '재학생',
            stat1_value: '100',
            stat1_suffix: '명',
            stat2_label: '교원',
            stat2_value: '15',
            stat2_suffix: '명',
            stat3_label: '학급',
            stat3_value: '6',
            stat3_suffix: '개',
            stat4_label: '설립',
            stat4_value: '2020',
            stat4_suffix: '년'
        },
        'gallery': {
            section_title: '학교 갤러리',
            images: JSON.stringify([])
        },
        'contact': {
            section_title: '오시는 길',
            phone: '000-0000-0000',
            email: 'school@example.com',
            address: '서울시 강남구',
            map_embed: ''
        }
    };
    
    return defaults[moduleType] || {};
}

// 모듈 편집
async function editModule(moduleId) {
    const module = currentModules.find(m => m.id === moduleId);
    if (!module) {
        alert('모듈을 찾을 수 없습니다.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'edit-module-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // 모듈 타입별 편집 폼 생성
    let formHTML = getModuleEditForm(module);
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">모듈 편집</h2>
                <button onclick="closeEditModuleModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="flex gap-6 flex-1 overflow-hidden">
                <!-- 편집 폼 -->
                <div class="w-1/2 overflow-y-auto pr-4">
                    <form id="edit-module-form" class="space-y-6">
                        ${formHTML}
                        <div class="flex justify-end space-x-4 mt-6 pt-6 border-t">
                            <button type="button" onclick="closeEditModuleModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                저장
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- 실시간 미리보기 -->
                <div class="w-1/2 border-l pl-6 overflow-y-auto">
                    <div class="sticky top-0 bg-white pb-4 mb-4 border-b">
                        <h3 class="text-lg font-bold text-gray-800 mb-2">
                            <i class="fas fa-eye mr-2"></i>실시간 미리보기
                        </h3>
                        <p class="text-sm text-gray-600">입력한 내용이 실시간으로 표시됩니다</p>
                    </div>
                    <div id="module-preview" class="min-h-[400px]">
                        ${renderModulePreview(module)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 현재 편집 중인 모듈을 전역 변수에 저장 (미리보기 업데이트용)
    window.currentEditingModule = module;
    
    // 폼 제출 이벤트
    const form = document.getElementById('edit-module-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveModule(moduleId, form);
        window.currentEditingModule = null;
    });
    
    // 실시간 미리보기 업데이트
    setupPreviewUpdate(module);
}

// 모듈 편집 폼 생성
function getModuleEditForm(module) {
    const commonSettings = `
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-bold mb-4">공통 설정</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">컨테이너 타입</label>
                    <select name="container_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="container" ${module.container_type === 'container' ? 'selected' : ''}>컨테이너 (기본)</option>
                        <option value="full_width" ${module.container_type === 'full_width' ? 'selected' : ''}>전체 너비</option>
                        <option value="narrow" ${module.container_type === 'narrow' ? 'selected' : ''}>좁은 컨테이너</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">활성화</label>
                    <select name="is_active" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="1" ${module.is_active ? 'selected' : ''}>활성</option>
                        <option value="0" ${!module.is_active ? 'selected' : ''}>비활성</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">배경색</label>
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="use_bg_color" name="use_bg_color" ${module.background_color && module.background_color !== '#ffffff' ? 'checked' : ''} onchange="toggleBgColorInput()" class="w-4 h-4">
                        <input type="color" id="bg_color_input" name="background_color" value="${module.background_color || '#ffffff'}" class="w-20 h-10 border border-gray-300 rounded-lg ${module.background_color && module.background_color !== '#ffffff' ? '' : 'opacity-50'}" ${module.background_color && module.background_color !== '#ffffff' ? '' : 'disabled'}>
                        <span class="text-sm text-gray-500">${module.background_color && module.background_color !== '#ffffff' ? '' : '(기본 배경)'}</span>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">배경 이미지 URL</label>
                    <input type="text" name="background_image" value="${module.background_image || ''}" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">상단 여백 (px)</label>
                    <input type="number" name="padding_top" value="${module.padding_top || 0}" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">하단 여백 (px)</label>
                    <input type="number" name="padding_bottom" value="${module.padding_bottom || 0}" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>
        </div>
    `;
    
    let typeSpecificForm = '';
    
    switch (module.module_type) {
        case 'hero':
            typeSpecificForm = `
                <div class="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">히어로 섹션 설정</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">메인 타이틀</label>
                            <input type="text" name="title" value="${module.title || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">서브 타이틀</label>
                            <input type="text" name="subtitle" value="${module.subtitle || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">배경 동영상 URL</label>
                            <input type="text" name="video_url" value="${module.video_url || ''}" placeholder="YouTube URL 또는 동영상 파일 URL" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <p class="text-xs text-gray-500 mt-1">
                                YouTube: https://www.youtube.com/watch?v=VIDEO_ID 또는 https://youtu.be/VIDEO_ID<br>
                                직접 업로드: https://example.com/video.mp4 (MP4, WebM, OGG)
                            </p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">배경 이미지 URL (동영상 없을 때)</label>
                            <input type="text" name="hero_background_image" value="${module.hero_background_image || ''}" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'slides':
            typeSpecificForm = `
                <div class="bg-purple-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">슬라이드 설정</h3>
                    <div id="slides-list" class="space-y-4 mb-4">
                        ${(module.slides || []).map((slide, index) => renderSlideEditor(slide, index)).join('')}
                    </div>
                    <button type="button" onclick="addSlide()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                        <i class="fas fa-plus mr-2"></i>슬라이드 추가
                    </button>
                </div>
            `;
            break;
            
        case 'values':
            typeSpecificForm = `
                <div class="bg-green-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">교훈 설정</h3>
                    <div class="grid grid-cols-3 gap-4">
                        ${[1, 2, 3].map(i => `
                            <div class="bg-white rounded-lg p-4">
                                <h4 class="font-bold mb-2">교훈 ${i}</h4>
                                <div class="mb-2">
                                    <label class="block text-xs text-gray-600 mb-1">아이콘 (Font Awesome 클래스 또는 이미지 URL)</label>
                                    <input type="text" name="value${i}_icon" value="${module[`value${i}_icon`] || ''}" placeholder="fa-heart 또는 https://..." class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                </div>
                                <div class="mb-2">
                                    <label class="block text-xs text-gray-600 mb-1">제목</label>
                                    <input type="text" name="value${i}_title" value="${module[`value${i}_title`] || ''}" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                </div>
                                <div>
                                    <label class="block text-xs text-gray-600 mb-1">설명</label>
                                    <textarea name="value${i}_desc" rows="2" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">${module[`value${i}_desc`] || ''}</textarea>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
            
        case 'features':
            typeSpecificForm = `
                <div class="bg-yellow-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">특징 설정</h3>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        ${[1, 2, 3, 4].map(i => `
                            <div class="bg-white rounded-lg p-4">
                                <h4 class="font-bold mb-2">특징 ${i}</h4>
                                <div class="mb-2">
                                    <label class="block text-xs text-gray-600 mb-1">아이콘 (Font Awesome 클래스 또는 이미지 URL)</label>
                                    <input type="text" name="feature${i}_icon" value="${module[`feature${i}_icon`] || ''}" placeholder="fa-users 또는 https://..." class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                </div>
                                <div class="mb-2">
                                    <label class="block text-xs text-gray-600 mb-1">제목</label>
                                    <input type="text" name="feature${i}_title" value="${module[`feature${i}_title`] || ''}" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                </div>
                                <div>
                                    <label class="block text-xs text-gray-600 mb-1">설명</label>
                                    <textarea name="feature${i}_desc" rows="2" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">${module[`feature${i}_desc`] || ''}</textarea>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
            
        case 'about':
            typeSpecificForm = `
                <div class="bg-indigo-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">학교 소개 설정</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">설립 이념</label>
                            <textarea name="ideology" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${module.ideology || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교육 목표 (줄바꿈으로 구분)</label>
                            <textarea name="goals" rows="5" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${module.goals || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교육 특징 (줄바꿈으로 구분)</label>
                            <textarea name="features" rows="5" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${module.features || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'contact':
        case 'map':
            typeSpecificForm = `
                <div class="bg-teal-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">연락처/오시는 길 설정</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">섹션 제목</label>
                            <input type="text" name="section_title" value="${module.section_title || '오시는 길'}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                                <input type="text" name="phone" value="${module.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                <input type="email" name="email" value="${module.email || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
                            <input type="text" name="address" value="${module.address || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">지도 임베드 코드 (iframe 또는 HTML)</label>
                            <textarea name="map_embed" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm">${module.map_embed || ''}</textarea>
                            <p class="text-xs text-gray-500 mt-1">카카오맵, 네이버지도 등의 공유 임베드 코드를 붙여넣으세요</p>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'quick_links':
            const links = typeof module.links === 'string' ? JSON.parse(module.links || '[]') : (module.links || []);
            typeSpecificForm = `
                <div class="bg-cyan-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">바로가기 메뉴 설정</h3>
                    <div id="quick-links-list" class="space-y-4">
                        ${links.map((link, idx) => `
                            <div class="quick-link-item bg-white rounded-lg p-4 border border-gray-300" data-index="${idx}">
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="font-bold">바로가기 ${idx + 1}</h4>
                                    <button type="button" onclick="removeQuickLink(${idx})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">아이콘 (Font Awesome)</label>
                                        <input type="text" name="link_icon_${idx}" value="${link.icon || ''}" placeholder="fa-link" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">제목</label>
                                        <input type="text" name="link_title_${idx}" value="${link.title || ''}" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">URL</label>
                                        <input type="text" name="link_url_${idx}" value="${link.url || ''}" placeholder="https://..." class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">색상</label>
                                        <select name="link_color_${idx}" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                            <option value="blue" ${link.color === 'blue' ? 'selected' : ''}>파랑</option>
                                            <option value="green" ${link.color === 'green' ? 'selected' : ''}>초록</option>
                                            <option value="orange" ${link.color === 'orange' ? 'selected' : ''}>주황</option>
                                            <option value="purple" ${link.color === 'purple' ? 'selected' : ''}>보라</option>
                                            <option value="red" ${link.color === 'red' ? 'selected' : ''}>빨강</option>
                                            <option value="teal" ${link.color === 'teal' ? 'selected' : ''}>청록</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" onclick="addQuickLink()" class="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
                        <i class="fas fa-plus mr-2"></i>바로가기 추가
                    </button>
                </div>
            `;
            break;
            
        case 'stats':
            typeSpecificForm = `
                <div class="bg-indigo-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">학교 현황 통계 설정</h3>
                    <div class="grid grid-cols-2 gap-4">
                        ${[1, 2, 3, 4].map(i => `
                            <div class="bg-white rounded-lg p-4 border border-gray-300">
                                <h4 class="font-bold mb-3">통계 ${i}</h4>
                                <div class="space-y-2">
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">라벨</label>
                                        <input type="text" name="stat${i}_label" value="${module[`stat${i}_label`] || ''}" placeholder="재학생" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-xs text-gray-600 mb-1">값</label>
                                            <input type="text" name="stat${i}_value" value="${module[`stat${i}_value`] || ''}" placeholder="100" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                        </div>
                                        <div>
                                            <label class="block text-xs text-gray-600 mb-1">단위</label>
                                            <input type="text" name="stat${i}_suffix" value="${module[`stat${i}_suffix`] || ''}" placeholder="명" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
            
        case 'gallery':
            const images = typeof module.images === 'string' ? JSON.parse(module.images || '[]') : (module.images || []);
            typeSpecificForm = `
                <div class="bg-pink-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">학교 갤러리 설정</h3>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">섹션 제목</label>
                        <input type="text" name="section_title" value="${module.section_title || '학교 갤러리'}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div id="gallery-images-list" class="grid grid-cols-2 gap-4 mb-4">
                        ${images.map((img, idx) => `
                            <div class="gallery-image-item bg-white rounded-lg p-3 border border-gray-300" data-index="${idx}">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium">이미지 ${idx + 1}</span>
                                    <button type="button" onclick="removeGalleryImage(${idx})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <input type="text" name="gallery_url_${idx}" value="${img.url || ''}" placeholder="이미지 URL" class="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2">
                                <input type="text" name="gallery_alt_${idx}" value="${img.alt || ''}" placeholder="이미지 설명" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" onclick="addGalleryImage()" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
                        <i class="fas fa-plus mr-2"></i>이미지 추가
                    </button>
                </div>
            `;
            break;
            
        case 'text':
            typeSpecificForm = `
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">텍스트 섹션 설정</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
                            <input type="text" name="title" value="${module.title || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">내용</label>
                            <textarea name="content" rows="10" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${module.content || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'image':
            typeSpecificForm = `
                <div class="bg-pink-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">이미지 섹션 설정</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이미지 URL</label>
                            <input type="text" name="image_url" value="${module.image_url || ''}" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이미지 Alt 텍스트</label>
                            <input type="text" name="image_alt" value="${module.image_alt || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">너비 (px, 비워두면 자동)</label>
                                <input type="number" name="image_width" value="${module.image_width || ''}" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">높이 (px, 비워두면 자동)</label>
                                <input type="number" name="image_height" value="${module.image_height || ''}" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'custom':
            typeSpecificForm = `
                <div class="bg-orange-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">커스텀 HTML 설정</h3>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">HTML 코드</label>
                        <textarea name="html_content" rows="15" class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm">${module.html_content || ''}</textarea>
                        <p class="text-xs text-gray-500 mt-1">주의: HTML 코드를 직접 입력합니다. 보안에 주의하세요.</p>
                    </div>
                </div>
            `;
            break;
    }
    
    return commonSettings + typeSpecificForm;
}

// 슬라이드 편집기 렌더링
function renderSlideEditor(slide, index) {
    return `
        <div class="slide-editor bg-white rounded-lg p-4 border border-gray-300" data-slide-index="${index}">
            <div class="flex justify-between items-center mb-4">
                <h4 class="font-bold">슬라이드 ${index + 1}</h4>
                <button type="button" onclick="removeSlide(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이미지 URL *</label>
                    <input type="text" name="slide_image_${index}" value="${slide.image_url || ''}" placeholder="https://..." required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">이미지 Alt</label>
                    <input type="text" name="slide_alt_${index}" value="${slide.image_alt || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">타이틀</label>
                    <input type="text" name="slide_title_${index}" value="${slide.title || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">서브타이틀</label>
                    <input type="text" name="slide_subtitle_${index}" value="${slide.subtitle || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">링크 URL</label>
                    <input type="text" name="slide_link_${index}" value="${slide.link_url || ''}" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">링크 텍스트</label>
                    <input type="text" name="slide_link_text_${index}" value="${slide.link_text || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>
        </div>
    `;
}

// 슬라이드 추가
function addSlide() {
    const slidesList = document.getElementById('slides-list');
    if (!slidesList) return;
    
    const index = slidesList.children.length;
    const slideHTML = renderSlideEditor({}, index);
    slidesList.insertAdjacentHTML('beforeend', slideHTML);
    
    // 새 슬라이드의 입력 필드에 미리보기 업데이트 이벤트 추가
    const newSlide = slidesList.lastElementChild;
    const inputs = newSlide.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const form = document.getElementById('edit-module-form');
            const module = window.currentEditingModule;
            if (form && module) updatePreview(form, module);
        });
        input.addEventListener('change', () => {
            const form = document.getElementById('edit-module-form');
            const module = window.currentEditingModule;
            if (form && module) updatePreview(form, module);
        });
    });
    
    // 미리보기 업데이트
    const form = document.getElementById('edit-module-form');
    const module = window.currentEditingModule;
    if (form && module) updatePreview(form, module);
}

// 슬라이드 제거
function removeSlide(index) {
    const slideEditor = document.querySelector(`[data-slide-index="${index}"]`);
    if (slideEditor) {
        slideEditor.remove();
        // 인덱스 재정렬
        const slides = document.querySelectorAll('.slide-editor');
        slides.forEach((slide, i) => {
            slide.setAttribute('data-slide-index', i);
            slide.querySelector('h4').textContent = `슬라이드 ${i + 1}`;
        });
        
        // 미리보기 업데이트
        const form = document.getElementById('edit-module-form');
        const module = window.currentEditingModule;
        if (form && module) updatePreview(form, module);
    }
}

// 바로가기 추가
function addQuickLink() {
    const list = document.getElementById('quick-links-list');
    if (!list) return;
    
    const index = list.children.length;
    const html = `
        <div class="quick-link-item bg-white rounded-lg p-4 border border-gray-300" data-index="${index}">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold">바로가기 ${index + 1}</h4>
                <button type="button" onclick="removeQuickLink(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-gray-600 mb-1">아이콘 (Font Awesome)</label>
                    <input type="text" name="link_icon_${index}" value="" placeholder="fa-link" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">제목</label>
                    <input type="text" name="link_title_${index}" value="" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">URL</label>
                    <input type="text" name="link_url_${index}" value="" placeholder="https://..." class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">색상</label>
                    <select name="link_color_${index}" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                        <option value="blue">파랑</option>
                        <option value="green">초록</option>
                        <option value="orange">주황</option>
                        <option value="purple">보라</option>
                        <option value="red">빨강</option>
                        <option value="teal">청록</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    list.insertAdjacentHTML('beforeend', html);
    
    // 미리보기 업데이트
    const form = document.getElementById('edit-module-form');
    const module = window.currentEditingModule;
    if (form && module) updatePreview(form, module);
}

// 바로가기 제거
function removeQuickLink(index) {
    const item = document.querySelector(`.quick-link-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        // 인덱스 재정렬
        const items = document.querySelectorAll('.quick-link-item');
        items.forEach((item, i) => {
            item.setAttribute('data-index', i);
            item.querySelector('h4').textContent = `바로가기 ${i + 1}`;
        });
        
        // 미리보기 업데이트
        const form = document.getElementById('edit-module-form');
        const module = window.currentEditingModule;
        if (form && module) updatePreview(form, module);
    }
}

// 갤러리 이미지 추가
function addGalleryImage() {
    const list = document.getElementById('gallery-images-list');
    if (!list) return;
    
    const index = list.children.length;
    const html = `
        <div class="gallery-image-item bg-white rounded-lg p-3 border border-gray-300" data-index="${index}">
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium">이미지 ${index + 1}</span>
                <button type="button" onclick="removeGalleryImage(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="text" name="gallery_url_${index}" value="" placeholder="이미지 URL" class="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2">
            <input type="text" name="gallery_alt_${index}" value="" placeholder="이미지 설명" class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
        </div>
    `;
    list.insertAdjacentHTML('beforeend', html);
    
    // 미리보기 업데이트
    const form = document.getElementById('edit-module-form');
    const module = window.currentEditingModule;
    if (form && module) updatePreview(form, module);
}

// 갤러리 이미지 제거
function removeGalleryImage(index) {
    const item = document.querySelector(`.gallery-image-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        // 인덱스 재정렬
        const items = document.querySelectorAll('.gallery-image-item');
        items.forEach((item, i) => {
            item.setAttribute('data-index', i);
            item.querySelector('.text-sm.font-medium').textContent = `이미지 ${i + 1}`;
        });
        
        // 미리보기 업데이트
        const form = document.getElementById('edit-module-form');
        const module = window.currentEditingModule;
        if (form && module) updatePreview(form, module);
    }
}

// 배경색 입력 토글
function toggleBgColorInput() {
    const checkbox = document.getElementById('use_bg_color');
    const colorInput = document.getElementById('bg_color_input');
    const label = checkbox?.parentElement?.querySelector('span');
    
    if (checkbox && colorInput) {
        if (checkbox.checked) {
            colorInput.disabled = false;
            colorInput.classList.remove('opacity-50');
            if (label) label.textContent = '';
        } else {
            colorInput.disabled = true;
            colorInput.classList.add('opacity-50');
            colorInput.value = '#ffffff';
            if (label) label.textContent = '(기본 배경)';
        }
        
        // 미리보기 업데이트
        const form = document.getElementById('edit-module-form');
        const module = window.currentEditingModule;
        if (form && module) updatePreview(form, module);
    }
}

// 모듈 저장
async function saveModule(moduleId, form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 공통 설정
        const module = currentModules.find(m => m.id === moduleId);
        const moduleData = {
            page: module?.page || currentPage,
            display_order: module?.display_order || 0,
            is_active: parseInt(data.is_active),
            container_type: data.container_type,
            background_color: document.getElementById('use_bg_color')?.checked ? data.background_color : null,
            background_image: data.background_image || null,
            padding_top: parseInt(data.padding_top) || 0,
            padding_bottom: parseInt(data.padding_bottom) || 0,
            margin_top: parseInt(data.margin_top) || 0,
            margin_bottom: parseInt(data.margin_bottom) || 0,
            settings: {}
        };
        
        // 모듈 타입별 설정 추출
        if (module) {
            switch (module.module_type) {
                case 'hero':
                    moduleData.settings = {
                        title: data.title || '',
                        subtitle: data.subtitle || '',
                        hero_background_image: data.hero_background_image || ''
                    };
                    break;
                    
                case 'slides':
                    // 슬라이드 데이터 수집
                    const slides = [];
                    const slideEditors = document.querySelectorAll('.slide-editor');
                    slideEditors.forEach((editor, index) => {
                        const slideData = {
                            title: editor.querySelector(`[name="slide_title_${index}"]`)?.value || '',
                            subtitle: editor.querySelector(`[name="slide_subtitle_${index}"]`)?.value || '',
                            image_url: editor.querySelector(`[name="slide_image_${index}"]`)?.value || '',
                            image_alt: editor.querySelector(`[name="slide_alt_${index}"]`)?.value || '',
                            link_url: editor.querySelector(`[name="slide_link_${index}"]`)?.value || '',
                            link_text: editor.querySelector(`[name="slide_link_text_${index}"]`)?.value || '',
                            is_active: true
                        };
                        if (slideData.image_url) {
                            slides.push(slideData);
                        }
                    });
                    moduleData.slides = slides;
                    break;
                    
                case 'values':
                    moduleData.settings = {
                        value1_icon: data.value1_icon || '',
                        value1_title: data.value1_title || '',
                        value1_desc: data.value1_desc || '',
                        value2_icon: data.value2_icon || '',
                        value2_title: data.value2_title || '',
                        value2_desc: data.value2_desc || '',
                        value3_icon: data.value3_icon || '',
                        value3_title: data.value3_title || '',
                        value3_desc: data.value3_desc || ''
                    };
                    break;
                    
                case 'features':
                    moduleData.settings = {
                        feature1_icon: data.feature1_icon || '',
                        feature1_title: data.feature1_title || '',
                        feature1_desc: data.feature1_desc || '',
                        feature2_icon: data.feature2_icon || '',
                        feature2_title: data.feature2_title || '',
                        feature2_desc: data.feature2_desc || '',
                        feature3_icon: data.feature3_icon || '',
                        feature3_title: data.feature3_title || '',
                        feature3_desc: data.feature3_desc || '',
                        feature4_icon: data.feature4_icon || '',
                        feature4_title: data.feature4_title || '',
                        feature4_desc: data.feature4_desc || ''
                    };
                    break;
                    
                case 'about':
                    moduleData.settings = {
                        ideology: data.ideology || '',
                        goals: data.goals || '',
                        features: data.features || ''
                    };
                    break;
                    
                case 'contact':
                case 'map':
                    moduleData.settings = {
                        section_title: data.section_title || '오시는 길',
                        phone: data.phone || '',
                        email: data.email || '',
                        address: data.address || '',
                        map_embed: data.map_embed || ''
                    };
                    break;
                    
                case 'quick_links':
                    // 바로가기 데이터 수집
                    const links = [];
                    const linkItems = document.querySelectorAll('.quick-link-item');
                    linkItems.forEach((item, index) => {
                        const linkData = {
                            icon: item.querySelector(`[name="link_icon_${index}"]`)?.value || '',
                            title: item.querySelector(`[name="link_title_${index}"]`)?.value || '',
                            url: item.querySelector(`[name="link_url_${index}"]`)?.value || '',
                            color: item.querySelector(`[name="link_color_${index}"]`)?.value || 'blue'
                        };
                        if (linkData.title) {
                            links.push(linkData);
                        }
                    });
                    moduleData.settings = {
                        links: JSON.stringify(links)
                    };
                    break;
                    
                case 'stats':
                    moduleData.settings = {
                        stat1_label: data.stat1_label || '',
                        stat1_value: data.stat1_value || '',
                        stat1_suffix: data.stat1_suffix || '',
                        stat2_label: data.stat2_label || '',
                        stat2_value: data.stat2_value || '',
                        stat2_suffix: data.stat2_suffix || '',
                        stat3_label: data.stat3_label || '',
                        stat3_value: data.stat3_value || '',
                        stat3_suffix: data.stat3_suffix || '',
                        stat4_label: data.stat4_label || '',
                        stat4_value: data.stat4_value || '',
                        stat4_suffix: data.stat4_suffix || ''
                    };
                    break;
                    
                case 'gallery':
                    // 갤러리 이미지 데이터 수집
                    const images = [];
                    const imageItems = document.querySelectorAll('.gallery-image-item');
                    imageItems.forEach((item, index) => {
                        const imgData = {
                            url: item.querySelector(`[name="gallery_url_${index}"]`)?.value || '',
                            alt: item.querySelector(`[name="gallery_alt_${index}"]`)?.value || ''
                        };
                        if (imgData.url) {
                            images.push(imgData);
                        }
                    });
                    moduleData.settings = {
                        section_title: data.section_title || '학교 갤러리',
                        images: JSON.stringify(images)
                    };
                    break;
                    
                case 'text':
                    moduleData.settings = {
                        title: data.title || '',
                        content: data.content || ''
                    };
                    break;
                    
                case 'image':
                    moduleData.settings = {
                        image_url: data.image_url || '',
                        image_alt: data.image_alt || '',
                        image_width: data.image_width || null,
                        image_height: data.image_height || null
                    };
                    break;
                    
                case 'custom':
                    moduleData.settings = {
                        html_content: data.html_content || ''
                    };
                    break;
            }
        }
        
        await axios.put(`/api/homepage-modules/${moduleId}`, moduleData, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('모듈이 저장되었습니다!');
        closeEditModuleModal();
        
        // 목록 새로고침 (페이지 유지)
        const refreshResponse = await axios.get('/api/homepage-modules/admin', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        currentModules = refreshResponse.data.modules || [];
        const container = document.getElementById('main-content');
        renderModuleManagement(container);
        
    } catch (error) {
        console.error('모듈 저장 실패:', error);
        alert('모듈 저장에 실패했습니다: ' + (error.response?.data?.message || error.message));
    }
}

// 모듈 편집 모달 닫기
function closeEditModuleModal() {
    const modal = document.getElementById('edit-module-modal');
    if (modal) {
        modal.remove();
    }
    window.currentEditingModule = null;
}

// 모듈 미리보기 렌더링 (public-home.js의 renderHomepageModule 재사용)
function renderModulePreview(module) {
    // public-home.js의 renderHomepageModule 함수가 있으면 사용
    if (typeof renderHomepageModule === 'function') {
        return renderHomepageModule(module);
    }
    
    // 없으면 간단한 미리보기
    return `
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <i class="fas fa-eye text-4xl mb-4"></i>
            <p>미리보기를 로드하는 중...</p>
        </div>
    `;
}

// 실시간 미리보기 업데이트 설정
function setupPreviewUpdate(module) {
    const form = document.getElementById('edit-module-form');
    const previewContainer = document.getElementById('module-preview');
    
    if (!form || !previewContainer) return;
    
    // 모든 입력 필드에 이벤트 리스너 추가
    const addEventListeners = () => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // 이미 이벤트가 추가되었는지 확인
            if (!input.hasAttribute('data-preview-listener')) {
                input.setAttribute('data-preview-listener', 'true');
                input.addEventListener('input', () => updatePreview(form, module));
                input.addEventListener('change', () => updatePreview(form, module));
            }
        });
    };
    
    // 초기 이벤트 리스너 추가
    addEventListeners();
    
    // 슬라이드 편집기가 동적으로 추가될 수 있으므로 MutationObserver 사용
    const observer = new MutationObserver(() => {
        addEventListeners();
    });
    
    observer.observe(form, { childList: true, subtree: true });
    
    // 초기 미리보기
    updatePreview(form, module);
}

// 미리보기 업데이트
function updatePreview(form, originalModule) {
    const previewContainer = document.getElementById('module-preview');
    if (!previewContainer) return;
    
    // 폼 데이터 수집
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // 모듈 객체 생성
    const previewModule = {
        ...originalModule,
        container_type: data.container_type || originalModule.container_type,
        is_active: data.is_active === '1',
        background_color: document.getElementById('use_bg_color')?.checked ? data.background_color : null,
        background_image: data.background_image || originalModule.background_image,
        padding_top: parseInt(data.padding_top) || originalModule.padding_top || 0,
        padding_bottom: parseInt(data.padding_bottom) || originalModule.padding_bottom || 0,
        margin_top: parseInt(data.margin_top) || originalModule.margin_top || 0,
        margin_bottom: parseInt(data.margin_bottom) || originalModule.margin_bottom || 0
    };
    
    // 모듈 타입별 데이터 추가
    switch (originalModule.module_type) {
        case 'hero':
            previewModule.title = data.title || '';
            previewModule.subtitle = data.subtitle || '';
            if (data.hero_background_image) {
                previewModule.background_image = data.hero_background_image;
            }
            break;
            
        case 'slides':
            // 슬라이드 데이터 수집
            const slides = [];
            const slideEditors = form.querySelectorAll('.slide-editor');
            slideEditors.forEach((editor, index) => {
                const slideData = {
                    title: editor.querySelector(`[name="slide_title_${index}"]`)?.value || '',
                    subtitle: editor.querySelector(`[name="slide_subtitle_${index}"]`)?.value || '',
                    image_url: editor.querySelector(`[name="slide_image_${index}"]`)?.value || '',
                    image_alt: editor.querySelector(`[name="slide_alt_${index}"]`)?.value || '',
                    link_url: editor.querySelector(`[name="slide_link_${index}"]`)?.value || '',
                    link_text: editor.querySelector(`[name="slide_link_text_${index}"]`)?.value || '',
                    is_active: true
                };
                if (slideData.image_url) {
                    slides.push(slideData);
                }
            });
            previewModule.slides = slides;
            break;
            
        case 'values':
            previewModule.value1_icon = data.value1_icon || '';
            previewModule.value1_title = data.value1_title || '';
            previewModule.value1_desc = data.value1_desc || '';
            previewModule.value2_icon = data.value2_icon || '';
            previewModule.value2_title = data.value2_title || '';
            previewModule.value2_desc = data.value2_desc || '';
            previewModule.value3_icon = data.value3_icon || '';
            previewModule.value3_title = data.value3_title || '';
            previewModule.value3_desc = data.value3_desc || '';
            break;
            
        case 'features':
            previewModule.feature1_icon = data.feature1_icon || '';
            previewModule.feature1_title = data.feature1_title || '';
            previewModule.feature1_desc = data.feature1_desc || '';
            previewModule.feature2_icon = data.feature2_icon || '';
            previewModule.feature2_title = data.feature2_title || '';
            previewModule.feature2_desc = data.feature2_desc || '';
            previewModule.feature3_icon = data.feature3_icon || '';
            previewModule.feature3_title = data.feature3_title || '';
            previewModule.feature3_desc = data.feature3_desc || '';
            previewModule.feature4_icon = data.feature4_icon || '';
            previewModule.feature4_title = data.feature4_title || '';
            previewModule.feature4_desc = data.feature4_desc || '';
            break;
            
        case 'text':
            previewModule.title = data.title || '';
            previewModule.content = data.content || '';
            break;
            
        case 'image':
            previewModule.image_url = data.image_url || '';
            previewModule.image_alt = data.image_alt || '';
            previewModule.image_width = data.image_width ? parseInt(data.image_width) : null;
            previewModule.image_height = data.image_height ? parseInt(data.image_height) : null;
            break;
            
        case 'custom':
            previewModule.html_content = data.html_content || '';
            break;
            
        case 'quick_links':
            // 바로가기 데이터 수집
            const links = [];
            const linkItems = form.querySelectorAll('.quick-link-item');
            linkItems.forEach((item, index) => {
                const linkData = {
                    icon: item.querySelector(`[name="link_icon_${index}"]`)?.value || '',
                    title: item.querySelector(`[name="link_title_${index}"]`)?.value || '',
                    url: item.querySelector(`[name="link_url_${index}"]`)?.value || '',
                    color: item.querySelector(`[name="link_color_${index}"]`)?.value || 'blue'
                };
                if (linkData.title) {
                    links.push(linkData);
                }
            });
            previewModule.links = links;
            break;
            
        case 'stats':
            previewModule.stat1_label = data.stat1_label || '';
            previewModule.stat1_value = data.stat1_value || '';
            previewModule.stat1_suffix = data.stat1_suffix || '';
            previewModule.stat2_label = data.stat2_label || '';
            previewModule.stat2_value = data.stat2_value || '';
            previewModule.stat2_suffix = data.stat2_suffix || '';
            previewModule.stat3_label = data.stat3_label || '';
            previewModule.stat3_value = data.stat3_value || '';
            previewModule.stat3_suffix = data.stat3_suffix || '';
            previewModule.stat4_label = data.stat4_label || '';
            previewModule.stat4_value = data.stat4_value || '';
            previewModule.stat4_suffix = data.stat4_suffix || '';
            break;
            
        case 'gallery':
            // 갤러리 이미지 데이터 수집
            const images = [];
            const imageItems = form.querySelectorAll('.gallery-image-item');
            imageItems.forEach((item, index) => {
                const imgData = {
                    url: item.querySelector(`[name="gallery_url_${index}"]`)?.value || '',
                    alt: item.querySelector(`[name="gallery_alt_${index}"]`)?.value || ''
                };
                if (imgData.url) {
                    images.push(imgData);
                }
            });
            previewModule.section_title = data.section_title || '학교 갤러리';
            previewModule.images = images;
            break;
            
        case 'contact':
        case 'map':
            previewModule.section_title = data.section_title || '오시는 길';
            previewModule.phone = data.phone || '';
            previewModule.email = data.email || '';
            previewModule.address = data.address || '';
            previewModule.map_embed = data.map_embed || '';
            break;
    }
    
    // 미리보기 렌더링
    if (typeof renderHomepageModule === 'function') {
        previewContainer.innerHTML = renderHomepageModule(previewModule);
    } else {
        previewContainer.innerHTML = `
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                <i class="fas fa-eye text-4xl mb-4"></i>
                <p>미리보기 기능을 사용하려면 페이지를 새로고침해주세요.</p>
            </div>
        `;
    }
}

// 모듈 활성화/비활성화 토글
async function toggleModuleActive(moduleId, newStatus) {
    try {
        const module = currentModules.find(m => m.id === moduleId);
        if (!module) return;
        
        await axios.put(`/api/homepage-modules/${moduleId}`, {
            ...module,
            is_active: newStatus
        }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        // 목록 새로고침
        showHomepageManagement();
        
    } catch (error) {
        console.error('모듈 상태 변경 실패:', error);
        alert('모듈 상태 변경에 실패했습니다.');
    }
}

// 모듈 삭제
async function deleteModule(moduleId) {
    if (!confirm('이 모듈을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        await axios.delete(`/api/homepage-modules/${moduleId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('모듈이 삭제되었습니다.');
        
        // 목록 새로고침 (페이지 유지)
        const refreshResponse = await axios.get('/api/homepage-modules/admin', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        currentModules = refreshResponse.data.modules || [];
        const container = document.getElementById('main-content');
        renderModuleManagement(container);
        
    } catch (error) {
        console.error('모듈 삭제 실패:', error);
        alert('모듈 삭제에 실패했습니다.');
    }
}

