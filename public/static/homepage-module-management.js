// 홈페이지 모듈 관리 기능

let currentModules = [];
let draggedModule = null;
let draggedOverModule = null;

// 홈페이지 모듈 관리 페이지 표시
async function showHomepageManagement(container) {
    // 권한 체크
    if (currentUser.role !== 'super_admin') {
        alert('홈페이지 관리는 최고 관리자만 접근할 수 있습니다.');
        navigateToPage('dashboard');
        return;
    }
    
    const content = container || document.getElementById('main-content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">
                <i class="fas fa-globe mr-2"></i>홈페이지 모듈 관리
            </h2>
            <p class="text-gray-600 mt-2">모듈을 조합하여 홈페이지를 자유롭게 구성합니다</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-500 py-8">로딩 중...</p>
        </div>
    `;
    
    try {
        // 현재 모듈 로드
        const response = await axios.get('/api/homepage-modules/admin', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        currentModules = response.data.modules || [];
        
        renderModuleManagement(content);
        
    } catch (error) {
        console.error('홈페이지 모듈 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                홈페이지 모듈을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 모듈 관리 UI 렌더링
function renderModuleManagement(container) {
    container.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-globe mr-2"></i>홈페이지 모듈 관리
                    </h2>
                    <p class="text-gray-600 mt-2">모듈을 드래그하여 순서를 변경하고, 각 모듈을 클릭하여 편집할 수 있습니다</p>
                </div>
                <button onclick="showAddModuleModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>모듈 추가
                </button>
            </div>
        </div>
        
        <!-- 모듈 목록 -->
        <div id="modules-list" class="space-y-4">
            ${currentModules.length === 0 ? `
                <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <i class="fas fa-puzzle-piece text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 mb-4">등록된 모듈이 없습니다.</p>
                    <button onclick="showAddModuleModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        첫 번째 모듈 추가하기
                    </button>
                </div>
            ` : currentModules.map((module, index) => renderModuleCard(module, index)).join('')}
        </div>
        
        <!-- 저장 버튼 -->
        ${currentModules.length > 0 ? `
            <div class="mt-6 flex justify-end">
                <button onclick="saveModuleOrder()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-save mr-2"></i>순서 저장
                </button>
            </div>
        ` : ''}
    `;
    
    // 드래그 앤 드롭 이벤트 설정
    setupDragAndDrop();
}

// 모듈 카드 렌더링
function renderModuleCard(module, index) {
    const moduleTypeNames = {
        'hero': '히어로 섹션',
        'values': '교훈 섹션',
        'features': '특징 섹션',
        'slides': '슬라이드 섹션',
        'notice': '공지사항 섹션',
        'about': '학교 소개 섹션',
        'contact': '연락처 섹션',
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
        const moduleOrders = currentModules.map((module, index) => ({
            id: module.id,
            display_order: index
        }));
        
        await axios.post('/api/homepage-modules/reorder', { moduleOrders }, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('모듈 순서가 저장되었습니다!');
        
        // 다시 로드
        showHomepageManagement();
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
                        <option value="hero">히어로 섹션</option>
                        <option value="slides">슬라이드 섹션</option>
                        <option value="values">교훈 섹션</option>
                        <option value="features">특징 섹션</option>
                        <option value="notice">공지사항 섹션</option>
                        <option value="about">학교 소개 섹션</option>
                        <option value="contact">연락처 섹션</option>
                        <option value="text">텍스트 섹션</option>
                        <option value="image">이미지 섹션</option>
                        <option value="video">비디오 섹션</option>
                        <option value="custom">커스텀 HTML</option>
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
            const maxOrder = currentModules.length > 0 
                ? Math.max(...currentModules.map(m => m.display_order)) + 1 
                : 0;
            
            const response = await axios.post('/api/homepage-modules', {
                module_type: moduleType,
                display_order: maxOrder,
                is_active: isActive,
                container_type: containerType,
                settings: getDefaultModuleSettings(moduleType),
                slides: moduleType === 'slides' ? [] : undefined
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            closeAddModuleModal();
            
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
            title: '꿈을 키우는 학교',
            subtitle: '우리 모두가 주인공이 되는 배움의 공간'
        },
        'values': {
            value1_title: '사랑',
            value1_desc: '서로를 존중하고 배려하며 사랑하는 마음',
            value2_title: '지혜',
            value2_desc: '끊임없이 배우고 성장하는 지혜로운 사람',
            value3_title: '섬김',
            value3_desc: '이웃과 사회를 섬기는 따뜻한 마음'
        },
        'features': {
            feature1_title: '소규모 학급',
            feature1_desc: '학생 개개인을 세심하게 돌보는 소규모 학급 운영',
            feature2_title: '맞춤형 교육',
            feature2_desc: '학생의 흥미와 적성에 맞춘 개별화 교육',
            feature3_title: '예체능 교육',
            feature3_desc: '다양한 예술과 체육 활동으로 감성 발달',
            feature4_title: '체험 학습',
            feature4_desc: '현장 중심의 살아있는 배움 경험'
        },
        'about': {
            ideology: '우리 학교는 학생 한 명 한 명의 꿈과 가능성을 소중히 여기며, 서로 존중하고 배려하는 공동체를 만들어갑니다.',
            goals: '• 자기주도적 학습 능력 함양\n• 창의적 문제해결 능력 개발\n• 공동체 의식과 협력 정신\n• 올바른 인성과 가치관 확립',
            features: '• 소규모 학급 운영 (학급당 15~20명)\n• 학생 맞춤형 개별화 교육\n• 현장 체험 중심 학습\n• 예체능 통합 교육과정'
        },
        'contact': {
            phone: '000-0000-0000',
            email: 'school@example.com',
            address: '서울시 강남구'
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
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">모듈 편집</h2>
                <button onclick="closeEditModuleModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <form id="edit-module-form" class="space-y-6">
                ${formHTML}
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 폼 제출 이벤트
    const form = document.getElementById('edit-module-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveModule(moduleId, form);
    });
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
                    <input type="color" name="background_color" value="${module.background_color || '#ffffff'}" class="w-full h-10 border border-gray-300 rounded-lg">
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
                            <label class="block text-sm font-medium text-gray-700 mb-2">배경 이미지 URL</label>
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
                                    <label class="block text-xs text-gray-600 mb-1">아이콘 이미지 URL</label>
                                    <input type="text" name="value${i}_icon" value="${module[`value${i}_icon`] || ''}" placeholder="https://..." class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
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
                                    <label class="block text-xs text-gray-600 mb-1">아이콘 이미지 URL</label>
                                    <input type="text" name="feature${i}_icon" value="${module[`feature${i}_icon`] || ''}" placeholder="https://..." class="w-full px-2 py-1 text-sm border border-gray-300 rounded">
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
            typeSpecificForm = `
                <div class="bg-teal-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold mb-4">연락처 설정</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <input type="text" name="phone" value="${module.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input type="email" name="email" value="${module.email || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
                            <input type="text" name="address" value="${module.address || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
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
    
    return commonSettings + typeSpecificForm + `
        <div class="flex justify-end space-x-4">
            <button type="button" onclick="closeEditModuleModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                취소
            </button>
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <i class="fas fa-save mr-2"></i>저장
            </button>
        </div>
    `;
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
    }
}

// 모듈 저장
async function saveModule(moduleId, form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 공통 설정
        const moduleData = {
            display_order: currentModules.find(m => m.id === moduleId)?.display_order || 0,
            is_active: parseInt(data.is_active),
            container_type: data.container_type,
            background_color: data.background_color || null,
            background_image: data.background_image || null,
            padding_top: parseInt(data.padding_top) || 0,
            padding_bottom: parseInt(data.padding_bottom) || 0,
            margin_top: parseInt(data.margin_top) || 0,
            margin_bottom: parseInt(data.margin_bottom) || 0,
            settings: {}
        };
        
        // 모듈 타입별 설정 추출
        const module = currentModules.find(m => m.id === moduleId);
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
                    moduleData.settings = {
                        phone: data.phone || '',
                        email: data.email || '',
                        address: data.address || ''
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
        
        // 목록 새로고침
        showHomepageManagement();
        
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
        
        // 목록 새로고침
        showHomepageManagement();
        
    } catch (error) {
        console.error('모듈 삭제 실패:', error);
        alert('모듈 삭제에 실패했습니다.');
    }
}

