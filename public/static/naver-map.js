// 네이버 지도 API
const NAVER_MAP_CLIENT_ID = 'OykAVAy8XlxheHOXk9kBLmxn9r7qK8jffJES2Lgo';

// 네이버 지도 스크립트 로드
function loadNaverMapScript() {
  return new Promise((resolve, reject) => {
    // 이미 로드되었는지 확인
    if (window.naver && window.naver.maps && window.naver.maps.Service) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // submodules=geocoder 파라미터 추가 - geocoding 서비스 사용을 위해 필수
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.onload = () => {
      // geocoder 로드 확인
      if (window.naver && window.naver.maps && window.naver.maps.Service) {
        console.log('Naver Maps API with geocoder loaded successfully');
        resolve();
      } else {
        reject(new Error('Naver Maps geocoder service not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Naver Map script'));
    document.head.appendChild(script);
  });
}

// 학교 위치 지도 초기화
async function initSchoolLocationMap(containerId, options = {}) {
  try {
    await loadNaverMapScript();

    const {
      lat = 37.5665, // 기본: 서울시청
      lng = 126.9780,
      zoom = 16,
      schoolName = '우리 학교',
      address = ''
    } = options;

    const mapOptions = {
      center: new naver.maps.LatLng(lat, lng),
      zoom: zoom,
      zoomControl: true,
      zoomControlOptions: {
        style: naver.maps.ZoomControlStyle.SMALL,
        position: naver.maps.Position.TOP_RIGHT
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: naver.maps.MapTypeControlStyle.BUTTON,
        position: naver.maps.Position.TOP_LEFT
      }
    };

    const map = new naver.maps.Map(containerId, mapOptions);

    // 마커 추가
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: schoolName
    });

    // 정보 창 추가
    const contentString = `
      <div style="padding:15px;min-width:200px;">
        <h4 style="margin:0 0 10px 0;font-size:16px;font-weight:600;">${schoolName}</h4>
        ${address ? `<p style="margin:0;font-size:13px;color:#666;">${address}</p>` : ''}
      </div>
    `;

    const infowindow = new naver.maps.InfoWindow({
      content: contentString,
      backgroundColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      anchorSize: new naver.maps.Size(10, 10),
      pixelOffset: new naver.maps.Point(0, -10)
    });

    // 마커 클릭 시 정보창 표시
    naver.maps.Event.addListener(marker, 'click', function() {
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker);
      }
    });

    // 기본적으로 정보창 열어두기
    infowindow.open(map, marker);

    return { map, marker, infowindow };
  } catch (error) {
    console.error('Error initializing Naver Map:', error);
    throw error;
  }
}

// 여러 위치를 표시하는 지도 (학생 주소 등)
async function initMultiLocationMap(containerId, locations = []) {
  try {
    await loadNaverMapScript();

    if (locations.length === 0) {
      throw new Error('No locations provided');
    }

    // 중심점 계산
    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    const mapOptions = {
      center: new naver.maps.LatLng(avgLat, avgLng),
      zoom: 13,
      zoomControl: true,
      zoomControlOptions: {
        style: naver.maps.ZoomControlStyle.SMALL,
        position: naver.maps.Position.TOP_RIGHT
      }
    };

    const map = new naver.maps.Map(containerId, mapOptions);
    const markers = [];
    const infowindows = [];

    // 각 위치에 마커 추가
    locations.forEach((location, index) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(location.lat, location.lng),
        map: map,
        title: location.title || `위치 ${index + 1}`
      });

      const contentString = `
        <div style="padding:10px;min-width:150px;">
          <h5 style="margin:0 0 5px 0;font-size:14px;font-weight:600;">${location.title || '위치'}</h5>
          ${location.description ? `<p style="margin:0;font-size:12px;color:#666;">${location.description}</p>` : ''}
        </div>
      `;

      const infowindow = new naver.maps.InfoWindow({
        content: contentString,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        anchorSize: new naver.maps.Size(10, 10),
        pixelOffset: new naver.maps.Point(0, -10)
      });

      naver.maps.Event.addListener(marker, 'click', function() {
        // 다른 정보창 닫기
        infowindows.forEach(iw => iw.close());

        infowindow.open(map, marker);
      });

      markers.push(marker);
      infowindows.push(infowindow);
    });

    // 모든 마커가 보이도록 지도 범위 조정
    const bounds = new naver.maps.LatLngBounds();
    markers.forEach(marker => {
      bounds.extend(marker.getPosition());
    });
    map.fitBounds(bounds);

    return { map, markers, infowindows };
  } catch (error) {
    console.error('Error initializing multi-location map:', error);
    throw error;
  }
}

// 주소로 좌표 검색 (Geocoding)
async function searchAddress(address) {
  try {
    await loadNaverMapScript();

    return new Promise((resolve, reject) => {
      naver.maps.Service.geocode({
        query: address
      }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
          reject(new Error('Geocoding failed'));
          return;
        }

        if (response.v2.meta.totalCount === 0) {
          reject(new Error('No results found'));
          return;
        }

        const result = response.v2.addresses[0];
        resolve({
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
          address: result.roadAddress || result.jibunAddress,
          roadAddress: result.roadAddress,
          jibunAddress: result.jibunAddress
        });
      });
    });
  } catch (error) {
    console.error('Error searching address:', error);
    throw error;
  }
}

// 좌표로 주소 검색 (Reverse Geocoding)
async function searchCoordinates(lat, lng) {
  try {
    await loadNaverMapScript();

    return new Promise((resolve, reject) => {
      naver.maps.Service.reverseGeocode({
        coords: new naver.maps.LatLng(lat, lng)
      }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
          reject(new Error('Reverse geocoding failed'));
          return;
        }

        const result = response.v2.address;
        resolve({
          roadAddress: result.roadAddress,
          jibunAddress: result.jibunAddress,
          address: result.roadAddress || result.jibunAddress
        });
      });
    });
  } catch (error) {
    console.error('Error searching coordinates:', error);
    throw error;
  }
}

// 사용 예시를 위한 함수
window.NaverMapUtils = {
  loadScript: loadNaverMapScript,
  initSchoolLocationMap,
  initMultiLocationMap,
  searchAddress,
  searchCoordinates
};
