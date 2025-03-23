import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import path from "path";
import mime from "mime-types";
import * as exifr from 'exifr';

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".zip"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

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
        
        console.log('Raw EXIF data:', exif);
        console.log('Raw GPS data:', gps);
        
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
        
        console.log('Extracted metadata:', result);
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

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dirPath = searchParams.get("path");

    console.log("Requested directory path:", dirPath);

    if (!dirPath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // 디렉토리가 존재하는지 확인
    if (!fs.existsSync(dirPath)) {
      console.error(`Directory not found: ${dirPath}`);
      return NextResponse.json(
        { error: `Directory not found: ${dirPath}` },
        { status: 404 }
      );
    }

    // 디렉토리 접근 권한 확인
    try {
      fs.accessSync(dirPath, fs.constants.R_OK);
    } catch (error) {
      console.error(`Permission denied for directory: ${dirPath}`, error);
      return NextResponse.json(
        { error: `Permission denied for directory: ${dirPath}` },
        { status: 403 }
      );
    }

    // 디렉토리 내용 읽기
    const items = fs.readdirSync(dirPath);
    console.log(`Found ${items.length} items in directory`);

    const files: FileInfo[] = [];

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      try {
        const stats = fs.statSync(fullPath);

        if (stats.isFile()) {
          // 이미지 파일만 포함
          const ext = path.extname(item).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            const fileInfo = await getFileStats(fullPath);
            files.push(fileInfo);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${fullPath}:`, error);
        // 개별 파일 오류는 건너뛰고 계속 진행
        continue;
      }
    }

    console.log(`Returning ${files.length} files`);
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error reading directory:", error);
    return NextResponse.json(
      { 
        error: "Failed to read directory",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 