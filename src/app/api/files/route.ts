import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime-types";
import * as exifr from 'exifr';

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".zip"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

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
    const stats = await fs.stat(filePath);
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dirPath = searchParams.get("path");

    console.log("Requested directory path:", dirPath);

    if (!dirPath) {
      return NextResponse.json(
        { error: "Directory path is required" },
        { status: 400 }
      );
    }

    // 현재 작업 디렉토리 확인
    const cwd = process.cwd();
    console.log("Current working directory:", cwd);

    // 디렉토리 존재 여부 확인
    try {
      const dirStats = await fs.stat(dirPath);
      console.log("Directory stats:", {
        isDirectory: dirStats.isDirectory(),
        permissions: dirStats.mode.toString(8),
        uid: dirStats.uid,
        gid: dirStats.gid
      });

      if (!dirStats.isDirectory()) {
        return NextResponse.json(
          { error: "Path is not a directory" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error accessing directory:", error);
      return NextResponse.json(
        { 
          error: "Directory not found or permission denied",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 404 }
      );
    }

    // 디렉토리 내 파일 목록 가져오기
    console.log("Reading directory contents...");
    const files = await fs.readdir(dirPath);
    console.log("Found files:", files);
    
    // 지원하는 확장자를 가진 파일만 필터링
    const supportedFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const isSupported = SUPPORTED_EXTENSIONS.includes(ext);
      console.log(`File ${file}: extension ${ext}, supported: ${isSupported}`);
      return isSupported;
    });

    console.log("Supported files:", supportedFiles);

    // 각 파일의 상세 정보 가져오기
    const fileInfos = await Promise.all(
      supportedFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        try {
          return await getFileStats(filePath);
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
          return null;
        }
      })
    );

    // null 값 제거 및 정렬
    const validFileInfos = fileInfos
      .filter((info): info is NonNullable<typeof info> => info !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log("Returning file infos:", validFileInfos);
    return NextResponse.json(validFileInfos);
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