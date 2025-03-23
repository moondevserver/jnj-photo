"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Image, FileArchive, Info } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { FileDetailDialog } from "./file-detail-dialog";

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

interface FilesTableProps {
  path: string;
}

async function getFiles(path: string): Promise<FileInfo[]> {
  const protocol = window.location.protocol;
  const host = window.location.host;
  const res = await fetch(
    `${protocol}//${host}/api/files?path=${encodeURIComponent(path)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch files");
  }
  return res.json();
}

export function FilesTable({ path }: FilesTableProps) {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, [path]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type === "application/zip") return <FileArchive className="h-4 w-4" />;
    return null;
  };

  const handleFileClick = (file: FileInfo) => {
    setSelectedFile(file);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="파일명으로 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>유형</TableHead>
              <TableHead>파일명</TableHead>
              <TableHead>크기</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead>수정일</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchTerm ? "검색 결과가 없습니다." : "파일이 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((file) => (
                <TableRow key={file.path}>
                  <TableCell>{getFileIcon(file.type)}</TableCell>
                  <TableCell>
                    <button
                      className="hover:underline text-left"
                      onClick={() => handleFileClick(file)}
                    >
                      {file.name}
                    </button>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell>{formatDate(file.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleFileClick(file)}>
                          <Info className="mr-2 h-4 w-4" />
                          상세 정보
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <FileDetailDialog
        file={selectedFile}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
} 