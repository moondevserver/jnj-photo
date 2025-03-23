"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import * as path from "path";

interface DirectoryEntry {
  name: string;
  path: string;
  type: "directory" | "file";
  fileType?: string;
  children?: DirectoryEntry[];
}

interface TreeNodeProps {
  entry: DirectoryEntry;
  level: number;
  selectedPath: string | null;
  onFileSelect?: (file: FileInfo | null) => void;
}

interface DirectoryTreeProps {
  onFileSelect?: (file: FileInfo | null) => void;
}

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

function TreeNode({ entry, level, selectedPath, onFileSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const isSelected = selectedPath === entry.path;
  const hasChildren = entry.children && entry.children.length > 0;

  const handleClick = () => {
    if (entry.type === "directory") {
      setIsExpanded(!isExpanded);
      router.push(`/?path=${encodeURIComponent(entry.path)}`);
    } else if (entry.fileType === "application/zip" && onFileSelect) {
      // ZIP 파일인 경우 onFileSelect 호출
      onFileSelect({
        name: entry.name,
        path: entry.path,
        type: entry.fileType,
        size: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      router.push(`/?path=${encodeURIComponent(path.dirname(entry.path))}`);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 ${
          isSelected ? "bg-blue-100" : ""
        }`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
      >
        {entry.type === "directory" ? (
          <>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4" />
            )}
            <Folder className="w-4 h-4" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4" />
          </>
        )}
        <span className="truncate">{entry.name}</span>
      </div>
      {isExpanded && entry.children && (
        <div>
          {entry.children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              level={level + 1}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DirectoryTree({ onFileSelect }: DirectoryTreeProps) {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const searchParams = useSearchParams();
  const selectedPath = searchParams.get("path");

  useEffect(() => {
    async function fetchDirectoryTree() {
      try {
        const response = await fetch("/api/files/tree");
        if (!response.ok) {
          throw new Error("Failed to fetch directory tree");
        }
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error("Error fetching directory tree:", error);
      }
    }

    fetchDirectoryTree();
  }, []);

  return (
    <div className="overflow-auto">
      {entries.map((entry) => (
        <TreeNode
          key={entry.path}
          entry={entry}
          level={0}
          selectedPath={selectedPath}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
} 