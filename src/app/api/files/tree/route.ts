import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import path from "path";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  hasChildren?: boolean;
}

// 제외할 시스템 폴더 목록
const EXCLUDED_DIRECTORIES = ['@eaDir', '#recycle'];

function getDirectoryContents(dirPath: string): TreeNode[] {
  try {
    // 디렉토리 존재 여부 먼저 확인
    if (!fs.existsSync(dirPath)) {
      console.error(`Directory does not exist: ${dirPath}`);
      return [];
    }

    // 디렉토리 읽기 권한 확인
    try {
      fs.accessSync(dirPath, fs.constants.R_OK);
    } catch (error) {
      console.error(`No read permission for directory: ${dirPath}`);
      return [];
    }

    const items = fs.readdirSync(dirPath);
    const nodes: TreeNode[] = [];

    for (const item of items) {
      // 제외할 시스템 폴더 건너뛰기
      if (EXCLUDED_DIRECTORIES.includes(item)) {
        continue;
      }

      const fullPath = path.join(dirPath, item);
      try {
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // 디렉토리인 경우 자식 존재 여부만 간단히 확인
          let hasChildren = false;
          try {
            const children = fs.readdirSync(fullPath)
              .filter(child => !EXCLUDED_DIRECTORIES.includes(child));
            hasChildren = children.length > 0;
          } catch (error) {
            console.warn(`Cannot read children of directory: ${fullPath}`);
          }

          nodes.push({
            name: item,
            path: fullPath,
            type: "directory",
            hasChildren
          });
        } else {
          // 이미지 파일만 포함
          const ext = path.extname(item).toLowerCase();
          if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
            nodes.push({
              name: item,
              path: fullPath,
              type: "file"
            });
          }
        }
      } catch (error) {
        console.warn(`Skipping item ${fullPath}: ${error}`);
        continue;
      }
    }

    // 디렉토리 먼저, 그 다음 파일 순으로 정렬
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name, 'ko');
      }
      return a.type === "directory" ? -1 : 1;
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
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

    console.log(`Fetching contents for directory: ${dirPath}`);
    const startTime = Date.now();
    
    const nodes = getDirectoryContents(dirPath);
    
    const endTime = Date.now();
    console.log(`Directory contents fetched in ${endTime - startTime}ms`);

    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Error processing directory tree request:", error);
    return NextResponse.json(
      { error: "Failed to build directory tree" },
      { status: 500 }
    );
  }
} 