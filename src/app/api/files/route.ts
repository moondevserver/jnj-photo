import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import mime from "mime-types";
import * as exifr from 'exifr';

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".zip"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];
const EXCLUDED_DIRECTORIES = ['@eaDir', '#recycle'];

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    takenAt?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

async function extractImageMetadata(filePath: string) {
  try {
    // JPEG 파일의 EXIF 데이터 추출
    if (path.extname(filePath).toLowerCase() === '.jpg' || path.extname(filePath).toLowerCase() === '.jpeg') {
      try {
        console.log(`Extracting EXIF data from ${filePath}`);
        
        // 기본 EXIF 데이터 추출
        const exif = await exifr.parse(filePath, {
          pick: [
            'DateTimeOriginal',
            'Make',
            'Model',
            'ImageWidth',
            'ImageHeight'
          ]
        });
        
        // GPS 데이터 별도 추출
        const gps = await exifr.gps(filePath);
        
        if (!exif && !gps) {
          console.log('No metadata found');
          return null;
        }
        
        const result: any = {};
        
        // 촬영 시간
        if (exif?.DateTimeOriginal) {
          result.takenAt = new Date(exif.DateTimeOriginal).toISOString();
        }
        
        // GPS 정보
        if (gps?.latitude && gps?.longitude) {
          result.location = {
            latitude: gps.latitude,
            longitude: gps.longitude,
          };
        }
        
        // 이미지 크기
        if (exif?.ImageWidth && exif?.ImageHeight) {
          result.dimensions = {
            width: exif.ImageWidth,
            height: exif.ImageHeight,
          };
        }
        
        // 카메라 정보
        if (exif?.Make || exif?.Model) {
          result.camera = {
            make: exif.Make,
            model: exif.Model,
          };
        }
        
        return result;
      } catch (error) {
        console.warn(`Error parsing EXIF data from ${filePath}:`, error);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

async function getFileStats(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    const type = mime.lookup(filePath) || "application/octet-stream";
    const isImage = IMAGE_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
    
    const metadata = isImage ? await extractImageMetadata(filePath) : null;
    
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      type,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      metadata,
    };
  } catch (error) {
    console.error(`Error getting stats for file ${filePath}:`, error);
    throw error;
  }
}

function getMimeType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };
  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dirPath = searchParams.get("path");

    if (!dirPath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // 디렉토리 존재 여부 확인
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 }
      );
    }

    // 디렉토리 읽기 권한 확인
    try {
      fs.accessSync(dirPath, fs.constants.R_OK);
    } catch (error) {
      return NextResponse.json(
        { error: "No read permission for directory" },
        { status: 403 }
      );
    }

    const files = fs.readdirSync(dirPath);
    const fileInfos: FileInfo[] = [];

    for (const file of files) {
      // 시스템 폴더 제외
      if (file === "@eaDir" || file === "#recycle") {
        continue;
      }

      const fullPath = path.join(dirPath, file);
      try {
        const stats = fs.statSync(fullPath);

        // 디렉토리는 제외하고 이미지 파일만 포함
        if (!stats.isDirectory()) {
          const ext = path.extname(file).toLowerCase();
          if (IMAGE_EXTENSIONS.includes(ext)) {
            fileInfos.push({
              name: file,
              path: fullPath,
              size: stats.size,
              type: getMimeType(ext),
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
            });
          }
        }
      } catch (error) {
        console.error(`Error processing file ${fullPath}:`, error);
        // 개별 파일 오류는 무시하고 계속 진행
      }
    }

    // 파일명으로 정렬
    fileInfos.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    return NextResponse.json(fileInfos);
  } catch (error) {
    console.error("Error in GET /api/files:", error);
    return NextResponse.json(
      { error: "Failed to read directory" },
      { status: 500 }
    );
  }
} 