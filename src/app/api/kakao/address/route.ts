import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  console.log('Kakao Address API Request:', { latitude, longitude });

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;
    console.log('Kakao API URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
      }
    });

    if (!response.ok) {
      console.error('Kakao API Error:', response.status, response.statusText);
      throw new Error(`Kakao API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Kakao API Response:', data);

    // 응답 데이터 구조 확인 및 처리
    if (!data.documents || data.documents.length === 0) {
      console.log('No address found for the coordinates');
      return NextResponse.json({ documents: [] });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
} 