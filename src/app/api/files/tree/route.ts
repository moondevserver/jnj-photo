import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".zip"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];
const EXCLUDED_DIRECTORIES = ['@eaDir', '#recycle'];
const ROOT_PATHS = ['/nas/photo', '/nas/image'];

function getMimeType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".zip": "application/zip",
  };
  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}

interface DirectoryEntry {
  name: string;
  path: string;
  type: "directory" | "file";
  fileType?: string;
  children?: DirectoryEntry[];
}

function buildDirectoryTree(dirPath: string): DirectoryEntry | null {
  try {
    const stats = fs.statSync(dirPath);
    const name = path.basename(dirPath);

    // 시스템 폴더 제외
    if (EXCLUDED_DIRECTORIES.includes(name)) {
      return null;
    }

    if (stats.isDirectory()) {
      const children: DirectoryEntry[] = [];
      const entries = fs.readdirSync(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const childEntry = buildDirectoryTree(fullPath);
        if (childEntry) {
          children.push(childEntry);
        }
      }

      // 디렉토리 내의 파일/폴더를 이름순으로 정렬
      children.sort((a, b) => {
        // 폴더를 파일보다 먼저 표시
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        // 같은 타입인 경우 이름순 정렬
        return a.name.localeCompare(b.name, 'ko');
      });

      return {
        name,
        path: dirPath,
        type: "directory",
        children,
      };
    } else {
      const ext = path.extname(dirPath).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        return {
          name,
          path: dirPath,
          type: "file",
          fileType: getMimeType(ext),
        };
      }
    }
  } catch (error) {
    console.error(`Error processing path ${dirPath}:`, error);
  }
  return null;
}

export async function GET() {
  try {
    const rootEntries: DirectoryEntry[] = [];

    for (const rootPath of ROOT_PATHS) {
      if (fs.existsSync(rootPath)) {
        const tree = buildDirectoryTree(rootPath);
        if (tree) {
          rootEntries.push(tree);
        }
      }
    }

    return NextResponse.json(rootEntries);
  } catch (error) {
    console.error("Error building directory tree:", error);
    return NextResponse.json(
      { error: "Failed to build directory tree" },
      { status: 500 }
    );
  }
} 