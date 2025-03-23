"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DirectoryTree } from "@/components/files/directory-tree";
import { FilesTable } from "@/components/files/files-table";

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    takenAt?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    dimensions?: {
      width: number;
      height: number;
    };
    camera?: {
      make?: string;
      model?: string;
    };
  };
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = searchParams.get("path") || "/nas/photo";
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleFileSelect = (file: FileInfo | null) => {
    setSelectedFile(file);
    if (file?.type === "application/zip") {
      // ZIP 파일인 경우 zip=true 파라미터를 추가하여 경로 변경
      const params = new URLSearchParams();
      params.set("path", file.path);
      params.set("zip", "true");
      router.push(`/?${params.toString()}`);
      setIsDetailOpen(false);
    } else if (file?.type === "directory") {
      // 디렉토리인 경우 일반 경로로 변경
      const params = new URLSearchParams();
      params.set("path", file.path);
      router.push(`/?${params.toString()}`);
      setIsDetailOpen(false);
    } else {
      setIsDetailOpen(true);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        <DirectoryTree onFileSelect={handleFileSelect} />
      </div>
      <div className="flex-1 p-4">
        <FilesTable
          path={currentPath}
          selectedFile={selectedFile}
          setSelectedFile={handleFileSelect}
          isDetailOpen={isDetailOpen}
          setIsDetailOpen={setIsDetailOpen}
        />
      </div>
    </div>
  );
} 