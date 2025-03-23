카카오 지도 API SDK를 추가했습니다.
GPS 좌표를 주소로 변환하는 기능을 구현했습니다.
위치 정보 표시 순서를 다음과 같이 변경했습니다:
주소 (예: "서울특별시 강남구 삼성동")
GPS 좌표 (회색으로 표시)
"지도에서 보기" 링크
이 기능을 사용하려면 카카오 개발자 사이트(https://developers.kakao.com)에서 API 키를 발급받아 .env.local 파일의 NEXT_PUBLIC_KAKAO_MAP_API_KEY 값을 실제 API 키로 교체해야 합니다. API 키를 발급받으시면 알려주세요.


https://developers.kakao.com/console/app

- 카카오맵: 활성화
- Client Secret
토큰 발급 시, 보안을 강화하기 위해 Client Secret을 사용할 수 있습니다. (REST API인 경우에 해당)

코드	QeuBDfIC9riZTJ1aNQ3NVa7Rf4EISJDU재발급
활성화 상태	사용함설정

- 앱 설정 > 앱키 > JavaScript 키: asdfsdfsdf
- 고급설정 > 허용 IP 주소: 14.34.23.70

REST API 키를 사용해야 합니다.
카카오 개발자 사이트(https://developers.kakao.com)에서:
애플리케이션 > 앱 설정 > 요약 정보에서 "JavaScript 키"를 찾을 수 있습니다.
Client Secret은 서버에서만 사용하는 비밀키이므로 여기서는 사용하지 않습니다.
JavaScript 키는 웹 브라우저에서 실행되는 카카오 맵 API에 사용됩니다.
추가로, JavaScript 키를 발급받은 후에는:
앱 설정 > 플랫폼 > Web 플랫폼 등록에서
사이트 도메인을 등록해야 합니다 (예: http://localhost:3000, 실제 서비스 도메인 등)

REST API 키
JavaScript 키를 받으시면 .env.local 파일의 NEXT_PUBLIC_KAKAO_MAP_REST_KEY 값을 해당 키로 교체하면 됩니다.


next-kmc-web-app

ID 1143551OWNERWeb
앱 키
플랫폼	앱 키	재발급
네이티브 앱 키	sdfsdfsdfs복사	재발급
REST API 키	aasdafsdfsd복사	재발급
JavaScript 키	asdfsdfsdf복사	재발급
Admin 키	asdfsdf복사	재발급