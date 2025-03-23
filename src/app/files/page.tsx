"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DirectoryTree } from "@/components/files/directory-tree";
import { FilesTable } from "@/components/files/files-table";

const ROOT_PATH = "/nas/photo";

export default function FilesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPath = searchParams.get("path") || ROOT_PATH;

  const handlePathSelect = (path: string) => {
    router.push(`/files?path=${encodeURIComponent(path)}`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">파일 목록</h1>
      <div className="grid grid-cols-[300px_1fr] gap-6">
        <div className="sticky top-6">
          <DirectoryTree
            onSelect={handlePathSelect}
            selectedPath={currentPath}
          />
        </div>
        <div>
          <FilesTable path={currentPath} />
        </div>
      </div>
    </div>
  );
} 