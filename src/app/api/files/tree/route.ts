import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const ROOT_PATH = "/nas/photo";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

interface TreeNode {
  name: string;
  path: string;
  type: "directory" | "file";
  children?: TreeNode[];
  fileType?: string;
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

function buildDirectoryTree(dirPath: string): TreeNode {
  try {
    const stats = fs.statSync(dirPath);
    const name = path.basename(dirPath);

    if (!stats.isDirectory()) {
      const ext = path.extname(dirPath).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        return {
          name,
          path: dirPath,
          type: "file",
          fileType: getMimeType(ext),
        };
      }
      return null as any; // 이미지가 아닌 파일은 무시
    }

    const children: TreeNode[] = [];
    const entries = fs.readdirSync(dirPath);

    for (const entry of entries) {
      // 시스템 폴더 제외
      if (entry === "@eaDir" || entry === "#recycle") {
        continue;
      }

      const fullPath = path.join(dirPath, entry);
      try {
        const child = buildDirectoryTree(fullPath);
        if (child) {
          children.push(child);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
        // 개별 파일/디렉토리 오류는 무시하고 계속 진행
      }
    }

    return {
      name,
      path: dirPath,
      type: "directory",
      children: children.length > 0 ? children : undefined,
    };
  } catch (error) {
    console.error(`Error building tree for ${dirPath}:`, error);
    throw error;
  }
}

export async function GET() {
  try {
    // 루트 디렉토리가 존재하는지 확인
    if (!fs.existsSync(ROOT_PATH)) {
      return NextResponse.json(
        { error: "Root directory not found" },
        { status: 404 }
      );
    }

    const tree = buildDirectoryTree(ROOT_PATH);
    return NextResponse.json(tree);
  } catch (error) {
    console.error("Error in GET /api/files/tree:", error);
    return NextResponse.json(
      { error: "Failed to read directory" },
      { status: 500 }
    );
  }
} 