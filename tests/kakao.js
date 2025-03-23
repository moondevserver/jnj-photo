// Kakao Maps API 테스트
require('dotenv').config({ path: '../.env.local' });

console.log(`KAKAO_REST_API_KEY: ${process.env.KAKAO_REST_API_KEY}`);

const testCoordinates = [
  {
    name: '인천 논현동 테스트',
    latitude: 37.413056,
    longitude: 126.681389
  },
  {
    name: '서울 강남 테스트',
    latitude: 37.498095,
    longitude: 127.027610
  }
];

async function testKakaoMapsAPI() {
  try {
    // API 키 확인
    const apiKey = process.env.KAKAO_REST_API_KEY;
    if (!apiKey) {
      console.error('Error: KAKAO_REST_API_KEY is not set');
      return;
    }
    console.log('API Key:', apiKey);

    // Node.js 환경에서 Kakao Maps API 사용을 위한 설정
    const { default: fetch } = await import('node-fetch');
    
    // 각 좌표에 대해 주소 변환 테스트
    for (const coord of testCoordinates) {
      console.log(`\nTesting coordinates for ${coord.name}:`);
      console.log(`Latitude: ${coord.latitude}, Longitude: ${coord.longitude}`);

      // Kakao Maps Geocoding API 호출
      const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${coord.longitude}&y=${coord.latitude}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `KakaoAK ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('\nAPI Response:', JSON.stringify(data, null, 2));

      if (data.documents && data.documents.length > 0) {
        const address = data.documents[0];
        console.log('\nFound address:');
        if (address.road_address) {
          console.log('도로명 주소:', address.road_address.address_name);
        }
        if (address.address) {
          console.log('지번 주소:', address.address.address_name);
        }
      } else {
        console.log('No address found for these coordinates');
      }
    }

  } catch (error) {
    console.error('Error testing Kakao Maps API:', error);
  }
}

// 테스트 실행
console.log('Starting Kakao Maps API test...\n');
testKakaoMapsAPI().then(() => {
  console.log('\nKakao Maps API test completed');
});
