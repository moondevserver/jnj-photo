"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, File, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  name: string;
  path: string;
  type: "directory" | "file";
  children?: TreeNode[];
  fileType?: string;
}

interface DirectoryTreeProps {
  onSelect: (path: string, type: "directory" | "file", fileType?: string) => void;
  selectedPath: string;
}

async function fetchDirectoryTree(): Promise<TreeNode> {
  const response = await fetch("/api/files/tree");
  if (!response.ok) {
    throw new Error("Failed to fetch directory tree");
  }
  return response.json();
}

export function DirectoryTree({ onSelect, selectedPath }: DirectoryTreeProps) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTree = async () => {
      try {
        const data = await fetchDirectoryTree();
        setTree(data);
        // 기본적으로 루트 노드는 확장
        setExpandedNodes(new Set([data.path]));
      } catch (error) {
        console.error("Error fetching directory tree:", error);
        setError(error instanceof Error ? error.message : "디렉토리 트리를 불러올 수 없습니다");
      }
    };
    loadTree();
  }, []);

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.startsWith("image/")) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const isSelected = node.path === selectedPath;
    const paddingLeft = `${level * 16}px`;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer",
            isSelected && "bg-blue-100 hover:bg-blue-200"
          )}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.type === "directory") {
              toggleNode(node.path);
            }
            onSelect(node.path, node.type, node.fileType);
          }}
        >
          {node.type === "directory" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.path);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <Folder className="h-4 w-4 text-blue-500 mr-2" />
            </>
          ) : (
            <>
              <span className="w-6" /> {/* 파일 들여쓰기를 위한 공간 */}
              {getFileIcon(node.fileType)}
              <span className="ml-2" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === "directory" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return <div className="overflow-auto">{renderNode(tree)}</div>;
} 