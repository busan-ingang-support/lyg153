// 홈페이지 관리 기능

// 홈페이지 관리 페이지 표시
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
                <i class="fas fa-globe mr-2"></i>홈페이지 관리
            </h2>
            <p class="text-gray-600 mt-2">공개 홈페이지의 내용을 관리합니다</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-500 py-8">로딩 중...</p>
        </div>
    `;
    
    try {
        // 현재 설정 로드 (관리자용)
        const response = await axios.get('/api/homepage/admin', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const settings = response.data.settings || {};
        
        content.innerHTML = `
            <div class="mb-6">
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-globe mr-2"></i>홈페이지 관리
                </h2>
                <p class="text-gray-600 mt-2">공개 홈페이지의 내용을 관리합니다</p>
            </div>
            
            <!-- 히어로 섹션 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-heading mr-2"></i>메인 히어로 섹션
                </h3>
                <form id="hero-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">메인 타이틀</label>
                        <input type="text" id="homepage-hero-title" 
                               value="${settings.hero_title || '꿈을 키우는 학교'}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                               placeholder="꿈을 키우는 학교">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">서브 타이틀</label>
                        <input type="text" id="homepage-hero-subtitle" 
                               value="${settings.hero_subtitle || '우리 모두가 주인공이 되는 배움의 공간'}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                               placeholder="우리 모두가 주인공이 되는 배움의 공간">
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 교훈 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-heart mr-2"></i>교훈
                </h3>
                <form id="values-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교훈 1 - 제목</label>
                            <input type="text" id="homepage-value1-title" 
                                   value="${settings.value1_title || '사랑'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="사랑">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교훈 2 - 제목</label>
                            <input type="text" id="homepage-value2-title" 
                                   value="${settings.value2_title || '지혜'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="지혜">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교훈 3 - 제목</label>
                            <input type="text" id="homepage-value3-title" 
                                   value="${settings.value3_title || '섬김'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="섬김">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교훈 1 - 설명</label>
                            <textarea id="homepage-value1-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="서로를 존중하고 배려하며 사랑하는 마음">${settings.value1_desc || '서로를 존중하고 배려하며 사랑하는 마음'}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교훈 2 - 설명</label>
                            <textarea id="homepage-value2-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="끊임없이 배우고 성장하는 지혜로운 사람">${settings.value2_desc || '끊임없이 배우고 성장하는 지혜로운 사람'}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교훈 3 - 설명</label>
                            <textarea id="homepage-value3-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="이웃과 사회를 섬기는 따뜻한 마음">${settings.value3_desc || '이웃과 사회를 섬기는 따뜻한 마음'}</textarea>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 학교 소개 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-info-circle mr-2"></i>학교 소개
                </h3>
                <form id="about-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">설립 이념</label>
                        <textarea id="homepage-about-ideology" rows="4"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="학교 설립 이념을 입력하세요">${settings.about_ideology || '우리 학교는 학생 한 명 한 명의 꿈과 가능성을 소중히 여기며, 서로 존중하고 배려하는 공동체를 만들어갑니다. 기독교 정신을 바탕으로 사랑과 지혜, 섬김의 가치를 실천하며, 미래 사회를 이끌어갈 창의적인 인재를 양성합니다.'}</textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교육 목표 (줄바꿈으로 구분)</label>
                            <textarea id="homepage-about-goals" rows="5"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="• 자기주도적 학습 능력 함양&#10;• 창의적 문제해결 능력 개발">${settings.about_goals || '• 자기주도적 학습 능력 함양\n• 창의적 문제해결 능력 개발\n• 공동체 의식과 협력 정신\n• 올바른 인성과 가치관 확립'}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">교육 특징 (줄바꿈으로 구분)</label>
                            <textarea id="homepage-about-features" rows="5"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="• 소규모 학급 운영 (학급당 15~20명)&#10;• 학생 맞춤형 개별화 교육">${settings.about_features || '• 소규모 학급 운영 (학급당 15~20명)\n• 학생 맞춤형 개별화 교육\n• 현장 체험 중심 학습\n• 예체능 통합 교육과정'}</textarea>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 학교 특징 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-star mr-2"></i>학교 특징
                </h3>
                <form id="features-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">특징 1 - 제목</label>
                            <input type="text" id="homepage-feature1-title" 
                                   value="${settings.feature1_title || '소규모 학급'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="소규모 학급">
                            <label class="block text-sm font-medium text-gray-700 mb-2 mt-2">특징 1 - 설명</label>
                            <textarea id="homepage-feature1-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="학생 개개인을 세심하게 돌보는 소규모 학급 운영">${settings.feature1_desc || '학생 개개인을 세심하게 돌보는 소규모 학급 운영'}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">특징 2 - 제목</label>
                            <input type="text" id="homepage-feature2-title" 
                                   value="${settings.feature2_title || '맞춤형 교육'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="맞춤형 교육">
                            <label class="block text-sm font-medium text-gray-700 mb-2 mt-2">특징 2 - 설명</label>
                            <textarea id="homepage-feature2-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="학생의 흥미와 적성에 맞춘 개별화 교육">${settings.feature2_desc || '학생의 흥미와 적성에 맞춘 개별화 교육'}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">특징 3 - 제목</label>
                            <input type="text" id="homepage-feature3-title" 
                                   value="${settings.feature3_title || '예체능 교육'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="예체능 교육">
                            <label class="block text-sm font-medium text-gray-700 mb-2 mt-2">특징 3 - 설명</label>
                            <textarea id="homepage-feature3-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="다양한 예술과 체육 활동으로 감성 발달">${settings.feature3_desc || '다양한 예술과 체육 활동으로 감성 발달'}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">특징 4 - 제목</label>
                            <input type="text" id="homepage-feature4-title" 
                                   value="${settings.feature4_title || '체험 학습'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="체험 학습">
                            <label class="block text-sm font-medium text-gray-700 mb-2 mt-2">특징 4 - 설명</label>
                            <textarea id="homepage-feature4-desc" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="현장 중심의 살아있는 배움 경험">${settings.feature4_desc || '현장 중심의 살아있는 배움 경험'}</textarea>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 연혁 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-history mr-2"></i>연혁
                </h3>
                <form id="history-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">연혁 (각 줄에 "날짜|내용" 형식으로 입력)</label>
                        <textarea id="homepage-history" rows="8"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                  placeholder="2020.03|학교 설립 인가&#10;2021.03|제1회 입학식 (신입생 30명)">${settings.history || '2020.03|학교 설립 인가\n2021.03|제1회 입학식 (신입생 30명)\n2023.02|제1회 졸업식\n2024.03|현재 재학생 100여명'}</textarea>
                        <p class="text-xs text-gray-500 mt-1">예: 2020.03|학교 설립 인가</p>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 푸터 정보 설정 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    <i class="fas fa-address-card mr-2"></i>연락처 정보
                </h3>
                <form id="contact-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">대표전화</label>
                            <input type="text" id="homepage-contact-phone" 
                                   value="${settings.contact_phone || '000-0000-0000'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="02-1234-5678">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input type="email" id="homepage-contact-email" 
                                   value="${settings.contact_email || 'school@example.com'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="school@example.com">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">주소</label>
                            <input type="text" id="homepage-contact-address" 
                                   value="${settings.contact_address || '서울시 강남구'}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   placeholder="서울시 강남구">
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- 미리보기 버튼 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">홈페이지 미리보기</h3>
                        <p class="text-sm text-gray-600">변경사항을 확인하려면 새로고침 후 로그아웃하여 공개 홈페이지를 확인하세요.</p>
                    </div>
                    <button onclick="window.open('/', '_blank')" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                        <i class="fas fa-external-link-alt mr-2"></i>새 탭에서 열기
                    </button>
                </div>
            </div>
        `;
        
        // 폼 이벤트 리스너 설정
        setupHomepageFormListeners();
        
    } catch (error) {
        console.error('홈페이지 설정 로드 실패:', error);
        content.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                홈페이지 설정을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
            </div>
        `;
    }
}

// 홈페이지 폼 이벤트 리스너 설정
function setupHomepageFormListeners() {
    // 히어로 섹션
    const heroForm = document.getElementById('hero-form');
    if (heroForm) {
        heroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHomepageSettings({
                hero_title: document.getElementById('homepage-hero-title').value,
                hero_subtitle: document.getElementById('homepage-hero-subtitle').value
            });
        });
    }
    
    // 교훈
    const valuesForm = document.getElementById('values-form');
    if (valuesForm) {
        valuesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHomepageSettings({
                value1_title: document.getElementById('homepage-value1-title').value,
                value1_desc: document.getElementById('homepage-value1-desc').value,
                value2_title: document.getElementById('homepage-value2-title').value,
                value2_desc: document.getElementById('homepage-value2-desc').value,
                value3_title: document.getElementById('homepage-value3-title').value,
                value3_desc: document.getElementById('homepage-value3-desc').value
            });
        });
    }
    
    // 학교 소개
    const aboutForm = document.getElementById('about-form');
    if (aboutForm) {
        aboutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHomepageSettings({
                about_ideology: document.getElementById('homepage-about-ideology').value,
                about_goals: document.getElementById('homepage-about-goals').value,
                about_features: document.getElementById('homepage-about-features').value
            });
        });
    }
    
    // 학교 특징
    const featuresForm = document.getElementById('features-form');
    if (featuresForm) {
        featuresForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHomepageSettings({
                feature1_title: document.getElementById('homepage-feature1-title').value,
                feature1_desc: document.getElementById('homepage-feature1-desc').value,
                feature2_title: document.getElementById('homepage-feature2-title').value,
                feature2_desc: document.getElementById('homepage-feature2-desc').value,
                feature3_title: document.getElementById('homepage-feature3-title').value,
                feature3_desc: document.getElementById('homepage-feature3-desc').value,
                feature4_title: document.getElementById('homepage-feature4-title').value,
                feature4_desc: document.getElementById('homepage-feature4-desc').value
            });
        });
    }
    
    // 연혁
    const historyForm = document.getElementById('history-form');
    if (historyForm) {
        historyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHomepageSettings({
                history: document.getElementById('homepage-history').value
            });
        });
    }
    
    // 연락처
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveHomepageSettings({
                contact_phone: document.getElementById('homepage-contact-phone').value,
                contact_email: document.getElementById('homepage-contact-email').value,
                contact_address: document.getElementById('homepage-contact-address').value
            });
        });
    }
}

// 홈페이지 설정 저장
async function saveHomepageSettings(settings) {
    try {
        const response = await axios.post('/api/homepage', settings, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        if (response.data.success) {
            alert('저장되었습니다!');
        } else {
            alert('저장에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('홈페이지 설정 저장 실패:', error);
        alert('저장에 실패했습니다. 페이지를 새로고침해주세요.');
    }
}

