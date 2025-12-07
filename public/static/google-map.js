// 구글 지도 유틸리티 (iframe embed 방식 - API 키 불필요)

// 구글 지도 iframe 생성
function createGoogleMapIframe(address, options = {}) {
    const {
        width = '100%',
        height = '100%',
        zoom = 17
    } = options;

    // 주소를 URL 인코딩
    const encodedAddress = encodeURIComponent(address);

    // 구글 지도 embed URL
    const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=m&z=${zoom}&output=embed&iwloc=near`;

    return `<iframe
        src="${mapUrl}"
        width="${width}"
        height="${height}"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
    </iframe>`;
}

// 학교 위치 지도 초기화
function initGoogleMap(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    const {
        address = '서울특별시 중구 세종대로 110',
        zoom = 17
    } = options;

    // 컨테이너 스타일 설정
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minHeight = '400px';

    // iframe 삽입
    container.innerHTML = createGoogleMapIframe(address, { zoom });

    console.log(`Google map initialized for ${containerId} with address: ${address}`);
}

// 구글 지도 모듈 초기화 (public-home.js에서 호출)
function initGoogleMapModules() {
    // google-map- 또는 naver-map- 으로 시작하는 요소들 찾기
    const mapModules = document.querySelectorAll('[id^="google-map-"], [id^="naver-map-"]');

    if (mapModules.length === 0) {
        console.log('No map modules found');
        return;
    }

    console.log(`Found ${mapModules.length} map module(s)`);

    for (const mapContainer of mapModules) {
        // 이미 iframe이 있으면 건너뛰기
        if (mapContainer.querySelector('iframe')) {
            console.log(`Map already initialized for ${mapContainer.id}`);
            continue;
        }

        // data-address 속성에서 주소 가져오기
        const address = mapContainer.getAttribute('data-address') || '서울특별시 중구 세종대로 110';

        console.log(`Initializing Google map for ${mapContainer.id} with address: ${address}`);

        try {
            // 컨테이너 클리어
            mapContainer.innerHTML = '';
            mapContainer.classList.remove('flex', 'items-center', 'justify-center', 'bg-gray-300');

            // 구글 지도 iframe 삽입
            initGoogleMap(mapContainer.id, { address, zoom: 17 });

            console.log(`✓ Google map initialized for ${mapContainer.id}`);
        } catch (error) {
            console.error(`✗ Failed to initialize map for ${mapContainer.id}:`, error);
            mapContainer.classList.add('map-error');
            mapContainer.innerHTML = `
                <div class="text-center text-red-500 p-8">
                    <i class="fas fa-exclamation-triangle text-5xl mb-3"></i>
                    <p>지도를 불러올 수 없습니다</p>
                    <p class="text-sm">${error.message || '주소를 확인해주세요'}</p>
                </div>
            `;
        }
    }
}

// 전역 노출
window.GoogleMapUtils = {
    createIframe: createGoogleMapIframe,
    initMap: initGoogleMap,
    initModules: initGoogleMapModules
};

window.initGoogleMapModules = initGoogleMapModules;
