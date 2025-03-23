import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime-types";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get("path");

    if (!filePath) {
      return new NextResponse("File path is required", { status: 400 });
    }

    // 파일 확장자 확인
    const ext = path.extname(filePath).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      return new NextResponse("Invalid file type", { status: 400 });
    }

    // 파일 존재 여부 확인
    try {
      await fs.access(filePath);
    } catch (error) {
      return new NextResponse("File not found", { status: 404 });
    }

    // 파일 읽기
    const buffer = await fs.readFile(filePath);
    const contentType = mime.lookup(filePath) || "application/octet-stream";

    // 이미지 반환
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 