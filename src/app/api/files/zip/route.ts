import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

interface ZipEntry {
  name: string;
  path: string;
  size: number;
  type: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zipPath = searchParams.get("path");

    if (!zipPath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // ZIP 파일 존재 여부 확인
    if (!fs.existsSync(zipPath)) {
      return NextResponse.json(
        { error: "ZIP file not found" },
        { status: 404 }
      );
    }

    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    const imageEntries: ZipEntry[] = [];

    for (const entry of entries) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        imageEntries.push({
          name: entry.name,
          path: entry.entryName,
          size: entry.header.size,
          type: `image/${ext.slice(1)}`,
        });
      }
    }

    return NextResponse.json(imageEntries);
  } catch (error) {
    console.error("Error reading ZIP file:", error);
    return NextResponse.json(
      { error: "Failed to read ZIP file" },
      { status: 500 }
    );
  }
}