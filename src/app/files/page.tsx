"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DirectoryTree } from "@/components/files/directory-tree";
import { FilesTable } from "@/components/files/files-table";
import { FileDetailDialog } from "@/components/files/file-detail-dialog";

const ROOT_PATH = "/nas/photo";

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

async function fetchFileInfo(path: string): Promise<FileInfo> {
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  const response = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch file info");
  }
  const files = await response.json();
  const file = files.find((f: FileInfo) => f.path === path);
  if (!file) {
    throw new Error("File not found");
  }
  return file;
}

export default function FilesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathParam = searchParams.get("path") || ROOT_PATH;
  
  // URL의 경로가 파일인지 확인
  const isFile = [".jpg", ".jpeg", ".png", ".gif"].some(ext => 
    pathParam.toLowerCase().endsWith(ext)
  );
  
  // 파일인 경우 부모 디렉토리를 currentPath로 설정
  const currentPath = isFile ? pathParam.substring(0, pathParam.lastIndexOf('/')) : pathParam;
  
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // URL이 파일을 가리키는 경우 자동으로 파일 정보를 가져와서 모달 표시
  useEffect(() => {
    if (isFile) {
      (async () => {
        try {
          const fileInfo = await fetchFileInfo(pathParam);
          setSelectedFile(fileInfo);
          setIsDetailOpen(true);
        } catch (error) {
          console.error("Error fetching file info:", error);
        }
      })();
    }
  }, [pathParam]);

  const handlePathSelect = async (path: string, type: "directory" | "file", fileType?: string) => {
    // ZIP 파일인 경우 경로를 변경하지 않고 ZIP 파일 내용을 표시
    if (type === "file" && fileType === "application/zip") {
      router.push(`/files?path=${encodeURIComponent(path)}&zip=true`);
      return;
    }
    
    // 디렉토리인 경우에만 경로 변경
    if (type === "directory") {
      router.push(`/files?path=${encodeURIComponent(path)}`);
    }
    
    // 이미지 파일인 경우 모달 표시
    if (type === "file" && fileType?.startsWith("image/")) {
      try {
        const fileInfo = await fetchFileInfo(path);
        setSelectedFile(fileInfo);
        setIsDetailOpen(true);
      } catch (error) {
        console.error("Error fetching file info:", error);
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">파일 목록</h1>
      <div className="grid grid-cols-[300px_1fr] gap-6">
        <div className="sticky top-6">
          <DirectoryTree
            onSelect={handlePathSelect}
            selectedPath={isFile ? pathParam : currentPath}
          />
        </div>
        <div>
          <FilesTable 
            path={currentPath}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isDetailOpen={isDetailOpen}
            setIsDetailOpen={setIsDetailOpen}
          />
        </div>
      </div>
      <FileDetailDialog
        file={selectedFile}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
} 