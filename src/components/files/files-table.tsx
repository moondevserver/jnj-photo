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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Image, FileArchive, Info, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { FileDetailDialog } from "./file-detail-dialog";

// 환경 변수에서 페이지당 파일 개수 가져오기 (기본값: 20)
const FILES_PER_PAGE = process.env.NEXT_PUBLIC_FILES_PER_PAGE ? parseInt(process.env.NEXT_PUBLIC_FILES_PER_PAGE) : 20;

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
  selectedFile: FileInfo | null;
  setSelectedFile: (file: FileInfo | null) => void;
  isDetailOpen: boolean;
  setIsDetailOpen: (open: boolean) => void;
}

type SortField = "name" | "size" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

async function fetchFiles(path: string): Promise<FileInfo[]> {
  const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch files");
  }
  
  return response.json();
}

export function FilesTable({ 
  path, 
  selectedFile, 
  setSelectedFile, 
  isDetailOpen, 
  setIsDetailOpen 
}: FilesTableProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFiles(path);
      setFiles(data);
      setCurrentPage(1); // 새로운 데이터를 불러올 때 첫 페이지로 이동
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(error instanceof Error ? error.message : "파일 목록을 불러올 수 없습니다");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [path]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === "asc" ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortFiles = (files: FileInfo[]) => {
    return [...files].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name, 'ko');
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = sortFiles(filteredFiles);

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedFiles.length / FILES_PER_PAGE);
  const startIndex = (currentPage - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;
  const currentFiles = sortedFiles.slice(startIndex, endIndex);

  const handleFileClick = (file: FileInfo) => {
    setSelectedFile(file);
    setIsDetailOpen(true);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type === "application/zip") return <FileArchive className="h-4 w-4" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <span className="text-sm text-gray-500">파일 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="파일명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={loadFiles}
          disabled={isLoading}
          title="새로고침"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-600 mb-2">{error}</p>
          <Button
            variant="outline"
            onClick={loadFiles}
            disabled={isLoading}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSort("name")}
                    >
                      파일명 {getSortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSort("size")}
                    >
                      크기 {getSortIcon("size")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSort("createdAt")}
                    >
                      생성일 {getSortIcon("createdAt")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSort("updatedAt")}
                    >
                      수정일 {getSortIcon("updatedAt")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {searchTerm ? "검색 결과가 없습니다." : "파일이 없습니다."}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentFiles.map((file) => (
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

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
      <FileDetailDialog
        file={selectedFile}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
} 